import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DataSyncPipelineService } from './data-sync-pipeline.service';

export interface DataSyncBullPayload {
  syncJobId: number;
}

@Processor('data-sync')
export class DataSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(DataSyncProcessor.name);

  constructor(private readonly pipeline: DataSyncPipelineService) {
    super();
  }

  async process(job: Job<DataSyncBullPayload>): Promise<unknown> {
    const syncJobId = job.data?.syncJobId;
    this.logger.log(`data-sync Bull job ${job.id} for syncJobId=${syncJobId}`);
    if (syncJobId == null || Number.isNaN(Number(syncJobId))) {
      throw new Error('Invalid syncJobId on queue payload');
    }
    return this.pipeline.execute(Number(syncJobId));
  }
}
