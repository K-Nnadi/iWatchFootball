import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeStatus } from '../../enums/marketplace.enum';

@Entity('marketplaceDispute')
export class MarketplaceDispute extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    listingId!: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    marketplaceTransactionId?: number;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    raisedByUserId!: number;

    @EntityColumn({ db: { type: 'varchar', length: 200 } })
    @ApiProperty()
    reason!: string;

    @EntityColumn({ db: { type: 'varchar', length: 1000 } })
    @ApiProperty()
    details!: string;

    @EntityEnumColumn({ db: { type: 'varchar', length: 20 } })
    @ApiProperty({ enum: DisputeStatus })
    status!: DisputeStatus;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    resolvedAt?: Date;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    resolvedByUserId?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 1000 } })
    @ApiPropertyOptional()
    resolutionNotes?: string;
}
