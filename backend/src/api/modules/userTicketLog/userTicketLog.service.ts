import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UserTicketLog } from './userTicketLog.entity';

@Injectable()
export class UserTicketLogService {
    constructor(
        @InjectRepository(UserTicketLog)
        private readonly repo: Repository<UserTicketLog>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Creates a log entry if none exists, or reactivates an existing one.
     * Must be called inside a DB transaction via the shared EntityManager.
     */
    async upsert(manager: EntityManager, userId: number, ticketId: number): Promise<void> {
        const repo = manager.getRepository(UserTicketLog);
        const existing = await repo.findOne({ where: { userId, ticketId } });
        if (existing) {
            if (!existing.active) {
                existing.active = true;
                await repo.save(existing);
            }
        } else {
            await repo.save(repo.create({ userId, ticketId, active: true }));
        }
    }

    /**
     * Marks the log entry as inactive (ticket is no longer in the user's wallet).
     * Must be called inside a DB transaction via the shared EntityManager.
     */
    async deactivate(manager: EntityManager, userId: number, ticketId: number): Promise<void> {
        const repo = manager.getRepository(UserTicketLog);
        const existing = await repo.findOne({ where: { userId, ticketId } });
        if (existing && existing.active) {
            existing.active = false;
            await repo.save(existing);
        }
    }

    async getActiveForUser(userId: number): Promise<UserTicketLog[]> {
        // Raw join to avoid TypeORM lazy-relation + boolean-filter edge cases
        const rows: Array<{
            utl_id: number;
            utl_userId: number;
            utl_ticketId: number;
            utl_active: boolean;
            utl_createdAt: Date;
            utl_updatedAt: Date;
            t_id: number;
            t_category: string;
            t_price: string;
            t_fixtureId: number;
            t_metadata: Record<string, unknown> | null;
            f_date: Date | null;
            home_team_name: string | null;
            away_team_name: string | null;
        }> = await this.dataSource.query(
            `SELECT
                utl.id           AS "utl_id",
                utl."userId"     AS "utl_userId",
                utl."ticketId"   AS "utl_ticketId",
                utl.active       AS "utl_active",
                utl."createdAt"  AS "utl_createdAt",
                utl."updatedAt"  AS "utl_updatedAt",
                t.id             AS "t_id",
                t.category       AS "t_category",
                t.price          AS "t_price",
                t."fixtureId"    AS "t_fixtureId",
                t.metadata       AS "t_metadata",
                f.date           AS "f_date",
                ht.name          AS "home_team_name",
                at.name          AS "away_team_name"
             FROM "userTicketLog" utl
             LEFT JOIN ticket t ON t.id = utl."ticketId"
             LEFT JOIN fixture f ON f.id = t."fixtureId"
             LEFT JOIN team ht ON ht.id = f."homeTeamId"
             LEFT JOIN team at ON at.id = f."awayTeamId"
             WHERE utl."userId" = $1
               AND utl.active = true
               AND utl."deletedAt" IS NULL
             ORDER BY utl."createdAt" DESC`,
            [userId],
        );

        return rows.map((r) => {
            const home = r.home_team_name?.trim() || '';
            const away = r.away_team_name?.trim() || '';
            const fixtureLabel =
                home && away
                    ? `${home} vs ${away}`
                    : home || away
                      ? `${home || 'TBC'} vs ${away || 'TBC'}`
                      : `Fixture #${r.t_fixtureId}`;

            return {
                id: r.utl_id,
                userId: r.utl_userId,
                ticketId: r.utl_ticketId,
                active: r.utl_active,
                createdAt: r.utl_createdAt,
                updatedAt: r.utl_updatedAt,
                ticket: r.t_id
                    ? {
                          id: r.t_id,
                          category: r.t_category,
                          price: Number(r.t_price),
                          fixtureId: r.t_fixtureId,
                          metadata: r.t_metadata ?? undefined,
                          fixtureLabel,
                          fixtureDate: r.f_date ? new Date(r.f_date).toISOString() : undefined,
                      }
                    : null,
            };
        }) as unknown as UserTicketLog[];
    }
}
