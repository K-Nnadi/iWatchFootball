import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { FixtureHighlight } from '../../modules/fixtureHighlight/fixtureHighlight.entity';
import { FixtureHighlightService } from '../../modules/fixtureHighlight/fixtureHighlight.module';
import { Fixture } from '../../modules/fixture/fixture.entity';
import { Team } from '../../modules/team/team.entity';
import { HighlightStatus } from '../../enums/fixture-highlight.enum';
import { HighlightProviderRegistry } from './highlight-provider.registry';

@Injectable()
export class HighlightsService {
    private readonly logger = new Logger(HighlightsService.name);

    constructor(
        private readonly highlightService: FixtureHighlightService,
        private readonly registry: HighlightProviderRegistry,
        @InjectRepository(Fixture) private readonly fixtureRepo: Repository<Fixture>,
        @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    ) {}

    async syncFixtureHighlights(fixtureId: number): Promise<void> {
        this.logger.log(`Starting highlight sync for fixture ${fixtureId}`);

        const fixture = await this.fixtureRepo.findOne({ where: { id: fixtureId } });
        if (!fixture) {
            this.logger.warn(`Fixture ${fixtureId} not found — skipping sync`);
            return;
        }

        const [homeTeam, awayTeam] = await Promise.all([
            fixture.homeTeamId ? this.teamRepo.findOne({ where: { id: fixture.homeTeamId } }) : null,
            fixture.awayTeamId ? this.teamRepo.findOne({ where: { id: fixture.awayTeamId } }) : null,
        ]);

        if (!homeTeam || !awayTeam) {
            this.logger.warn(`Teams not found for fixture ${fixtureId} — skipping sync`);
            return;
        }

        const ctx = {
            fixtureId,
            homeTeamName: homeTeam.name,
            awayTeamName: awayTeam.name,
            kickoffTime: fixture.date,
        };

        const providers = this.registry.getAll();
        if (providers.length === 0) {
            this.logger.warn('No highlight providers registered');
            return;
        }

        const results = await Promise.allSettled(
            providers.map((provider) => provider.searchFixtureHighlights(ctx)),
        );

        const allHighlights: Partial<FixtureHighlight>[] = [];
        for (const result of results) {
            if (result.status === 'rejected') {
                this.logger.error(`Provider search failed: ${result.reason}`);
                continue;
            }
            allHighlights.push(...result.value);
        }

        if (allHighlights.length === 0) {
            this.logger.warn(`No highlights found for fixture ${fixtureId} — keeping existing highlights`);
            return;
        }

        // Clear out stale highlights (wrong type, blocked, cartoons) before inserting the clean new set
        await this.highlightService.markAllActiveRemovedForFixture(fixtureId);

        let saved = 0;
        for (const highlight of allHighlights) {
            try {
                await this.highlightService.upsertByProviderVideoId(highlight);
                saved++;
            } catch (err) {
                this.logger.error(`Failed to save highlight: ${err}`);
            }
        }

        this.logger.log(`Highlight sync complete for fixture ${fixtureId}: ${saved} highlight(s) saved`);
    }

    async getHighlights(fixtureId: number): Promise<FixtureHighlight[]> {
        return this.highlightService.findActiveByFixtureId(fixtureId);
    }

    /** HEAD-check each active highlight's embedUrl and mark broken ones as REMOVED */
    async validateHighlights(): Promise<void> {
        this.logger.log('Starting highlight validation run');

        const active = await this.highlightService.findAllActive();

        let removed = 0;
        for (const highlight of active) {
            if (!highlight.embedUrl) continue;
            try {
                await axios.head(highlight.embedUrl, { timeout: 5000 });
            } catch {
                await this.highlightService.markAsRemoved(highlight.id);
                removed++;
                this.logger.log(`Marked highlight ${highlight.id} as REMOVED (dead link)`);
            }
        }

        this.logger.log(`Validation complete: ${removed} highlight(s) marked REMOVED`);
    }

    async syncBulkFixtureHighlights(options: {
        fixtureIds?: number[];
        lookbackHours?: number;
        useQueue: boolean;
        scheduler: { enqueueSync(id: number, delay: number): Promise<void> };
    }): Promise<{ count: number }> {
        const { fixtureIds, lookbackHours = 48, useQueue, scheduler } = options;

        let ids: number[];

        if (fixtureIds && fixtureIds.length > 0) {
            ids = fixtureIds;
            this.logger.log(`Bulk highlight sync requested for ${ids.length} explicit fixture(s)`);
        } else {
            const fixtures = await this.findFixturesNeedingHighlights(lookbackHours);
            ids = fixtures.map((f) => f.id);
            this.logger.log(`Auto-detected ${ids.length} fixture(s) needing highlights (last ${lookbackHours}h)`);
        }

        if (ids.length === 0) {
            return { count: 0 };
        }

        for (const id of ids) {
            if (useQueue) {
                await scheduler.enqueueSync(id, 0);
            } else {
                await this.syncFixtureHighlights(id);
            }
        }

        return { count: ids.length };
    }

    /** Find recently completed fixtures that have no active highlights yet */
    async findFixturesNeedingHighlights(lookbackHours = 48): Promise<Fixture[]> {
        const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

        return this.fixtureRepo
            .createQueryBuilder('fixture')
            .where('fixture.status = :status', { status: 'Completed' })
            .andWhere('fixture.date >= :since', { since })
            .andWhere(
                `NOT EXISTS (
                    SELECT 1 FROM fixture_highlight fh
                    WHERE fh."fixtureId" = fixture.id
                    AND fh.status = :activeStatus
                )`,
                { activeStatus: HighlightStatus.ACTIVE },
            )
            .getMany();
    }
}
