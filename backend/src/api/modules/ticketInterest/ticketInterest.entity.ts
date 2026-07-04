import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketInterestStatus } from '../../enums/ticketInterest.enum';

@Entity('ticketInterest')
export class TicketInterest extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    userId!: number;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    fixtureId!: number;

    @EntityColumn({ db: { type: 'int', default: 1 } })
    @ApiProperty({ description: 'Number of tickets wanted (1–4)', minimum: 1, maximum: 4 })
    quantity!: number;

    @OptionalEntityColumn({ db: { type: 'decimal', precision: 10, scale: 2 } })
    @ApiPropertyOptional({ description: 'Max price the user is willing to pay (GBP). Private — never returned to public.' })
    maxPriceGbp?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 100 } })
    @ApiPropertyOptional({ description: 'Preferred stand or block' })
    preferredStand?: string;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    @ApiProperty({ description: 'True if the user wants a notification when resale goes live' })
    wantsNotification!: boolean;

    @EntityEnumColumn({ db: { type: 'varchar', length: 20 } })
    @ApiProperty({ enum: TicketInterestStatus })
    status!: TicketInterestStatus;
}
