import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PlayerLineUp } from '../playerLineUp/playerLineUp.entity';
import { LineUp } from '../lineUp/lineUp.entity';
import { Fixture } from '../fixture/fixture.entity';
import { Goal } from '../goal/goal.entity';
import { Team } from '../team/team.entity';
import { Card } from '../card/card.entity';
import { Substitution } from '../substitution/substitution.entity';
import { CardType } from '../../enums/card.enum';
import { FixtureStatus } from '../../enums/fixture.enum';
import type {
    PlayerMatchResult,
    PlayerMatchRow,
    PlayerMatchesResponse,
    PlayerSeasonSummary,
} from './player-matches.types';

type AppearanceRow = {
    fixtureId: number;
    fixtureDate: Date;
    homeTeamId: number | null;
    awayTeamId: number | null;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    competitionId: number;
    seasonId: number;
    playerTeamId: number;
    isStarting: boolean;
};

@Injectable()
export class PlayerMatchesService {
    constructor(
        @InjectRepository(PlayerLineUp) private readonly playerLineUpRepo: Repository<PlayerLineUp>,
        @InjectRepository(Goal) private readonly goalRepo: Repository<Goal>,
        @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
        @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
        @InjectRepository(Substitution) private readonly substitutionRepo: Repository<Substitution>,
    ) {}

