import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Card } from '../card/card.entity';
import { CardType } from '../../enums/card.enum';
import { Goal } from '../goal/goal.entity';
import { PlayerFixtureStatService } from './player-fixture-stat.service';
import { PlayerLineUp } from '../playerLineUp/playerLineUp.entity';
import { LineUp } from '../lineUp/lineUp.entity';
import { Fixture } from '../fixture/fixture.entity';

export type AdvancedStatRow = {
    label: string;
    total: number | string;
    per90?: number | string;
};

export type AdvancedStatCategory = {
    title: string;
    rows: AdvancedStatRow[];
};

export type PlayerAdvancedStatsResponse = {
    minutes: number;
    categories: AdvancedStatCategory[];
    hasRollupData: boolean;
};

function per90(total: number, minutes: number, decimals = 1): number {
    if (minutes <= 0) return 0;
    return Number(((total / minutes) * 90).toFixed(decimals));
}

@Injectable()
export class PlayerAdvancedStatsService {
    constructor(
        private readonly fixtureStatService: PlayerFixtureStatService,
        @InjectRepository(Goal) private readonly goalRepo: Repository<Goal>,
        @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
        @InjectRepository(PlayerLineUp) private readonly playerLineUpRepo: Repository<PlayerLineUp>,
        @InjectRepository(Fixture) private readonly fixtureRepo: Repository<Fixture>,
    ) {}

    async getForPlayer(playerId: number, seasonId?: number): Promise<PlayerAdvancedStatsResponse> {
        const fixtureIds = await this.loadPlayerFixtureIds(playerId, seasonId);
        const minutes = await this.estimateMinutes(playerId, fixtureIds);

        const [rollupRows, goals, assists, yellowCards, redCards] = await Promise.all([
            this.fixtureStatService.findByPlayerAndFixtures(playerId, fixtureIds),
            this.countGoals(playerId, fixtureIds),
            this.countAssists(playerId, fixtureIds),
            this.countCards(playerId, fixtureIds, CardType.YELLOW),
            this.countCards(playerId, fixtureIds, CardType.RED),
        ]);

        const hasRollupData = rollupRows.length > 0;
        const totals = rollupRows.reduce(
            (acc, row) => ({
                xg: acc.xg + Number(row.xg ?? 0),
                xa: acc.xa + Number(row.xa ?? 0),
                shots: acc.shots + (row.shots ?? 0),
                shotsOnTarget: acc.shotsOnTarget + (row.shotsOnTarget ?? 0),
                headedShots: acc.headedShots + (row.headedShots ?? 0),
                successfulPasses: acc.successfulPasses + (row.successfulPasses ?? 0),
                passCompletionPct: row.passCompletionPct ?? acc.passCompletionPct,
                keyPasses: acc.keyPasses + (row.keyPasses ?? 0),
                chancesCreated: acc.chancesCreated + (row.chancesCreated ?? 0),
                bigChancesCreated: acc.bigChancesCreated + (row.bigChancesCreated ?? 0),
                successfulDribbles: acc.successfulDribbles + (row.successfulDribbles ?? 0),
                duelsWon: acc.duelsWon + (row.duelsWon ?? 0),
                touches: acc.touches + (row.touches ?? 0),
                touchesInOppositionBox: acc.touchesInOppositionBox + (row.touchesInOppositionBox ?? 0),
                foulsWon: acc.foulsWon + (row.foulsWon ?? 0),
                defensiveContributions:
                    acc.defensiveContributions + (row.defensiveContributions ?? 0),
                tackles: acc.tackles + (row.tackles ?? 0),
                interceptions: acc.interceptions + (row.interceptions ?? 0),
                recoveries: acc.recoveries + (row.recoveries ?? 0),
                foulsCommitted: acc.foulsCommitted + (row.foulsCommitted ?? 0),
                ratingSum: acc.ratingSum + Number(row.rating ?? 0),
                ratingCount: acc.ratingCount + (row.rating != null ? 1 : 0),
            }),
            {
                xg: 0,
                xa: 0,
                shots: 0,
                shotsOnTarget: 0,
                headedShots: 0,
                successfulPasses: 0,
                passCompletionPct: undefined as number | undefined,
                keyPasses: 0,
                chancesCreated: 0,
                bigChancesCreated: 0,
                successfulDribbles: 0,
                duelsWon: 0,
                touches: 0,
                touchesInOppositionBox: 0,
                foulsWon: 0,
                defensiveContributions: 0,
                tackles: 0,
                interceptions: 0,
                recoveries: 0,
                foulsCommitted: 0,
                ratingSum: 0,
                ratingCount: 0,
            },
        );

        const m = minutes;
        const passPct =
            totals.passCompletionPct != null ? `${totals.passCompletionPct}%` : '—';
        const avgRating =
            totals.ratingCount > 0
                ? Number((totals.ratingSum / totals.ratingCount).toFixed(2))
                : null;

        const categories: AdvancedStatCategory[] = [
            {
                title: 'Shooting',
                rows: [
                    { label: 'Goals', total: goals, per90: per90(goals, m) },
                    { label: 'Expected goals (xG)', total: Number(totals.xg.toFixed(2)), per90: per90(totals.xg, m, 2) },
                    { label: 'Shots', total: totals.shots, per90: per90(totals.shots, m) },
                    { label: 'Shots on target', total: totals.shotsOnTarget, per90: per90(totals.shotsOnTarget, m) },
                    { label: 'Headed shots', total: totals.headedShots, per90: per90(totals.headedShots, m) },
                ],
            },
            {
                title: 'Passing',
                rows: [
                    { label: 'Assists', total: assists, per90: per90(assists, m) },
                    { label: 'Expected assists (xA)', total: Number(totals.xa.toFixed(2)), per90: per90(totals.xa, m, 2) },
                    { label: 'Successful passes', total: totals.successfulPasses, per90: per90(totals.successfulPasses, m) },
                    { label: 'Successful passes %', total: passPct },
                    { label: 'Key passes', total: totals.keyPasses, per90: per90(totals.keyPasses, m) },
                    { label: 'Chances created', total: totals.chancesCreated, per90: per90(totals.chancesCreated, m) },
                    { label: 'Big chances created', total: totals.bigChancesCreated, per90: per90(totals.bigChancesCreated, m) },
                ],
            },
            {
                title: 'Possession',
                rows: [
                    { label: 'Successful dribbles', total: totals.successfulDribbles, per90: per90(totals.successfulDribbles, m) },
                    { label: 'Duels won', total: totals.duelsWon, per90: per90(totals.duelsWon, m) },
                    { label: 'Touches', total: totals.touches, per90: per90(totals.touches, m) },
                    { label: 'Touches in opposition box', total: totals.touchesInOppositionBox, per90: per90(totals.touchesInOppositionBox, m) },
                    { label: 'Fouls won', total: totals.foulsWon, per90: per90(totals.foulsWon, m) },
                ],
            },
            {
                title: 'Defending',
                rows: [
                    { label: 'Defensive contributions', total: totals.defensiveContributions, per90: per90(totals.defensiveContributions, m) },
                    { label: 'Tackles', total: totals.tackles, per90: per90(totals.tackles, m) },
                    { label: 'Interceptions', total: totals.interceptions, per90: per90(totals.interceptions, m) },
                    { label: 'Recoveries', total: totals.recoveries, per90: per90(totals.recoveries, m) },
                    { label: 'Fouls committed', total: totals.foulsCommitted, per90: per90(totals.foulsCommitted, m) },
                ],
            },
            {
                title: 'Discipline',
                rows: [
                    { label: 'Yellow cards', total: yellowCards, per90: per90(yellowCards, m, 2) },
                    { label: 'Red cards', total: redCards, per90: per90(redCards, m, 2) },
                ],
            },
        ];

        if (avgRating != null) {
            categories.push({
                title: 'General',
                rows: [{ label: 'Rating', total: avgRating }],
            });
        }

        return { minutes, categories, hasRollupData };
    }

