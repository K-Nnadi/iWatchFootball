import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { Ticket } from '../ticket/ticket.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketTransferReason } from '../../enums/marketplace.enum';

/**
 * Immutable audit log of every change in ticket custody.
 * Covers both primary-market purchases and all marketplace custody transitions.
 */
@Entity('ticketOwnershipHistory')
export class TicketOwnershipHistory extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'Ticket whose custody changed' })
    ticketId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Ticket,
        joinOptions: { name: 'ticketId' },
        description: 'Ticket whose custody changed',
    })
    ticket!: Ticket;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'Previous owner user id. NULL = platform custody or initial issue.' },
    })
    fromUserId?: number;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'New owner user id. NULL = transferred to platform custody.' },
    })
    toUserId?: number;

    @EntityEnumColumn({ db: { type: 'varchar', length: 30 } })
    @ApiProperty({ enum: TicketTransferReason })
    reason!: TicketTransferReason;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'Linked payment id for primary purchases' },
    })
    paymentId?: number;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'Linked marketplace listing id (resale events)' },
    })
    listingId?: number;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'Linked marketplace transaction id (sale event)' },
    })
    marketplaceTransactionId?: number;
}
