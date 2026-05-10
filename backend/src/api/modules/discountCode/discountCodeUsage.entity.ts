import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { DiscountCode } from './discountCode.entity';
import {
    EntityColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('discountCodeUsage')
export class DiscountCodeUsage extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    discountCodeId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => DiscountCode,
        joinOptions: { name: 'discountCodeId' },
        description: 'The discount code that was used',
    })
    discountCode!: DiscountCode;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'User who used the code' })
    userId!: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Payment linked to this usage' })
    paymentId?: number;

    @EntityColumn({ db: { type: 'decimal', precision: 10, scale: 2 } })
    @ApiProperty({ description: 'Actual discount amount saved (in £)' })
    discountAmount!: number;
}
