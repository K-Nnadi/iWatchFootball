import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron } from '@nestjs/schedule';
import { HighlightsService } from './highlights.service';
import { SyncFixtureHighlightsJobPayload } from './highlights.processor';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class HighlightsScheduler implements OnModuleInit {
    private readonly logger = new Logger(HighlightsScheduler.name);

    constructor(
        private readonly highlightsService: HighlightsService,
        @Optional() @InjectQueue('highlights') private readonly highlightsQueue?: Queue,
    ) {}

    onModuleInit() {
        this.logger.log('Highlights Scheduler initialized');
    }

    @Cron('*/15 * * * *')
    async scheduleHighlightSync(): Promise<void> {
        if (!this.highlightsQueue) {
            this.logger.debug('Redis not configured — skipping highlight schedule check');
            return;
        }

        const fixtures = await this.highlightsService.findFixturesNeedingHighlights(48);

        if (fixtures.length === 0) {
            return;
        }

        this.logger.log(`Enqueuing highlight sync for ${fixtures.length} fixture(s)`);

        for (const fixture of fixtures) {
            const minutesSinceKickoff = (Date.now() - fixture.date.getTime()) / 60000;
            const initialDelay = Math.max(0, FIFTEEN_MINUTES_MS - minutesSinceKickoff * 60 * 1000);

            await this.enqueueSync(fixture.id, initialDelay);
        }
    }

    async enqueueSync(fixtureId: number, delayMs = FIFTEEN_MINUTES_MS): Promise<void> {
        if (!this.highlightsQueue) {
            this.logger.warn('Cannot enqueue: Redis not configured');
            return;
        }

        const jobId = `fixture-highlights-${fixtureId}`;

        const existing = await this.highlightsQueue.getJob(jobId);
        if (existing && (await existing.isWaiting())) {
            this.logger.debug(`Job ${jobId} already queued — skipping`);
            return;
        }

        await this.highlightsQueue.add(
            'sync-fixture-highlights',
            { fixtureId } satisfies SyncFixtureHighlightsJobPayload,
            {
                jobId,
                delay: delayMs,
                attempts: 4,
                backoff: {
                    type: 'custom',
                },
                removeOnComplete: { age: 3600, count: 500 },
                removeOnFail: { age: 86400 },
            },
        );

        this.logger.log(`Enqueued highlight sync for fixture ${fixtureId} with ${delayMs}ms delay`);
    }

    /** Called by the processor after a failure to schedule a specific retry delay */
    async scheduleRetry(fixtureId: number, attemptNumber: number): Promise<void> {
        const delayMs = this.getRetryDelay(attemptNumber);
        if (delayMs === null) {
            this.logger.warn(`Fixture ${fixtureId} exhausted all retry attempts`);
            return;
        }
        const retryJobId = `fixture-highlights-${fixtureId}-retry-${attemptNumber}`;
        await this.highlightsQueue?.add(
            'sync-fixture-highlights',
            { fixtureId } satisfies SyncFixtureHighlightsJobPayload,
            {
                jobId: retryJobId,
                delay: delayMs,
                attempts: 1,
                removeOnComplete: { age: 3600 },
                removeOnFail: { age: 86400 },
            },
        );
    }

    private getRetryDelay(attemptNumber: number): number | null {
        const delays = [FIFTEEN_MINUTES_MS, ONE_HOUR_MS, SIX_HOURS_MS, TWENTY_FOUR_HOURS_MS];
        return delays[attemptNumber - 1] ?? null;
    }
}
