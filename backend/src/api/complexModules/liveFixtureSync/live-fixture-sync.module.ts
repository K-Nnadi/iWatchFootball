import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApiSportsAdapterModule } from '../../adapters/api-sports/api-sports-adapter.module';
import { LiveFixtureSyncService } from './live-fixture-sync.service';
import { LiveFixtureSyncScheduler } from './live-fixture-sync.scheduler';
import { LiveFixtureSyncProcessor } from './live-fixture-sync.processor';
import { LiveFixtureSyncController } from './live-fixture-sync.controller';

const hasRedis = !!process.env.REDIS_HOST;
const bullQueueModule = hasRedis
  ? BullModule.registerQueue({ name: 'live-fixture-sync' })
  : null;

@Module({
  imports: [ApiSportsAdapterModule, ...(bullQueueModule ? [bullQueueModule] : [])],
  controllers: [LiveFixtureSyncController],
  providers: [
    LiveFixtureSyncService,
    ...(hasRedis ? [LiveFixtureSyncScheduler, LiveFixtureSyncProcessor] : []),
  ],
  exports: [LiveFixtureSyncService],
})
export class LiveFixtureSyncModule {}
