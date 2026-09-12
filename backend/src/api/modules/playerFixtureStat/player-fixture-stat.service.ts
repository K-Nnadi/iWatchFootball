import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
    emptyPlayerFixtureStatRollup,
    PlayerFixtureStat,
    type PlayerFixtureStatRollup,
} from './playerFixtureStat.entity';

/** Minimal StatsBomb event shape for rollup aggregation. */
export type StatsBombEventForRollup = {
    type?: { name?: string };
    player?: { id?: number; name?: string };
    location?: [number, number];
    period?: number;
    shot?: {
        outcome?: { name?: string };
        body_part?: { name?: string };
        stats?: { xg?: number; xa?: number };
    };
    pass?: {
        outcome?: { name?: string };
        shot_assist?: boolean;
        goal_assist?: boolean;
        stats?: { xa?: number };
    };
    dribble?: {
        outcome?: { name?: string };
    };
};

const OPPOSITION_BOX_MIN_X = 102;

function isInOppositionBox(location?: [number, number]): boolean {
    if (!location || location.length < 2) return false;
    return location[0] >= OPPOSITION_BOX_MIN_X;
}

function shotXg(event: StatsBombEventForRollup): number {
    const raw = (event.shot as { stats?: { xg?: number } } | undefined)?.stats?.xg;
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
}

function passXa(event: StatsBombEventForRollup): number {
    const raw = (event.pass as { stats?: { xa?: number } } | undefined)?.stats?.xa;
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
}

@Injectable()
export class PlayerFixtureStatService {
    constructor(
        @InjectRepository(PlayerFixtureStat)
        private readonly statRepo: Repository<PlayerFixtureStat>,
    ) {}

    aggregateEvents(
        events: StatsBombEventForRollup[],
        resolvePlayerId: (statsbombPlayerId: number, name: string) => number | null,
    ): Map<number, PlayerFixtureStatRollup> {
        const byPlayer = new Map<number, PlayerFixtureStatRollup>();

        const bump = (playerId: number): PlayerFixtureStatRollup => {
            let row = byPlayer.get(playerId);
            if (!row) {
                row = emptyPlayerFixtureStatRollup(playerId);
                byPlayer.set(playerId, row);
            }
            return row;
        };

        for (const event of events) {
            if (event.period === 5) continue;
            const sbId = event.player?.id;
            const name = event.player?.name ?? '';
            if (sbId == null) continue;
            const playerId = resolvePlayerId(sbId, name);
            if (playerId == null) continue;

            const row = bump(playerId);
            const typeName = event.type?.name ?? '';
            const inBox = isInOppositionBox(event.location);

            if (typeName === 'Shot') {
                row.shots += 1;
                row.touches += 1;
                row.xg += shotXg(event);
                const outcome = event.shot?.outcome?.name ?? '';
                if (outcome === 'Goal' || outcome === 'Saved' || outcome === 'Saved to Post') {
                    row.shotsOnTarget += 1;
                }
                if ((event.shot?.body_part?.name ?? '').toLowerCase().includes('head')) {
                    row.headedShots += 1;
                }
                if (inBox) row.touchesInOppositionBox += 1;
            } else if (typeName === 'Pass') {
                row.passAttempts += 1;
                row.touches += 1;
                const outcome = event.pass?.outcome?.name ?? '';
                if (outcome === 'Complete' || outcome === 'Complete to Teammate') {
                    row.successfulPasses += 1;
                }
                if (event.pass?.shot_assist) {
                    row.keyPasses += 1;
                    row.chancesCreated += 1;
                }
                if (event.pass?.goal_assist) {
                    row.bigChancesCreated += 1;
                }
                row.xa += passXa(event);
                if (inBox) row.touchesInOppositionBox += 1;
            } else if (typeName === 'Dribble') {
                row.touches += 1;
                if ((event.dribble?.outcome?.name ?? '') === 'Complete') {
                    row.successfulDribbles += 1;
                }
                if (inBox) row.touchesInOppositionBox += 1;
            } else if (typeName === 'Interception') {
                row.interceptions += 1;
                row.defensiveContributions += 1;
            } else if (typeName === 'Foul Committed') {
                row.foulsCommitted += 1;
            } else if (typeName === 'Foul Won') {
                row.foulsWon += 1;
            } else if (typeName === 'Duel') {
                row.duelsWon += 1;
            } else if (typeName === 'Tackle') {
                row.tackles += 1;
                row.defensiveContributions += 1;
            } else if (typeName === 'Ball Recovery') {
                row.recoveries += 1;
            } else if (typeName === 'Carry') {
                row.touches += 1;
                if (inBox) row.touchesInOppositionBox += 1;
            }
        }

        return byPlayer;
    }

