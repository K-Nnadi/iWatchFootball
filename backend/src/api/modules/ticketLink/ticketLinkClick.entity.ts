import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn, OptionalEntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('ticketLinkClick')
export class TicketLinkClick extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'The ticket link that was clicked' })
    ticketLinkId!: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'User who clicked (null for anonymous)' })
    userId?: number;

    /** Denormalised for faster per-fixture aggregation without joining ticketLink. */
    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Fixture ID denormalised from the ticket link for fast reporting' })
    fixtureId?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 20 } })
    @ApiPropertyOptional({ description: 'Client source: WEB or MOBILE', enum: ['WEB', 'MOBILE'] })
    source?: 'WEB' | 'MOBILE';
}
