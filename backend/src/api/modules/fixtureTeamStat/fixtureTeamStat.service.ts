import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    FixtureTeamStat,
    FixtureTeamStatInput,
    FixtureTeamStatSide,
    FixtureTeamStatSource,
} from './fixtureTeamStat.entity';
import { PlayerFixtureStat } from '../playerFixtureStat/playerFixtureStat.entity';
import { Card } from '../card/card.entity';
import { CardType } from '../../enums/card.enum';

type ApiSportsStatValue = { type: string; value: string | number | null };

function statNum(stats: ApiSportsStatValue[], type: string): number | undefined {
    const row = stats.find((s) => s.type === type);
    if (!row || row.value == null) return undefined;
    const raw = String(row.value).replace('%', '').trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
}

export type FixtureTeamStatPair = {
    home: FixtureTeamStat | null;
    away: FixtureTeamStat | null;
};

@Injectable()
export class FixtureTeamStatService {
    private readonly logger = new Logger(FixtureTeamStatService.name);

    constructor(
        @InjectRepository(FixtureTeamStat)
        private readonly statRepo: Repository<FixtureTeamStat>,
        @InjectRepository(PlayerFixtureStat)
        private readonly playerStatRepo: Repository<PlayerFixtureStat>,
        @InjectRepository(Card)
        private readonly cardRepo: Repository<Card>,
    ) {}

    /**
     * Map API-Sports `{ type, value }` stat pairs to columns and upsert a row.
     * Call once per team per fixture after fetching /fixtures/statistics.
     */
    async upsertFromApiSportsStatistics(
        fixtureId: number,
        teamId: number,
        side: FixtureTeamStatSide,
        stats: ApiSportsStatValue[],
    ): Promise<void> {
        const possession = statNum(stats, 'Ball Possession');
        const shotsTotal = statNum(stats, 'Total Shots');
        const shotsOnTarget = statNum(stats, 'Shots on Goal');
        const shotsOffTarget = statNum(stats, 'Shots off Goal');
        const shotsBlocked = statNum(stats, 'Blocked Shots');
        const shotsInsideBox = statNum(stats, 'Shots insidebox');
        const shotsOutsideBox = statNum(stats, 'Shots outsidebox');
        const corners = statNum(stats, 'Corner Kicks');
        const offsides = statNum(stats, 'Offsides');
        const fouls = statNum(stats, 'Fouls');
        const yellowCards = statNum(stats, 'Yellow Cards');
        const redCards = statNum(stats, 'Red Cards');
        const goalkeeperSaves = statNum(stats, 'Goalkeeper Saves');
        const passesTotal = statNum(stats, 'Total passes');
        const passesAccurate = statNum(stats, 'Passes accurate');
        const passAccuracyPct = statNum(stats, 'Passes %');

        // xG from API-Sports (available on some subscription tiers)
        const xgRaw = statNum(stats, 'expected_goals') ?? statNum(stats, 'Expected Goals');

        const input: FixtureTeamStatInput = {
            fixtureId,
            teamId,
            side,
            source: FixtureTeamStatSource.API_SPORTS,
            possession,
            shotsTotal,
            shotsOnTarget,
            shotsOffTarget,
            shotsBlocked,
            shotsInsideBox,
            shotsOutsideBox,
            xg: xgRaw,
            corners,
            fouls,
            offsides,
            yellowCards,
            redCards,
            goalkeeperSaves,
            passesTotal,
            passesAccurate,
            passAccuracyPct,
        };

        await this.statRepo.upsert(input as any, ['fixtureId', 'teamId']);
    }

    /** Map SportMonks team-level statistics (player_id null) to columns and upsert. */
    async upsertFromSportMonksStatistics(
        fixtureId: number,
        teamId: number,
        side: FixtureTeamStatSide,
        stats: Array<{ type_id?: number; data?: { value?: number | string } }>,
    ): Promise<void> {
        const val = (typeId: number): number | undefined => {
            const row = stats.find((s) => s.type_id === typeId);
            if (row?.data?.value == null) return undefined;
            const raw = String(row.data.value).replace('%', '').trim();
            const n = Number(raw);
            return Number.isFinite(n) ? n : undefined;
        };

        const input: FixtureTeamStatInput = {
            fixtureId,
            teamId,
            side,
            source: FixtureTeamStatSource.SPORTMONKS,
            possession: val(45),
            shotsTotal: val(41),
            shotsOnTarget: val(42),
            shotsOffTarget: val(43),
            shotsBlocked: val(44),
            shotsInsideBox: val(52),
            shotsOutsideBox: val(53),
            corners: val(34),
            fouls: val(56),
            offsides: val(51),
            yellowCards: val(84),
            redCards: val(85),
            goalkeeperSaves: val(57),
            passesTotal: val(80),
            passesAccurate: val(81),
            passAccuracyPct: val(116),
            xg: val(580),
        };

        const hasAny = Object.entries(input).some(
            ([k, v]) => !['fixtureId', 'teamId', 'side', 'source'].includes(k) && v != null,
        );
        if (!hasAny) return;

        await this.statRepo.upsert(input as any, ['fixtureId', 'teamId']);
    }