    async upsertFixtureRollups(
        fixtureId: number,
        rollups: Map<number, PlayerFixtureStatRollup>,
    ): Promise<void> {
        if (rollups.size === 0) return;

        for (const rollup of rollups.values()) {
            const passPct =
                rollup.passAttempts > 0
                    ? Number(((rollup.successfulPasses / rollup.passAttempts) * 100).toFixed(2))
                    : undefined;

            await this.statRepo.upsert(
                {
                    playerId: rollup.playerId,
                    fixtureId,
                    xg: rollup.xg || undefined,
                    xa: rollup.xa || undefined,
                    shots: rollup.shots || undefined,
                    shotsOnTarget: rollup.shotsOnTarget || undefined,
                    headedShots: rollup.headedShots || undefined,
                    successfulPasses: rollup.successfulPasses || undefined,
                    passCompletionPct: passPct,
                    keyPasses: rollup.keyPasses || undefined,
                    chancesCreated: rollup.chancesCreated || undefined,
                    bigChancesCreated: rollup.bigChancesCreated || undefined,
                    successfulDribbles: rollup.successfulDribbles || undefined,
                    duelsWon: rollup.duelsWon || undefined,
                    touches: rollup.touches || undefined,
                    touchesInOppositionBox: rollup.touchesInOppositionBox || undefined,
                    foulsWon: rollup.foulsWon || undefined,
                    defensiveContributions: rollup.defensiveContributions || undefined,
                    tackles: rollup.tackles || undefined,
                    interceptions: rollup.interceptions || undefined,
                    recoveries: rollup.recoveries || undefined,
                    foulsCommitted: rollup.foulsCommitted || undefined,
                    metadata: { source: 'statsbomb', syncedAt: new Date().toISOString() },
                },
                ['playerId', 'fixtureId'],
            );
        }
    }

    async rebuildFromStatsBombEvents(
        fixtureId: number,
        events: StatsBombEventForRollup[],
        resolvePlayerId: (statsbombPlayerId: number, name: string) => number | null,
    ): Promise<void> {
        const rollups = this.aggregateEvents(events, resolvePlayerId);
        await this.upsertFixtureRollups(fixtureId, rollups);
    }

    async findByPlayerAndFixtures(playerId: number, fixtureIds: number[]): Promise<PlayerFixtureStat[]> {
        if (fixtureIds.length === 0) return [];
        return this.statRepo.find({
            where: { playerId, fixtureId: In(fixtureIds) },
        });
    }

    async findByFixtures(fixtureIds: number[]): Promise<PlayerFixtureStat[]> {
        if (fixtureIds.length === 0) return [];
        return this.statRepo.find({
            where: { fixtureId: In(fixtureIds) },
        });
    }

    async sumByPlayerForFixtures(
        fixtureIds: number[],
    ): Promise<Map<number, PlayerFixtureStatRollup>> {
        const rows = await this.findByFixtures(fixtureIds);
        const totals = new Map<number, PlayerFixtureStatRollup>();

        for (const row of rows) {
            let agg = totals.get(row.playerId);
            if (!agg) {
                agg = emptyPlayerFixtureStatRollup(row.playerId);
                totals.set(row.playerId, agg);
            }
            agg.xg += Number(row.xg ?? 0);
            agg.xa += Number(row.xa ?? 0);
            agg.shots += row.shots ?? 0;
            agg.shotsOnTarget += row.shotsOnTarget ?? 0;
            agg.headedShots += row.headedShots ?? 0;
            agg.successfulPasses += row.successfulPasses ?? 0;
            agg.keyPasses += row.keyPasses ?? 0;
            agg.chancesCreated += row.chancesCreated ?? 0;
            agg.bigChancesCreated += row.bigChancesCreated ?? 0;
            agg.successfulDribbles += row.successfulDribbles ?? 0;
            agg.duelsWon += row.duelsWon ?? 0;
            agg.touches += row.touches ?? 0;
            agg.touchesInOppositionBox += row.touchesInOppositionBox ?? 0;
            agg.foulsWon += row.foulsWon ?? 0;
            agg.defensiveContributions += row.defensiveContributions ?? 0;
            agg.tackles += row.tackles ?? 0;
            agg.interceptions += row.interceptions ?? 0;
            agg.recoveries += row.recoveries ?? 0;
            agg.foulsCommitted += row.foulsCommitted ?? 0;
        }

        return totals;
    }

