import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NewsAggregatorService } from './news-aggregator.service';

export interface NewsAggregationJob {
  feedName?: string; // Optional: if provided, only aggregate this feed
}

@Processor('news-aggregation')
export class NewsAggregatorProcessor extends WorkerHost {
  private readonly logger = new Logger(NewsAggregatorProcessor.name);

  constructor(private readonly newsAggregatorService: NewsAggregatorService) {
    super();
  }

  async process(job: Job<NewsAggregationJob>): Promise<any> {
    this.logger.log(`Processing news aggregation job ${job.id}`);

    try {
      const { feedName } = job.data;

      if (feedName) {
        // Aggregate single feed
        this.logger.log(`Aggregating single feed: ${feedName}`);
        const result = await this.newsAggregatorService.aggregateFeed(feedName);
        this.logger.log(`Feed aggregation complete: ${result.processed} processed, ${result.saved} saved`);
        return result;
      } else {
        // Aggregate all feeds
        this.logger.log('Aggregating all feeds');
        const result = await this.newsAggregatorService.aggregateAllFeeds();
        this.logger.log(
          `Aggregation complete: ${result.processed} processed, ${result.saved} saved, ${result.duplicates} duplicates, ${result.skipped} skipped, ${result.failed} failed`,
        );
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error processing news aggregation job: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}

