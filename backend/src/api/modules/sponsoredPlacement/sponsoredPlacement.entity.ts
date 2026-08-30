import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketLink } from '../ticketLink/ticketLink.entity';

@Entity('sponsoredPlacement')
export class SponsoredPlacement extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'FK to ticketLink (isSponsored = true)' })
    linkId!: number;

    @ManyToOne(() => TicketLink, { lazy: false })
    @JoinColumn({ name: 'linkId' })
    link!: TicketLink;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    fixtureId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    teamId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    competitionId?: number;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Show on all match pages when true' })
    isGlobal!: boolean;

    @EntityColumn({ db: { type: 'timestamptz' } })
    @ApiProperty()
    startDate!: Date;

    @EntityColumn({ db: { type: 'timestamptz' } })
    @ApiProperty()
    endDate!: Date;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    impressionTarget?: number;

    @EntityColumn({ db: { type: 'int', default: 0 } })
    @ApiProperty({ default: 0 })
    impressionCount!: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional()
    notes?: string;
}
