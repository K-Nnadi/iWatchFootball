import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('attendanceRecord')
export class AttendanceRecord extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    userId!: number;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    fixtureId!: number;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'True if the user has or had a ticket for this match' })
    hasTicket!: boolean;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 100 } })
    @ApiPropertyOptional({ description: 'Stand or section (e.g. "North Stand")' })
    seatSection?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 50 } })
    @ApiPropertyOptional({ description: 'Block within the section' })
    seatBlock?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 20 } })
    @ApiPropertyOptional()
    seatRow?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 20 } })
    @ApiPropertyOptional()
    seatNumber?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 100 } })
    @ApiPropertyOptional({ description: 'Ticket provider (e.g. "Club website", "Ticketmaster")' })
    ticketProvider?: string;

    @OptionalEntityColumn({ db: { type: 'date' } })
    @ApiPropertyOptional()
    purchaseDate?: Date;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional({ description: 'Private notes (max 500 chars)' })
    notes?: string;

    /** Storage path for uploaded ticket document. Never returned to clients; signed URL generated on demand. */
    @OptionalEntityColumn({ db: { type: 'varchar', length: 1000 } })
    documentPath?: string;
}
