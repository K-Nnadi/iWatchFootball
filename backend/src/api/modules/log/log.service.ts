import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateLogDTO, Log } from './log.entity';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { TrackerEntitlementService, TrackerEntitlements } from '../../complexModules/tracker/tracker-entitlement.service';
import { AttendanceRecord } from '../attendanceRecord/attendanceRecord.entity';

export interface LogHistoryResponse {
    logs: Log[];
    entitlements: TrackerEntitlements;
}

@Injectable()
export class LogService extends CrudRepoAdapter<Log, CreateLogDTO> {
    constructor(
        @InjectRepository(Log) private entityRepo: Repository<Log>,
        private readonly trackerEntitlement: TrackerEntitlementService,
    ) {
        super(entityRepo);
    }

    /**
     * Upsert a verified attendance log when the user buys a ticket (primary or resale).
     * Also syncs attendanceRecord (hasTicket=true) — attendanceRecord is the source of
     * truth for "fans going" counts; log remains the tracker verified-attendance projection.
     * Idempotent per (userId, fixtureId).
     */
    async upsertVerifiedAttendance(
        manager: EntityManager,
        userId: number,
        fixtureId: number,
        source: { ticketId?: number; paymentId?: number; type?: string },
    ): Promise<void> {
        const logRepo = manager.getRepository(Log);
        const existing = await logRepo.findOne({ where: { userId, fixtureId } });
        if (existing) {
            if (!existing.isVerified) {
                existing.isVerified = true;
                existing.metadata = {
                    ...(existing.metadata ?? {}),
                    verifiedSource: source,
                };
                await logRepo.save(existing);
            }
        } else {
            await logRepo.save(
                logRepo.create({
                    userId,
                    fixtureId,
                    isVerified: true,
                    metadata: { verifiedSource: source },
                }),
            );
        }

        await this.syncVerifiedAttendanceRecord(manager, userId, fixtureId, source);
    }

    /** Mirror verified ticket purchase into attendanceRecord (P0-2 sync rule). */
    private async syncVerifiedAttendanceRecord(
        manager: EntityManager,
        userId: number,
        fixtureId: number,
        source: { ticketId?: number; paymentId?: number; type?: string },
    ): Promise<void> {
        const attendanceRepo = manager.getRepository(AttendanceRecord);
        let record = await attendanceRepo.findOne({
            where: { userId, fixtureId },
            withDeleted: true,
        });

        if (record) {
            record.deletedAt = null;
            record.hasTicket = true;
            record.metadata = {
                ...(record.metadata ?? {}),
                verifiedSource: source,
            };
            await attendanceRepo.save(record);
            return;
        }

        await attendanceRepo.save(
            attendanceRepo.create({
                userId,
                fixtureId,
                hasTicket: true,
                metadata: { verifiedSource: source },
            }),
        );
    }

    /** Count manual (non-verified) logs for freemium enforcement (one per fixture). */
    async countUnverifiedForUser(userId: number): Promise<number> {
        const rows = await this.entityRepo.find({
            where: { userId, isVerified: false },
            select: ['fixtureId'],
        });
        return new Set(rows.map((row) => row.fixtureId)).size;
    }

    private dedupeByFixture(logs: Log[]): Log[] {
        const bestByFixture = new Map<number, Log>();
        for (const log of logs) {
            const existing = bestByFixture.get(log.fixtureId);
            if (!existing) {
                bestByFixture.set(log.fixtureId, log);
                continue;
            }
            if (log.isVerified && !existing.isVerified) {
                bestByFixture.set(log.fixtureId, log);
                continue;
            }
            if (!log.isVerified && existing.isVerified) {
                continue;
            }
            if (log.createdAt.getTime() >= existing.createdAt.getTime()) {
                bestByFixture.set(log.fixtureId, log);
            }
        }
        return Array.from(bestByFixture.values());
    }

    override async create(entity: CreateLogDTO): Promise<Log | null> {
        const userId = entity.userId;
        const fixtureId = entity.fixtureId;
        const isVerified = entity.isVerified === true;

        if (userId && fixtureId) {
            const existing = await this.entityRepo.findOne({ where: { userId, fixtureId } });
            if (existing) {
                throw new ConflictException({
                    message: 'This match is already in your logs.',
                    code: 'LOG_ALREADY_EXISTS',
                    fixtureId,
                });
            }
        }

        if (!isVerified && userId) {
            const unverifiedCount = await this.countUnverifiedForUser(userId);
            await this.trackerEntitlement.assertCanAddUnverifiedLog(userId, unverifiedCount);
        }

        try {
            return super.create({
                ...entity,
                isVerified,
            }) as Promise<Log | null>;
        } catch (err: unknown) {
            const code =
                err &&
                typeof err === 'object' &&
                'driverError' in err &&
                (err as { driverError?: { code?: string } }).driverError?.code;
            if (code === '23505') {
                throw new ConflictException({
                    message: 'This match is already in your logs.',
                    code: 'LOG_ALREADY_EXISTS',
                    fixtureId,
                });
            }
            throw err;
        }
    }

    /** Gated history: free users see all manual logs + limited verified; premium sees all. */
    async getMyHistory(userId: number): Promise<LogHistoryResponse> {
        const all = this.dedupeByFixture(
            await this.entityRepo.find({
                where: { userId },
                order: { createdAt: 'DESC' },
            }),
        );

        const verified = all.filter((l) => l.isVerified);
        const unverified = all.filter((l) => !l.isVerified);
        const isPremium = await this.trackerEntitlement.hasPremium(userId);

        let visibleVerified = verified;
        if (!isPremium) {
            const limit = await this.trackerEntitlement.getFreeVerifiedLimit();
            visibleVerified = verified.slice(0, limit);
        }

        const logs = [...unverified, ...visibleVerified].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );

        const entitlements = await this.trackerEntitlement.buildEntitlements(
            userId,
            verified.length,
            visibleVerified.length,
            unverified.length,
        );

        return { logs, entitlements };
    }
}
