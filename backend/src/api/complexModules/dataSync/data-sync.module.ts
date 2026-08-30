import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncJob } from './sync-job.entity';
import { SyncJobStep } from './sync-job-step.entity';
import { SyncJobService } from './sync-job.service';
import { DataSyncPipelineService } from './data-sync-pipeline.service';
import { DataSyncController } from './data-sync.controller';
import { DataSyncProcessor } from './data-sync.processor';
import { StatsBombAdapterModule } from '../../adapters/statsbomb/statsbomb-adapter.module';
import { ApiSportsAdapterModule } from '../../adapters/api-sports/api-sports-adapter.module';
import { SportMonksAdapterModule } from '../../adapters/sportmonks/sportmonks-adapter.module';

const hasRedis = !!process.env.REDIS_HOST;
const bullQueueModule = hasRedis
  ? BullModule.registerQueue({
      name: 'data-sync',
    })
  : null;

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncJob, SyncJobStep]),
    StatsBombAdapterModule,
    ApiSportsAdapterModule,
    SportMonksAdapterModule,
    ...(bullQueueModule ? [bullQueueModule] : []),
  ],
  controllers: [DataSyncController],
  providers: [
    SyncJobService,
    DataSyncPipelineService,
    ...(hasRedis ? [DataSyncProcessor] : []),
  ],
  exports: [SyncJobService, DataSyncPipelineService],
})
export class DataSyncModule {}
