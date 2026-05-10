import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { Ticket } from '../ticket/ticket.entity';
import { User } from '../user/user.entity';
import { EntityColumn, EntityEnumColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { MarketplaceListingStatus } from '../../enums/marketplace.enum';

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
}