    private async loadPlayerFixtureIds(playerId: number, seasonId?: number): Promise<number[]> {
        const lineups = await this.playerLineUpRepo
            .createQueryBuilder('plu')
            .innerJoin(LineUp, 'lu', 'lu.id = plu."lineupId" AND lu."deletedAt" IS NULL')
            .where('plu."playerId" = :playerId', { playerId })
            .andWhere('plu."deletedAt" IS NULL')
            .select('lu."fixtureId"', 'fixtureId')
            .getRawMany<{ fixtureId: number }>();

        let fixtureIds = [...new Set(lineups.map((r) => r.fixtureId))];
        if (seasonId != null && fixtureIds.length > 0) {
            const fixtures = await this.fixtureRepo.find({
                where: { id: In(fixtureIds), seasonId },
                select: ['id'],
            });
            fixtureIds = fixtures.map((f) => f.id);
        }
        return fixtureIds;
    }

    private async estimateMinutes(playerId: number, fixtureIds: number[]): Promise<number> {
        if (fixtureIds.length === 0) return 0;
        const count = await this.playerLineUpRepo
            .createQueryBuilder('plu')
            .innerJoin(LineUp, 'lu', 'lu.id = plu."lineupId" AND lu."deletedAt" IS NULL')
            .where('plu."playerId" = :playerId', { playerId })
            .andWhere('lu."fixtureId" IN (:...fixtureIds)', { fixtureIds })
            .andWhere('plu."deletedAt" IS NULL')
            .getCount();
        return count * 75;
    }

    private async countGoals(playerId: number, fixtureIds: number[]): Promise<number> {
        if (fixtureIds.length === 0) return 0;
        return this.goalRepo.count({
            where: { scorerId: playerId, fixtureId: In(fixtureIds) },
        });
    }

    private async countAssists(playerId: number, fixtureIds: number[]): Promise<number> {
        if (fixtureIds.length === 0) return 0;
        return this.goalRepo.count({
            where: { assistantId: playerId, fixtureId: In(fixtureIds) },
        });
    }

    private async countCards(
        playerId: number,
        fixtureIds: number[],
        type: CardType,
    ): Promise<number> {
        if (fixtureIds.length === 0) return 0;
        return this.cardRepo.count({
            where: { playerId, fixtureId: In(fixtureIds), type },
        });
    }
}
