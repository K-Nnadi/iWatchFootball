import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ApiSportsAdapterModule } from '../../adapters/api-sports/api-sports-adapter.module';
import { PlatformConfigModule } from '../../modules/platformConfig/platformConfig.module';
import { LiveFixtureSyncService } from './live-fixture-sync.service';
import { LiveFixtureSyncScheduler } from './live-fixture-sync.scheduler';
import { LiveFixtureSyncProcessor } from './live-fixture-sync.processor';
import { LiveFixtureSyncController } from './live-fixture-sync.controller';
import { LiveFixtureSyncConfigService } from './live-fixture-sync-config.service';

const hasRedis = !!process.env.REDIS_HOST;
const bullQueueModule = hasRedis
  ? BullModule.registerQueue({ name: 'live-fixture-sync' })
  : null;

@Module({
  imports: [
    ApiSportsAdapterModule,
    PlatformConfigModule,
    ...(bullQueueModule ? [bullQueueModule] : []),
  ],
  controllers: [LiveFixtureSyncController],
  providers: [
    LiveFixtureSyncConfigService,
    LiveFixtureSyncService,
    ...(hasRedis ? [LiveFixtureSyncScheduler, LiveFixtureSyncProcessor] : []),
  ],
  exports: [LiveFixtureSyncService, LiveFixtureSyncConfigService],
})
export class LiveFixtureSyncModule {}
