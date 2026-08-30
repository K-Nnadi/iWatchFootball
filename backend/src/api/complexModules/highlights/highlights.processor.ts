import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HighlightsService } from './highlights.service';

export interface SyncFixtureHighlightsJobPayload {
    fixtureId: number;
}

@Processor('highlights')
export class HighlightsProcessor extends WorkerHost {
    private readonly logger = new Logger(HighlightsProcessor.name);

    constructor(private readonly highlightsService: HighlightsService) {
        super();
    }

    async process(job: Job<SyncFixtureHighlightsJobPayload | Record<string, never>>): Promise<void> {
        if (job.name === 'validate-highlights') {
            this.logger.log('Processing highlight validation job');
            await this.highlightsService.validateHighlights();
            return;
        }

        const { fixtureId } = job.data as SyncFixtureHighlightsJobPayload;
        this.logger.log(`Processing highlights job for fixture ${fixtureId} (attempt ${job.attemptsMade + 1})`);

        await this.highlightsService.syncFixtureHighlights(fixtureId);
    }
}
