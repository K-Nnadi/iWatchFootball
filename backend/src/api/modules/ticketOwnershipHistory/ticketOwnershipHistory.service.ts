import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TicketOwnershipHistory } from './ticketOwnershipHistory.entity';
import { TicketTransferReason } from '../../enums/marketplace.enum';

export interface RecordTransferParams {
    ticketId: number;
    fromUserId?: number;
    toUserId?: number;
    reason: TicketTransferReason;
    paymentId?: number;
    listingId?: number;
    marketplaceTransactionId?: number;
}

/**
 * Must be called inside an existing TypeORM transaction (EntityManager passed in)
 * so ownership history is always written atomically with the custody change itself.
 */
@Injectable()
export class TicketOwnershipHistoryService {
    async record(manager: EntityManager, params: RecordTransferParams): Promise<void> {
        const repo = manager.getRepository(TicketOwnershipHistory);
        const entry = repo.create({
            ticketId: params.ticketId,
            fromUserId: params.fromUserId,
            toUserId: params.toUserId,
            reason: params.reason,
            paymentId: params.paymentId,
            listingId: params.listingId,
            marketplaceTransactionId: params.marketplaceTransactionId,
        });
        await repo.save(entry);
    }

    async getHistoryForTicket(
        manager: EntityManager,
        ticketId: number,
    ): Promise<TicketOwnershipHistory[]> {
        return manager.getRepository(TicketOwnershipHistory).find({
            where: { ticketId },
            order: { createdAt: 'ASC' },
        });
    }
}