    /**
     * Derive team-level stats by summing `playerFixtureStat` rows per team.
     * Resolves player→team assignment via the `playerLineup` / `lineUp` tables.
     * Only writes a row when `playerFixtureStat` data exists.
     * Uses `source: 'derived'` so callers know this is an approximation.
     */
    async deriveFromPlayerFixtureStats(
        fixtureId: number,
        homeTeamId: number,
        awayTeamId: number,
    ): Promise<void> {
        // Join lineUp → playerLineup to get teamId per playerId for this fixture
        const lineUpRows = await this.statRepo.manager.query<{ teamId: number; playerId: number }[]>(
            `SELECT lu."teamId", plu."playerId"
             FROM "lineUp" lu
             INNER JOIN "playerLineup" plu ON plu."lineupId" = lu."id" AND plu."deletedAt" IS NULL
             WHERE lu."fixtureId" = $1 AND lu."deletedAt" IS NULL`,
            [fixtureId],
        );

        const homePlayerIds = new Set(
            lineUpRows.filter((r) => r.teamId === homeTeamId).map((r) => r.playerId),
        );
        const awayPlayerIds = new Set(
            lineUpRows.filter((r) => r.teamId === awayTeamId).map((r) => r.playerId),
        );

        if (homePlayerIds.size === 0 && awayPlayerIds.size === 0) {
            this.logger.debug(
                `deriveFromPlayerFixtureStats: no lineups for fixture ${fixtureId}, skipping`,
            );
            return;
        }

        const playerStats = await this.playerStatRepo.find({ where: { fixtureId } });
        const fixtureCards = await this.cardRepo.find({ where: { fixtureId } });

        const buildInput = (
            playerIds: Set<number>,
            side: FixtureTeamStatSide,
            teamId: number,
        ): FixtureTeamStatInput | null => {
            const relevant = playerStats.filter((p) => playerIds.has(p.playerId));
            if (relevant.length === 0) return null;

            const sum = <K extends keyof PlayerFixtureStat>(key: K): number =>
                relevant.reduce((acc, r) => acc + Number(r[key] ?? 0), 0);

            const passes = sum('successfulPasses');
            const passAttempts = relevant.reduce((acc, r) => {
                const pct = Number(r.passCompletionPct ?? 0);
                const succ = Number(r.successfulPasses ?? 0);
                return acc + (pct > 0 ? Math.round((succ / pct) * 100) : succ);
            }, 0);
            const passAccuracyPct =
                passAttempts > 0 ? Number(((passes / passAttempts) * 100).toFixed(2)) : undefined;

            const teamCards = fixtureCards.filter(
                (c) => c.teamId === teamId || (!c.teamId && playerIds.has(c.playerId)),
            );

            return {
                fixtureId,
                teamId,
                side,
                source: FixtureTeamStatSource.DERIVED,
                shotsTotal: sum('shots') || undefined,
                shotsOnTarget: sum('shotsOnTarget') || undefined,
                xg: sum('xg') ? Number(sum('xg').toFixed(2)) : undefined,
                passesTotal: passes || undefined,
                passesAccurate: passes || undefined,
                passAccuracyPct,
                fouls: sum('foulsCommitted') || undefined,
                yellowCards: teamCards.filter((c) => c.type === CardType.YELLOW).length || undefined,
                redCards: teamCards.filter((c) => c.type === CardType.RED).length || undefined,
            };
        };

        const ops: Promise<void>[] = [];

        if (homePlayerIds.size > 0) {
            const input = buildInput(homePlayerIds, FixtureTeamStatSide.HOME, homeTeamId);
            if (input) ops.push(this.statRepo.upsert(input as any, ['fixtureId', 'teamId']).then(() => {}));
        }

        if (awayPlayerIds.size > 0) {
            const input = buildInput(awayPlayerIds, FixtureTeamStatSide.AWAY, awayTeamId);
            if (input) ops.push(this.statRepo.upsert(input as any, ['fixtureId', 'teamId']).then(() => {}));
        }

        await Promise.all(ops);
    }

    /** Returns home and away rows for a fixture. */
    async getByFixture(fixtureId: number): Promise<FixtureTeamStatPair> {
        const rows = await this.statRepo.find({ where: { fixtureId } });
        return {
            home: rows.find((r) => r.side === FixtureTeamStatSide.HOME) ?? null,
            away: rows.find((r) => r.side === FixtureTeamStatSide.AWAY) ?? null,
        };
    }
}
