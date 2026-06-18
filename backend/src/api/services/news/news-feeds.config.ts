/**
 * Configuration for RSS feeds from major football news sources
 * These are publicly available RSS feeds that aggregate football news
 */

export interface NewsFeed {
  name: string;
  url: string;
  category?: string;
  source: string;
  enabled: boolean;
  /** When set, only items whose link contains this substring are ingested */
  urlIncludes?: string;
}

export const NEWS_FEEDS: NewsFeed[] = [
  // Major Football News Sources
  {
    name: 'BBC Sport - Football',
    url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    category: 'General',
    source: 'BBC Sport',
    enabled: true,
  },
  {
    name: 'ESPN FC',
    url: 'https://www.espn.com/espn/rss/soccer/news',
    category: 'General',
    source: 'ESPN',
    enabled: true,
  },
  {
    name: 'Sky Sports Football',
    // 12040 is the general multi-sport feed (F1, cricket, golf, etc.); 11095 is football
    url: 'https://www.skysports.com/rss/11095',
    urlIncludes: '/football/',
    category: 'General',
    source: 'Sky Sports',
    enabled: true,
  },
  {
    name: 'The Guardian - Football',
    url: 'https://www.theguardian.com/football/rss',
    category: 'General',
    source: 'The Guardian',
    enabled: true,
  },
  {
    name: 'The Athletic - Football',
    url: 'https://theathletic.com/uk/soccer/feed/',
    category: 'General',
    source: 'The Athletic',
    enabled: true,
  },
  {
    name: 'Goal.com',
    url: 'https://www.goal.com/en/feeds/news',
    category: 'General',
    source: 'Goal.com',
    enabled: true,
  },
  {
    name: 'OneFootball',
    url: 'https://onefootball.com/en/rss',
    category: 'General',
    source: 'OneFootball',
    enabled: true,
  },
  {
    name: '90min',
    url: 'https://www.90min.com/posts.rss',
    category: 'General',
    source: '90min',
    enabled: true,
  },
  {
    name: 'Football365',
    url: 'https://www.football365.com/feed/',
    category: 'General',
    source: 'Football365',
    enabled: true,
  },
  {
    name: 'The Independent - Football',
    url: 'https://www.independent.co.uk/sport/football/rss',
    category: 'General',
    source: 'The Independent',
    enabled: true,
  },
  {
    name: 'Daily Mail - Football',
    url: 'https://www.dailymail.co.uk/sport/football/index.rss',
    category: 'General',
    source: 'Daily Mail',
    enabled: true,
  },
  {
    name: 'The Telegraph - Football',
    url: 'https://www.telegraph.co.uk/football/rss.xml',
    category: 'General',
    source: 'The Telegraph',
    enabled: true,
  },
  // Premier League Specific
  {
    name: 'Premier League Official',
    url: 'https://www.premierleague.com/rss',
    category: 'Premier League',
    source: 'Premier League',
    enabled: true,
  },
  // Transfer News
  {
    name: 'Transfermarkt News',
    url: 'https://www.transfermarkt.com/rss/news',
    category: 'Transfer News',
    source: 'Transfermarkt',
    enabled: true,
  },
  // European Leagues
  {
    name: 'La Liga News',
    url: 'https://www.laliga.com/en-GB/news/rss',
    category: 'La Liga',
    source: 'La Liga',
    enabled: true,
  },
  {
    name: 'Bundesliga News',
    url: 'https://www.bundesliga.com/en/bundesliga/news/rss',
    category: 'Bundesliga',
    source: 'Bundesliga',
    enabled: true,
  },
  {
    name: 'Serie A News',
    url: 'https://www.legaseriea.it/en/rss',
    category: 'Serie A',
    source: 'Serie A',
    enabled: true,
  },
  // International
  {
    name: 'FIFA News',
    url: 'https://www.fifa.com/rss',
    category: 'International',
    source: 'FIFA',
    enabled: true,
  },
  {
    name: 'UEFA News',
    url: 'https://www.uefa.com/rss',
    category: 'International',
    source: 'UEFA',
    enabled: true,
  },
];

/**
 * Get enabled feeds only
 */
export function getEnabledFeeds(): NewsFeed[] {
  return NEWS_FEEDS.filter(feed => feed.enabled);
}

/**
 * Get feeds by category
 */
export function getFeedsByCategory(category: string): NewsFeed[] {
  return getEnabledFeeds().filter(feed => feed.category === category);
}