    async getPlayerMatches(playerId: number, limit = 30): Promise<PlayerMatchesResponse> {
        const appearances = await this.loadAppearances(playerId, limit * 3);
        if (appearances.length === 0) {
            return { results: [], fixtures: [], season: emptySeason() };
        }

        const fixtureIds = [...new Set(appearances.map((a) => a.fixtureId))];
        const teamIds = new Set<number>();
        for (const a of appearances) {
            if (a.homeTeamId != null) teamIds.add(a.homeTeamId);
            if (a.awayTeamId != null) teamIds.add(a.awayTeamId);
        }

        const [teams, goalsByFixture, cardsByFixture, subsByFixture] = await Promise.all([
            teamIds.size > 0
                ? this.teamRepo.find({ where: { id: In([...teamIds]) } })
                : Promise.resolve([] as Team[]),
            this.loadGoalsByFixture(playerId, fixtureIds),
            this.loadCardsByFixture(playerId, fixtureIds),
            this.loadSubstitutionsByFixture(playerId, fixtureIds),
        ]);

        const teamNameById = new Map(teams.map((t) => [t.id, t.name]));

        const rows: PlayerMatchRow[] = appearances.map((a) => {
            const home = a.playerTeamId === a.homeTeamId;
            const opponentTeamId = home ? (a.awayTeamId ?? 0) : (a.homeTeamId ?? 0);
            const opponentName = teamNameById.get(opponentTeamId) ?? `Team #${opponentTeamId}`;
            const goalStats = goalsByFixture.get(a.fixtureId) ?? { goals: 0, assists: 0 };
            const homeScore = a.homeScore ?? undefined;
            const awayScore = a.awayScore ?? undefined;
            const hasScore = homeScore !== undefined && awayScore !== undefined;
            const finished = this.isFinished(a.status, hasScore);

            let result: PlayerMatchResult | undefined;
            if (finished && hasScore) {
                const playerGoals = home ? homeScore! : awayScore!;
                const oppGoals = home ? awayScore! : homeScore!;
                if (playerGoals > oppGoals) result = 'W';
                else if (playerGoals < oppGoals) result = 'L';
                else result = 'D';
            }

            const minutes = this.estimateMinutes(
                a.fixtureId,
                a.isStarting,
                subsByFixture.get(a.fixtureId),
            );

            return {
                fixtureId: a.fixtureId,
                date: a.fixtureDate.toISOString(),
                opponentTeamId,
                opponentName,
                home,
                ...(hasScore ? { homeScore, awayScore } : {}),
                ...(result ? { result } : {}),
                goals: goalStats.goals,
                assists: goalStats.assists,
                minutes,
                isStarting: a.isStarting,
                competitionId: a.competitionId,
            };
        });

        const now = Date.now();
        const deduped = dedupeByFixture(rows);
        const results = deduped
            .filter((r) => {
                const t = new Date(r.date).getTime();
                return t <= now && (r.result != null || (r.homeScore != null && r.awayScore != null));
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);

        const fixtures = deduped
            .filter((r) => {
                const t = new Date(r.date).getTime();
                return t > now && r.result == null;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, limit);

        const season = this.buildSeasonSummary(results, cardsByFixture);

        return { results, fixtures, season };
    }

    private async loadAppearances(playerId: number, take: number): Promise<AppearanceRow[]> {
        const raw = await this.playerLineUpRepo
            .createQueryBuilder('plu')
            .innerJoin(LineUp, 'lu', 'lu.id = plu."lineupId" AND lu."deletedAt" IS NULL')
            .innerJoin(Fixture, 'f', 'f.id = lu."fixtureId" AND f."deletedAt" IS NULL')
            .where('plu."playerId" = :playerId', { playerId })
            .andWhere('plu."deletedAt" IS NULL')
            .select([
                'f.id AS "fixtureId"',
                'f.date AS "fixtureDate"',
                'f."homeTeamId" AS "homeTeamId"',
                'f."awayTeamId" AS "awayTeamId"',
                'f."homeScore" AS "homeScore"',
                'f."awayScore" AS "awayScore"',
                'f.status AS status',
                'f."competitionId" AS "competitionId"',
                'f."seasonId" AS "seasonId"',
                'lu."teamId" AS "playerTeamId"',
                'plu."isStarting" AS "isStarting"',
            ])
            .orderBy('f.date', 'DESC')
            .limit(take)
            .getRawMany<AppearanceRow>();

        return raw;
    }

    private async loadGoalsByFixture(
        playerId: number,
        fixtureIds: number[],
    ): Promise<Map<number, { goals: number; assists: number }>> {
        if (fixtureIds.length === 0) return new Map();

        const goals = await this.goalRepo
            .createQueryBuilder('g')
            .where('g."fixtureId" IN (:...fixtureIds)', { fixtureIds })
            .andWhere('(g."scorerId" = :playerId OR g."assistantId" = :playerId)', { playerId })
            .andWhere('g."deletedAt" IS NULL')
            .getMany();

        const map = new Map<number, { goals: number; assists: number }>();
        for (const g of goals) {
            const cur = map.get(g.fixtureId) ?? { goals: 0, assists: 0 };
            if (g.scorerId === playerId && !g.ownGoal) cur.goals += 1;
            if (g.assistantId === playerId) cur.assists += 1;
            map.set(g.fixtureId, cur);
        }
        return map;
    }

    private async loadCardsByFixture(
        playerId: number,
        fixtureIds: number[],
    ): Promise<Map<number, { yellow: number; red: number }>> {
        if (fixtureIds.length === 0) return new Map();

        const cards = await this.cardRepo.find({
            where: { playerId, fixtureId: In(fixtureIds) },
        });

        const map = new Map<number, { yellow: number; red: number }>();
        for (const c of cards) {
            const cur = map.get(c.fixtureId) ?? { yellow: 0, red: 0 };
            if (c.type === CardType.YELLOW) cur.yellow += 1;
            if (c.type === CardType.RED) cur.red += 1;
            map.set(c.fixtureId, cur);
        }
        return map;
    }

    private async loadSubstitutionsByFixture(
        playerId: number,
        fixtureIds: number[],
    ): Promise<Map<number, { inMinute?: number; outMinute?: number }>> {
        if (fixtureIds.length === 0) return new Map();

        const subs = await this.substitutionRepo
            .createQueryBuilder('s')
            .where('s."fixtureId" IN (:...fixtureIds)', { fixtureIds })
            .andWhere('(s."playerInId" = :playerId OR s."playerOutId" = :playerId)', { playerId })
            .andWhere('s."deletedAt" IS NULL')
            .getMany();

        const map = new Map<number, { inMinute?: number; outMinute?: number }>();
        for (const s of subs) {
            const cur = map.get(s.fixtureId) ?? {};
            if (s.playerInId === playerId) cur.inMinute = s.minute;
            if (s.playerOutId === playerId) cur.outMinute = s.minute;
            map.set(s.fixtureId, cur);
        }
        return map;
    }

    private estimateMinutes(
        _fixtureId: number,
        isStarting: boolean,
        sub?: { inMinute?: number; outMinute?: number },
    ): number {
        if (sub?.inMinute != null && sub.outMinute != null) {
            return Math.max(0, sub.outMinute - sub.inMinute);
        }
        if (sub?.outMinute != null) return sub.outMinute;
        if (sub?.inMinute != null) return Math.max(0, 90 - sub.inMinute);
        if (isStarting) return 90;
        return 0;
    }

    private isFinished(status: string, hasScore: boolean): boolean {
        if (status === FixtureStatus.COMPLETED) return true;
        if (status === FixtureStatus.LIVE) return false;
        if (status === FixtureStatus.SCHEDULED) return false;
        return hasScore;
    }

    private buildSeasonSummary(
        results: PlayerMatchRow[],
        cardsByFixture: Map<number, { yellow: number; red: number }>,
    ): PlayerSeasonSummary {
        let goals = 0;
        let assists = 0;
        let started = 0;
        let minutes = 0;
        let yellowCards = 0;
        let redCards = 0;

        for (const r of results) {
            goals += r.goals;
            assists += r.assists;
            if (r.isStarting) started += 1;
            minutes += r.minutes;
            const cards = cardsByFixture.get(r.fixtureId);
            if (cards) {
                yellowCards += cards.yellow;
                redCards += cards.red;
            }
        }

        const rating =
            results.length > 0
                ? Number(
                      (
                          6.5 +
                          (goals / results.length) * 0.8 +
                          (assists / results.length) * 0.5
                      ).toFixed(2),
                  )
                : 0;

        return {
            competition: 'Current season',
            goals,
            assists,
            started,
            matches: results.length,
            minutes,
            rating,
            yellowCards,
            redCards,
        };
    }
}

function dedupeByFixture(rows: PlayerMatchRow[]): PlayerMatchRow[] {
    const byId = new Map<number, PlayerMatchRow>();
    for (const row of rows) {
        const existing = byId.get(row.fixtureId);
        if (!existing || row.minutes > existing.minutes) {
            byId.set(row.fixtureId, row);
        }
    }
    return [...byId.values()];
}

function emptySeason(): PlayerSeasonSummary {
    return {
        competition: 'Current season',
        goals: 0,
        assists: 0,
        started: 0,
        matches: 0,
        minutes: 0,
        rating: 0,
        yellowCards: 0,
        redCards: 0,
    };
}
