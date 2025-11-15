import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NewsAggregatorScheduler implements OnModuleInit {
  private readonly logger = new Logger(NewsAggregatorScheduler.name);

  constructor(
    @InjectQueue('news-aggregation')
    private readonly newsQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('News Aggregator Scheduler initialized');
  }

  @Cron('*/30 * * * *')
  async scheduleNewsAggregation(): Promise<void> {
    this.logger.log('Scheduling news aggregation job');
    
    try {
      await this.newsQueue.add(
        'aggregate-all-feeds',
        {},
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: {
            age: 3600,
            count: 100,
          },
          removeOnFail: {
            age: 86400,
          },
        }
      );
      
      this.logger.log('News aggregation job scheduled successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error scheduling news aggregation: ${errorMessage}`, errorStack);
    }
  }

  /**
   * Manual trigger for news aggregation (can be called from API)
   */
  async triggerAggregation(feedName?: string): Promise<any> {
    this.logger.log(`Manually triggering news aggregation${feedName ? ` for feed: ${feedName}` : ''}`);
    
    const job = await this.newsQueue.add(
      'aggregate-all-feeds',
      { feedName },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );

    return job;
  }
}
