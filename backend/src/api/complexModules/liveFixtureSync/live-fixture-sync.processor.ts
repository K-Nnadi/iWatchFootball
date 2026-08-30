import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { LiveFixtureSyncService } from './live-fixture-sync.service';

@Processor('live-fixture-sync')
export class LiveFixtureSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(LiveFixtureSyncProcessor.name);

  constructor(private readonly liveFixtureSyncService: LiveFixtureSyncService) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    this.logger.log(`Processing live fixture sync job ${job.id} (attempt ${job.attemptsMade + 1})`);
    return this.liveFixtureSyncService.syncLiveFixtures();
  }
}
