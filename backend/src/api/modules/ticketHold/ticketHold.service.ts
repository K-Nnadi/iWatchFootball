import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TicketHold } from './ticketHold.entity';
import { PlatformConfigService } from '../platformConfig/platformConfig.service';

const HOLD_MINUTES_CONFIG_KEY = 'ticket_hold_minutes';
const DEFAULT_HOLD_MINUTES = 10;
const MAX_HOLD_MINUTES = 60;

@Injectable()
export class TicketHoldService {
    constructor(
        @InjectRepository(TicketHold)
        private readonly repo: Repository<TicketHold>,
        private readonly platformConfig: PlatformConfigService,
    ) {}

    async purgeExpired(): Promise<void> {
        await this.repo
            .createQueryBuilder()
            .softDelete()
            .where('"expiresAt" < :now', { now: new Date() })
            .execute();
    }

    async acquire(params: {
        fixtureId: number;
        offerKey: string;
        holderId: string;
        userId: number;
        quantity: number;
        holdMinutes?: number;
    }): Promise<{ expiresAt: string; holdMinutes: number }> {
        const configuredMinutes = await this.platformConfig.getNumber(
            HOLD_MINUTES_CONFIG_KEY,
            DEFAULT_HOLD_MINUTES,
        );
        const holdMinutes = Math.min(
            MAX_HOLD_MINUTES,
            Math.max(1, params.holdMinutes ?? configuredMinutes),
        );
        const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

        await this.purgeExpired();

        return this.repo.manager.transaction(async (em) => {
            const repo = em.getRepository(TicketHold);
            const existing = await repo.findOne({
                where: { fixtureId: params.fixtureId, offerKey: params.offerKey },
            });

            if (existing) {
                if (existing.userId !== params.userId) {
                    throw new ConflictException(
                        'This ticket listing is currently held by another customer. Try again shortly.',
                    );
                }
                existing.holderId = params.holderId;
                existing.quantity = params.quantity;
                existing.expiresAt = expiresAt;
                await repo.save(existing);
                return { expiresAt: existing.expiresAt.toISOString(), holdMinutes };
            }

            const row = repo.create({
                fixtureId: params.fixtureId,
                offerKey: params.offerKey,
                holderId: params.holderId,
                userId: params.userId,
                quantity: params.quantity,
                expiresAt,
            });
            try {
                await repo.save(row);
            } catch (e) {
                if (e instanceof QueryFailedError && (e as any).code === '23505') {
                    throw new ConflictException(
                        'This ticket listing is currently held by another customer. Try again shortly.',
                    );
                }
                throw e;
            }
            return { expiresAt: row.expiresAt.toISOString(), holdMinutes };
        });
    }

    async release(holderId: string, userId: number): Promise<void> {
        await this.purgeExpired();
        const result = await this.repo.softDelete({ holderId, userId });
        if (!result.affected) {
            throw new NotFoundException('No active hold found for this session');
        }
    }

    async verify(params: {
        fixtureId: number;
        offerKey: string;
        holderId: string;
        userId: number;
    }): Promise<{ expiresAt: string }> {
        await this.purgeExpired();
        const row = await this.repo.findOne({
            where: {
                fixtureId: params.fixtureId,
                offerKey: params.offerKey,
                holderId: params.holderId,
                userId: params.userId,
            },
        });
        if (!row || row.expiresAt.getTime() <= Date.now()) {
            throw new UnauthorizedException(
                'Your ticket hold has expired or is invalid. Return to seat selection.',
            );
        }
        return { expiresAt: row.expiresAt.toISOString() };
    }
}
