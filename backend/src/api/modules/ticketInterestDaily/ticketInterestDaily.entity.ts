import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('ticketInterestDaily')
export class TicketInterestDaily extends BaseDbEntity {
    @EntityColumn({ db: { type: 'date' } })
    @ApiProperty()
    day!: string;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    fixtureId?: number;

    @EntityColumn({ db: { type: 'int', default: 0 } })
    @ApiProperty({ default: 0 })
    activeCount!: number;

    @EntityColumn({ db: { type: 'int', default: 0 } })
    @ApiProperty({ default: 0 })
    notifiedCount!: number;
}
