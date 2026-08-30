import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnalyticsEventSource, AnalyticsEventType } from '../../enums/analyticsEvent.enum';

@Entity('analyticsEvent')
export class AnalyticsEvent extends BaseDbEntity {
    @EntityEnumColumn({ db: { type: 'varchar', length: 40 } })
    @ApiProperty({ enum: AnalyticsEventType })
    eventType!: AnalyticsEventType;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    fixtureId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    ticketLinkId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    userId?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 10 } })
    @ApiPropertyOptional({ enum: AnalyticsEventSource })
    source?: AnalyticsEventSource;
}
