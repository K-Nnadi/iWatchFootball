import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('userTrustScore')
export class UserTrustScore extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int', unique: true } })
    @ApiProperty()
    userId!: number;

    @EntityColumn({ db: { type: 'decimal', precision: 5, scale: 2, default: 0 } })
    @ApiProperty({ description: 'Aggregated trust score (0–100)' })
    score!: number;

    @OptionalEntityColumn({ db: { type: 'int', default: 0 } })
    @ApiPropertyOptional()
    ratingCount?: number;

    @OptionalEntityColumn({ db: { type: 'int', default: 0 } })
    @ApiPropertyOptional()
    disputeCount?: number;

    @EntityColumn({ db: { type: 'timestamptz' } })
    @ApiProperty()
    computedAt!: Date;
}
