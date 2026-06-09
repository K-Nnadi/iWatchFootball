import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateLogDTO, Log } from './log.entity';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { TrackerEntitlementService, TrackerEntitlements } from '../../complexModules/tracker/tracker-entitlement.service';

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
            return;
        }
        await logRepo.save(
            logRepo.create({
                userId,
                fixtureId,
                isVerified: true,
                metadata: { verifiedSource: source },
            }),
        );
    }

    /** Gated history: free users see all manual logs + limited verified; premium sees all. */
    async getMyHistory(userId: number): Promise<LogHistoryResponse> {
        const all = await this.entityRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

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
        );

        return { logs, entitlements };
    }
}
