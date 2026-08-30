import { Injectable } from '@nestjs/common';
import { PlatformConfigService } from '../../modules/platformConfig/platformConfig.service';
import { LIVE_FIXTURE_SYNC_CRON, isLiveFixtureSyncEnabledByEnv } from './live-fixture-sync.config';

export const LIVE_FIXTURE_SYNC_CONFIG_KEY = 'live_fixture_sync_enabled';

@Injectable()
export class LiveFixtureSyncConfigService {
  constructor(private readonly platformConfig: PlatformConfigService) {}

  getCronExpression(): string {
    return LIVE_FIXTURE_SYNC_CRON;
  }

  isRedisConfigured(): boolean {
    return !!process.env.REDIS_HOST;
  }

  /** Env var can hard-disable; otherwise platform config (default true). */
  async isScheduledSyncEnabled(): Promise<boolean> {
    if (!isLiveFixtureSyncEnabledByEnv()) {
      return false;
    }
    return this.platformConfig.getBoolean(LIVE_FIXTURE_SYNC_CONFIG_KEY, true);
  }
}
