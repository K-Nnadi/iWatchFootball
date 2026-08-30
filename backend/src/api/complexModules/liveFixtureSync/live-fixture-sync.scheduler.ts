import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron } from '@nestjs/schedule';
import { isLiveFixtureSyncEnabled, LIVE_FIXTURE_SYNC_CRON } from './live-fixture-sync.config';

@Injectable()
export class LiveFixtureSyncScheduler implements OnModuleInit {
  private readonly logger = new Logger(LiveFixtureSyncScheduler.name);

  constructor(
    @InjectQueue('live-fixture-sync')
    private readonly liveFixtureQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log(`Live fixture sync scheduler initialized (cron: ${LIVE_FIXTURE_SYNC_CRON})`);
  }

  @Cron(LIVE_FIXTURE_SYNC_CRON)
  async scheduleLiveFixtureSync(): Promise<void> {
    if (!isLiveFixtureSyncEnabled()) {
      return;
    }

    try {
      const counts = await this.liveFixtureQueue.getJobCounts('active', 'waiting', 'delayed');
      const inFlight = (counts.active ?? 0) + (counts.waiting ?? 0) + (counts.delayed ?? 0);
      if (inFlight > 0) {
        this.logger.debug('Live fixture sync already queued or running — skipping');
        return;
      }

      await this.liveFixtureQueue.add(
        'sync-live-fixtures',
        {},
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 10_000 },
          removeOnComplete: { age: 3600, count: 200 },
          removeOnFail: { age: 86400 },
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to schedule live fixture sync: ${message}`);
    }
  }

  async triggerSync(): Promise<{ bullJobId: string }> {
    const job = await this.liveFixtureQueue.add(
      'sync-live-fixtures',
      {},
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 10_000 },
      },
    );
    return { bullJobId: String(job.id) };
  }
}
