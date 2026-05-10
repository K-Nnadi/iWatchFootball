import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Short-lived server reservation for a listing (fixture + offerKey) before payment.
 * Not a full checkout — see CheckoutModule for payment + issuing Ticket rows.
 */
@Entity('ticketHold')
export class TicketHold extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    fixtureId!: number;

    @EntityColumn({ db: { type: 'varchar', length: 512 } })
    @ApiProperty()
    offerKey!: string;

    @EntityColumn({ db: { type: 'varchar', length: 36 } })
    @ApiProperty({ description: 'Client-generated session id (UUID)' })
    holderId!: string;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    userId!: number;

    @EntityColumn({ db: { type: 'int', default: 1 } })
    @ApiProperty()
    quantity!: number;

    @EntityColumn({ db: { type: 'timestamptz' } })
    @ApiProperty()
    expiresAt!: Date;
}
