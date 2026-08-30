import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Parser from 'rss-parser';
import { NewsArticle, CreateNewsArticleDTO } from '../../modules/newsArticle/newsArticle.entity';
import { NEWS_FEEDS, NewsFeed } from './news-feeds.config';

export type NewsItemOutcome = 'saved' | 'duplicate' | 'skipped' | 'failed';

export type NewsAggregationStats = {
  processed: number;
  saved: number;
  duplicates: number;
  skipped: number;
  failed: number;
  /** @deprecated Use `failed` — kept for backward compatibility */
  errors: number;
};

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  isoDate?: string;
  enclosure?: {
    url?: string;
    type?: string;
  };
  'media:content'?: {
    $?: {
      url?: string;
    };
  };
  'media:thumbnail'?: {
    $?: {
      url?: string;
    };
  };
}

@Injectable()
export class NewsAggregatorService {
  private readonly logger = new Logger(NewsAggregatorService.name);
  private readonly parser: Parser;

  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsArticleRepository: Repository<NewsArticle>,
  ) {
    // Configure RSS parser with custom fields
    this.parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['media:thumbnail', 'mediaThumbnail'],
          ['content:encoded', 'contentEncoded'],
        ],
      },
      timeout: 10000, // 10 second timeout
    });
  }

  /**
   * Extract image URL from RSS item
   */
  private extractImageUrl(item: RSSItem): string | undefined {
    // Try different common image sources in RSS feeds
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
      return item.enclosure.url;
    }
    
    if (item['media:content']?.$?.url) {
      return item['media:content'].$.url;
    }
    
    if (item['media:thumbnail']?.$?.url) {
      return item['media:thumbnail'].$.url;
    }

    // Try to extract from content HTML
    if (item.content) {
      const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }

    return undefined;
  }

  /**
   * Clean and extract summary from content
   */
  private extractSummary(item: RSSItem, maxLength: number = 300): string {
    // Prefer contentSnippet if available
    if (item.contentSnippet) {
      return item.contentSnippet.substring(0, maxLength);
    }

    // Extract text from HTML content
    if (item.content) {
      // Remove HTML tags
      const text = item.content
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      return text.substring(0, maxLength);
    }

    return '';
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateString?: string): Date {
    if (!dateString) {
      return new Date();
    }

    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  /**
   * Extract category from title or content
   */
  private extractCategory(item: RSSItem, feedCategory?: string): string | undefined {
    // Use feed category if available
    if (feedCategory) {
      return feedCategory;
    }

    // Try to extract from title
    const title = item.title?.toLowerCase() || '';
    const categories = [
      'Premier League',
      'La Liga',
      'Bundesliga',
      'Serie A',
      'Ligue 1',
      'Champions League',
      'Europa League',
      'World Cup',
      'Transfer News',
      'International',
    ];

    for (const category of categories) {
      if (title.includes(category.toLowerCase())) {
        return category;
      }
    }

    return undefined;
  }

  /**
   * Fetch and parse a single RSS feed
   */
  async fetchFeed(feed: NewsFeed): Promise<RSSItem[]> {
    try {
      this.logger.log(`Fetching feed: ${feed.name} (${feed.url})`);
      
      const feedData = await this.parser.parseURL(feed.url);
      
      if (!feedData.items || feedData.items.length === 0) {
        this.logger.warn(`No items found in feed: ${feed.name}`);
        return [];
      }

      this.logger.log(`Found ${feedData.items.length} items in feed: ${feed.name}`);
      return feedData.items as RSSItem[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error fetching feed ${feed.name}: ${errorMessage}`, errorStack);
      return [];
    }
  }

  /**
   * Process a single RSS item and save to database
   */
  async processItem(item: RSSItem, feed: NewsFeed): Promise<NewsItemOutcome> {
    try {
      if (!item.title || !item.link) {
        this.logger.warn('Skipping item without title or link');
        return 'skipped';
      }

      if (feed.urlIncludes && !item.link.includes(feed.urlIncludes)) {
        this.logger.debug(`Skipping non-matching item for ${feed.name}: ${item.link}`);
        return 'skipped';
      }

      // Check if article already exists (by URL)
      const existing = await this.newsArticleRepository.findOne({
        where: { url: item.link },
      });

      if (existing) {
        this.logger.debug(`Article already exists: ${item.title}`);
        return 'duplicate';
      }

      // Create new article
      const articleData: CreateNewsArticleDTO = {
        title: item.title.trim(),
        summary: this.extractSummary(item),
        url: item.link,
        imageUrl: this.extractImageUrl(item),
        source: feed.source,
        publishedAt: this.parseDate(item.isoDate || item.pubDate),
        category: this.extractCategory(item, feed.category),
        metadata: {
          feedName: feed.name,
          guid: item.guid,
          fetchedAt: new Date().toISOString(),
        },
      };

      const article = this.newsArticleRepository.create(articleData);
      await this.newsArticleRepository.save(article);

      this.logger.log(`Saved new article: ${article.title}`);
      return 'saved';
    } catch (error) {
      // Handle unique constraint violation (duplicate URL)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        this.logger.debug(`Article already exists (duplicate URL): ${item.link}`);
        return 'duplicate';
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error processing item: ${errorMessage}`, errorStack);
      return 'failed';
    }
  }

  private tallyOutcome(stats: NewsAggregationStats, outcome: NewsItemOutcome): void {
    switch (outcome) {
      case 'saved':
        stats.saved += 1;
        break;
      case 'duplicate':
        stats.duplicates += 1;
        break;
      case 'skipped':
        stats.skipped += 1;
        break;
      case 'failed':
        stats.failed += 1;
        stats.errors += 1;
        break;
    }
  }

  /**
   * Aggregate news from all enabled feeds
   */
  async aggregateAllFeeds(): Promise<NewsAggregationStats> {
    const feeds = NEWS_FEEDS.filter(feed => feed.enabled);
    this.logger.log(`Starting aggregation from ${feeds.length} feeds`);

    const stats: NewsAggregationStats = {
      processed: 0,
      saved: 0,
      duplicates: 0,
      skipped: 0,
      failed: 0,
      errors: 0,
    };

    // Process feeds in parallel batches to avoid overwhelming servers
    const batchSize = 5;
    for (let i = 0; i < feeds.length; i += batchSize) {
      const batch = feeds.slice(i, i + batchSize);
      
      this.logger.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(feeds.length / batchSize)}`);

      const batchResults = await Promise.allSettled(
        batch.map(async (feed) => {
          const items = await this.fetchFeed(feed);
          stats.processed += items.length;

          // Process items sequentially to avoid database connection issues
          for (const item of items) {
            const outcome = await this.processItem(item, feed);
            this.tallyOutcome(stats, outcome);
          }
        })
      );

      // Log batch errors
      batchResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.error(`Error processing feed ${batch[index].name}: ${result.reason}`);
          stats.failed += 1;
          stats.errors += 1;
        }
      });

      // Small delay between batches to be respectful to RSS servers
      if (i + batchSize < feeds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.logger.log(
      `Aggregation complete: ${stats.processed} processed, ${stats.saved} saved, ${stats.duplicates} duplicates, ${stats.skipped} skipped, ${stats.failed} failed`,
    );
    
    return stats;
  }

  /**
   * Aggregate news from a single feed
   */
  async aggregateFeed(feedName: string): Promise<NewsAggregationStats> {
    const feed = NEWS_FEEDS.find(f => f.name === feedName && f.enabled);
    
    if (!feed) {
      throw new Error(`Feed not found or disabled: ${feedName}`);
    }

    const items = await this.fetchFeed(feed);
    const stats: NewsAggregationStats = {
      processed: items.length,
      saved: 0,
      duplicates: 0,
      skipped: 0,
      failed: 0,
      errors: 0,
    };

    for (const item of items) {
      const outcome = await this.processItem(item, feed);
      this.tallyOutcome(stats, outcome);
    }

    return stats;
  }
}

