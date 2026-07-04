import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { Ticket } from '../ticket/ticket.entity';
import { User } from '../user/user.entity';
import { EntityColumn, EntityEnumColumn, OptionalEntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryMethod, MarketplaceListingStatus, TicketType } from '../../enums/marketplace.enum';

@Entity('marketplaceListing')
export class MarketplaceListing extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    ticketId!: number;

    /** Not lazy — lazy ManyToOne relations serialize as `{}` in JSON responses, stripping ticket scalars used by marketplace UIs */
    @ManyToOne(() => Ticket, { lazy: false })
    @JoinColumn({ name: 'ticketId' })
    @ApiProperty({ description: 'Ticket being listed for resale', type: () => Ticket })
    ticket!: Ticket;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    sellerId!: number;

    @ManyToOne(() => User, { lazy: false })
    @JoinColumn({ name: 'sellerId' })
    @ApiProperty({ description: 'User who listed the ticket', type: () => User })
    seller!: User;

    @EntityColumn({ db: { type: 'decimal', precision: 10, scale: 2 } })
    @ApiProperty({ description: 'Asking price set by the seller' })
    askPrice!: number;

    @EntityEnumColumn({ db: { type: 'varchar', length: 20 } })
    @ApiProperty({ enum: MarketplaceListingStatus })
    status!: MarketplaceListingStatus;

    @EntityColumn({ db: { type: 'timestamptz' } })
    @ApiProperty({ description: 'Listing expires 24 hours before fixture kick-off' })
    expiresAt!: Date;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 20 } })
    @ApiPropertyOptional({ enum: TicketType })
    ticketType?: TicketType;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 25 } })
    @ApiPropertyOptional({ enum: DeliveryMethod })
    deliveryMethod?: DeliveryMethod;

    @OptionalEntityColumn({ db: { type: 'int', default: 1 } })
    @ApiPropertyOptional({ description: 'Number of tickets in this listing', default: 1 })
    quantity?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 300 } })
    @ApiPropertyOptional({ description: 'Seller notes (max 300 chars)' })
    description?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 100 } })
    @ApiPropertyOptional({ description: 'Stand or section' })
    seatSection?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 50 } })
    @ApiPropertyOptional()
    seatBlock?: string;

    /** Hidden until purchase confirmed */
    @OptionalEntityColumn({ db: { type: 'varchar', length: 20 } })
    seatRow?: string;

    /** Hidden until purchase confirmed */
    @OptionalEntityColumn({ db: { type: 'varchar', length: 20 } })
    seatNumber?: string;

    /** Internal storage path for admin-reviewable proof document. Never exposed to sellers post-upload. */
    @OptionalEntityColumn({ db: { type: 'varchar', length: 1000 } })
    proofDocumentPath?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional({ description: 'Reason for rejection (admin-facing)' })
    rejectionReason?: string;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'ID of the buyer who completed the purchase' })
    buyerId?: number;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    transferInitiatedAt?: Date;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    transferConfirmedAt?: Date;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    receiptConfirmedAt?: Date;

    @OptionalEntityColumn({ db: { type: 'decimal', precision: 5, scale: 4 } })
    @ApiPropertyOptional({ description: 'Buyer fee rate snapshotted at purchase time' })
    snapshotBuyerFeeRate?: number;

    @OptionalEntityColumn({ db: { type: 'decimal', precision: 5, scale: 4 } })
    @ApiPropertyOptional({ description: 'Seller fee rate snapshotted at purchase time' })
    snapshotSellerFeeRate?: number;
}
