import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Log } from '../log/log.entity';
import { Player } from '../player/player.entity';
import {
    ADVANCED_LEADERBOARD_LABELS,
    ADVANCED_STAT_METRICS,
    type AdvancedStatMetricKey,
} from './advanced-stats.constants';
import { PlayerFixtureStatService } from './player-fixture-stat.service';

export type AttendanceLeaderboardEntry = {
    rank: number;
    playerId: number;
    name: string;
    value: number;
};

export type AttendanceLeaderboard = {
    metric: AdvancedStatMetricKey;
    title: string;
    entries: AttendanceLeaderboardEntry[];
};

export type AttendanceAdvancedStatsResponse = {
    leaderboards: AttendanceLeaderboard[];
};

const LEADERBOARD_METRICS: AdvancedStatMetricKey[] = [
    ADVANCED_STAT_METRICS.XG,
    ADVANCED_STAT_METRICS.XA,
    ADVANCED_STAT_METRICS.KEY_PASSES,
    ADVANCED_STAT_METRICS.TOUCHES_IN_OPPOSITION_BOX,
    ADVANCED_STAT_METRICS.SUCCESSFUL_DRIBBLES,
    ADVANCED_STAT_METRICS.INTERCEPTIONS,
    ADVANCED_STAT_METRICS.FOULS_COMMITTED,
];

@Injectable()
export class AttendanceAdvancedStatsService {
    constructor(
        @InjectRepository(Log) private readonly logRepo: Repository<Log>,
        @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
        private readonly fixtureStatService: PlayerFixtureStatService,
    ) {}

    async getLeaderboardsForUser(userId: number): Promise<AttendanceAdvancedStatsResponse> {
        const logs = await this.logRepo.find({
            where: { userId },
            select: ['fixtureId'],
        });
        const fixtureIds = [...new Set(logs.map((l) => l.fixtureId))];
        if (fixtureIds.length === 0) {
            return { leaderboards: [] };
        }

        const totals = await this.fixtureStatService.sumByPlayerForFixtures(fixtureIds);
        if (totals.size === 0) {
            return { leaderboards: [] };
        }

        const playerIds = [...totals.keys()];
        const players = await this.playerRepo.find({
            where: { id: In(playerIds) },
            select: ['id', 'name'],
        });
        const nameById = new Map(players.map((p) => [p.id, p.name]));

        const leaderboards: AttendanceLeaderboard[] = LEADERBOARD_METRICS.map((metric) => {
            const entries = [...totals.entries()]
                .map(([playerId, rollup]) => ({
                    playerId,
                    name: nameById.get(playerId) ?? `Player #${playerId}`,
                    value: this.metricValue(metric, rollup),
                }))
                .filter((e) => e.value > 0)
                .sort((a, b) => b.value - a.value)
                .slice(0, 50)
                .map((e, index) => ({ rank: index + 1, ...e }));

            return {
                metric,
                title: ADVANCED_LEADERBOARD_LABELS[metric],
                entries,
            };
        }).filter((lb) => lb.entries.length > 0);

        return { leaderboards };
    }

    private metricValue(
        metric: AdvancedStatMetricKey,
        rollup: {
            xg: number;
            xa: number;
            keyPasses: number;
            touchesInOppositionBox: number;
            successfulDribbles: number;
            interceptions: number;
            foulsCommitted: number;
        },
    ): number {
        switch (metric) {
            case ADVANCED_STAT_METRICS.XG:
                return Number(rollup.xg.toFixed(3));
            case ADVANCED_STAT_METRICS.XA:
                return Number(rollup.xa.toFixed(3));
            case ADVANCED_STAT_METRICS.KEY_PASSES:
                return rollup.keyPasses;
            case ADVANCED_STAT_METRICS.TOUCHES_IN_OPPOSITION_BOX:
                return rollup.touchesInOppositionBox;
            case ADVANCED_STAT_METRICS.SUCCESSFUL_DRIBBLES:
                return rollup.successfulDribbles;
            case ADVANCED_STAT_METRICS.INTERCEPTIONS:
                return rollup.interceptions;
            case ADVANCED_STAT_METRICS.FOULS_COMMITTED:
                return rollup.foulsCommitted;
            default:
                return 0;
        }
    }
}
