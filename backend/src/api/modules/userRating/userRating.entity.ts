import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RatingRole } from '../../enums/rating.enum';

@Entity('userRating')
export class UserRating extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'Listing transaction ID' })
    listingId!: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Completed marketplace transaction (canonical for ratings)' })
    marketplaceTransactionId?: number;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'User who submitted this rating' })
    raterUserId!: number;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'User being rated' })
    targetUserId!: number;

    @EntityEnumColumn({ db: { type: 'varchar', length: 10 } })
    @ApiProperty({ enum: RatingRole, description: 'Role of the rater in the transaction' })
    raterRole!: RatingRole;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: '1–5 star rating', minimum: 1, maximum: 5 })
    score!: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 300 } })
    @ApiPropertyOptional()
    comment?: string;
}
