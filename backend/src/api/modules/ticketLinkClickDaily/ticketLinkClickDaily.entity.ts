import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('ticketLinkClickDaily')
export class TicketLinkClickDaily extends BaseDbEntity {
    @EntityColumn({ db: { type: 'date' } })
    @ApiProperty()
    day!: string;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    fixtureId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    ticketLinkId?: number;

    @EntityColumn({ db: { type: 'int', default: 0 } })
    @ApiProperty({ default: 0 })
    clickCount!: number;
}
