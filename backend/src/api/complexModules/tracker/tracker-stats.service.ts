import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../../modules/log/log.entity';

export interface TrackerSummary {
    totalMatches: number;
    verifiedMatches: number;
    uniqueStadiums: number;
    uniqueTeams: number;
    uniqueCompetitions: number;
}

export interface OverlapFixture {
    fixtureId: number;
    date: string;
    homeTeamId: number;
    awayTeamId: number;
    homeTeamName: string | null;
    awayTeamName: string | null;
    competitionId: number | null;
}

@Injectable()
export class TrackerStatsService {
    constructor(
        @InjectRepository(Log)
        private readonly logRepo: Repository<Log>,
    ) {}

    async getSummary(userId: number, verifiedOnly: boolean): Promise<TrackerSummary> {
        const verifiedFilter = verifiedOnly ? `AND l."isVerified" = true` : '';
        const rows = await this.logRepo.query(
            `
            SELECT
                COUNT(*)::int AS "totalMatches",
                COUNT(*) FILTER (WHERE l."isVerified")::int AS "verifiedMatches",
                COUNT(DISTINCT f."stadiumId") FILTER (WHERE f."stadiumId" IS NOT NULL)::int AS "uniqueStadiums",
                COUNT(DISTINCT t.team_id)::int AS "uniqueTeams",
                COUNT(DISTINCT f."competitionId") FILTER (WHERE f."competitionId" IS NOT NULL)::int AS "uniqueCompetitions"
            FROM "log" l
            JOIN "fixture" f ON f.id = l."fixtureId"
            LEFT JOIN LATERAL (
                SELECT unnest(ARRAY[f."homeTeamId", f."awayTeamId"]) AS team_id
            ) t ON true
            WHERE l."userId" = $1
              AND l."deletedAt" IS NULL
              ${verifiedFilter}
            `,
            [userId],
        );

        const row = rows[0] ?? {};
        return {
            totalMatches: Number(row.totalMatches ?? 0),
            verifiedMatches: Number(row.verifiedMatches ?? 0),
            uniqueStadiums: Number(row.uniqueStadiums ?? 0),
            uniqueTeams: Number(row.uniqueTeams ?? 0),
            uniqueCompetitions: Number(row.uniqueCompetitions ?? 0),
        };
    }

    async getOverlapFixtures(
        userId: number,
        friendId: number,
        verifiedOnly: boolean,
        limit = 50,
    ): Promise<OverlapFixture[]> {
        const verifiedFilter = verifiedOnly
            ? `AND l1."isVerified" = true AND l2."isVerified" = true`
            : '';
        const rows = await this.logRepo.query(
            `
            SELECT
                f.id AS "fixtureId",
                f."date" AS "date",
                f."homeTeamId" AS "homeTeamId",
                f."awayTeamId" AS "awayTeamId",
                f."competitionId" AS "competitionId",
                ht.name AS "homeTeamName",
                at.name AS "awayTeamName"
            FROM "log" l1
            JOIN "log" l2
                ON l2."fixtureId" = l1."fixtureId"
                AND l2."userId" = $2
                AND l2."deletedAt" IS NULL
            JOIN "fixture" f ON f.id = l1."fixtureId"
            LEFT JOIN "team" ht ON ht.id = f."homeTeamId"
            LEFT JOIN "team" at ON at.id = f."awayTeamId"
            WHERE l1."userId" = $1
              AND l1."deletedAt" IS NULL
              ${verifiedFilter}
            ORDER BY f."date" DESC
            LIMIT $3
            `,
            [userId, friendId, limit],
        );

        return rows.map((row: Record<string, unknown>) => ({
            fixtureId: Number(row.fixtureId),
            date: row.date instanceof Date ? row.date.toISOString() : String(row.date),
            homeTeamId: Number(row.homeTeamId),
            awayTeamId: Number(row.awayTeamId),
            homeTeamName: row.homeTeamName != null ? String(row.homeTeamName) : null,
            awayTeamName: row.awayTeamName != null ? String(row.awayTeamName) : null,
            competitionId: row.competitionId != null ? Number(row.competitionId) : null,
        }));
    }
}
