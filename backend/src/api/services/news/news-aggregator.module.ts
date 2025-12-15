import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsArticle } from '../../modules/newsArticle/newsArticle.entity';
import { NewsAggregatorService } from './news-aggregator.service';
import { NewsAggregatorProcessor } from './news-aggregator.processor';
import { NewsAggregatorScheduler } from './news-aggregator.scheduler';
import { NewsAggregatorController } from './news-aggregator.controller';

// Only register BullMQ queue if Redis is available
const hasRedis = !!process.env.REDIS_HOST;

const bullQueueModule = hasRedis
  ? BullModule.registerQueue({
      name: 'news-aggregation',
    })
  : null;

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsArticle]),
    ...(bullQueueModule ? [bullQueueModule] : []),
    ScheduleModule.forRoot(),
  ],
  controllers: [NewsAggregatorController],
  providers: [
    NewsAggregatorService,
    ...(hasRedis ? [NewsAggregatorProcessor] : []),
    // Always provide scheduler - it will handle Redis availability internally
    ...(hasRedis ? [NewsAggregatorScheduler] : [
      {
        provide: NewsAggregatorScheduler,
        useValue: null,
      },
    ]),
  ],
  exports: [NewsAggregatorService, ...(hasRedis ? [NewsAggregatorScheduler] : [])],
})
export class NewsAggregatorModule {}