    /** Goal assists for a competition season: Goal.assistantId, falling back to StatsBomb goal_assist rollups. */
    async assistCountsForCompetitionSeason(
        competitionId: number,
        seasonId: number,
    ): Promise<Array<{ playerId: number; assists: number }>> {
        const fromGoals = await this.statRepo.manager
            .createQueryBuilder()
            .select('g."assistantId"', 'playerId')
            .addSelect('COUNT(*)::int', 'assists')
            .from('goal', 'g')
            .innerJoin('fixture', 'f', 'f.id = g."fixtureId"')
            .where('f."competitionId" = :competitionId', { competitionId })
            .andWhere('f."seasonId" = :seasonId', { seasonId })
            .andWhere('g."assistantId" IS NOT NULL')
            .andWhere('g."deletedAt" IS NULL')
            .andWhere('f."deletedAt" IS NULL')
            .groupBy('g."assistantId"')
            .getRawMany<{ playerId: string | number; assists: string | number }>();

        const fromRollup = await this.statRepo.manager
            .createQueryBuilder()
            .select('s."playerId"', 'playerId')
            .addSelect('SUM(COALESCE(s."bigChancesCreated", 0))::int', 'assists')
            .from('playerFixtureStat', 's')
            .innerJoin('fixture', 'f', 'f.id = s."fixtureId"')
            .where('f."competitionId" = :competitionId', { competitionId })
            .andWhere('f."seasonId" = :seasonId', { seasonId })
            .andWhere('s."deletedAt" IS NULL')
            .andWhere('f."deletedAt" IS NULL')
            .groupBy('s."playerId"')
            .having('SUM(COALESCE(s."bigChancesCreated", 0)) > 0')
            .getRawMany<{ playerId: string | number; assists: string | number }>();

        const byPlayer = new Map<number, number>();
        for (const row of [...fromGoals, ...fromRollup]) {
            const playerId = Number(row.playerId);
            const assists = Number(row.assists);
            if (!Number.isFinite(playerId) || playerId <= 0 || !Number.isFinite(assists) || assists <= 0) {
                continue;
            }
            byPlayer.set(playerId, Math.max(byPlayer.get(playerId) ?? 0, assists));
        }

        return Array.from(byPlayer, ([playerId, assists]) => ({ playerId, assists }));
    }

    /**
     * Appearances: started, came on as a sub, or recorded match events.
     * Distinct fixtures per player for the competition season.
     */
    async appearanceCountsForCompetitionSeason(
        competitionId: number,
        seasonId: number,
    ): Promise<Array<{ playerId: number; played: number }>> {
        const rows = (await this.statRepo.manager.query(
            `
            SELECT apps."playerId" AS "playerId", COUNT(DISTINCT apps."fixtureId")::int AS played
            FROM (
                SELECT plu."playerId" AS "playerId", lu."fixtureId" AS "fixtureId"
                FROM "playerLineup" plu
                INNER JOIN "lineUp" lu ON lu.id = plu."lineupId"
                INNER JOIN fixture f ON f.id = lu."fixtureId"
                WHERE f."competitionId" = $1
                  AND f."seasonId" = $2
                  AND plu."isStarting" = true
                  AND plu."deletedAt" IS NULL
                  AND lu."deletedAt" IS NULL
                  AND f."deletedAt" IS NULL
                UNION
                SELECT s."playerInId" AS "playerId", s."fixtureId" AS "fixtureId"
                FROM substitution s
                INNER JOIN fixture f ON f.id = s."fixtureId"
                WHERE f."competitionId" = $1
                  AND f."seasonId" = $2
                  AND s."deletedAt" IS NULL
                  AND f."deletedAt" IS NULL
                UNION
                SELECT pfs."playerId" AS "playerId", pfs."fixtureId" AS "fixtureId"
                FROM "playerFixtureStat" pfs
                INNER JOIN fixture f ON f.id = pfs."fixtureId"
                WHERE f."competitionId" = $1
                  AND f."seasonId" = $2
                  AND pfs."deletedAt" IS NULL
                  AND f."deletedAt" IS NULL
            ) apps
            GROUP BY apps."playerId"
            `,
            [competitionId, seasonId],
        )) as Array<{ playerId: string | number; played: string | number }>;

        const result: Array<{ playerId: number; played: number }> = [];
        for (const row of rows) {
            const playerId = Number(row.playerId);
            const played = Number(row.played);
            if (!Number.isFinite(playerId) || playerId <= 0 || !Number.isFinite(played) || played <= 0) {
                continue;
            }
            result.push({ playerId, played });
        }
        return result;
    }
}
