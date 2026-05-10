import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED',
}

@Entity('discountCode')
export class DiscountCode extends BaseDbEntity {
    @EntityColumn({ db: { type: 'varchar', length: 50, unique: true } })
    @ApiProperty({ description: 'Unique code string entered by the user', example: 'SUMMER10' })
    code!: string;

    @EntityEnumColumn({ db: { type: 'varchar', length: 20 } })
    @ApiProperty({ enum: DiscountType, description: 'PERCENTAGE or FIXED amount off' })
    type!: DiscountType;

    @EntityColumn({ db: { type: 'decimal', precision: 10, scale: 2 } })
    @ApiProperty({ description: '10 = 10% off (PERCENTAGE) or £10 off (FIXED)', example: 10 })
    value!: number;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    @ApiProperty({ description: 'Whether this code is currently active' })
    active!: boolean;

    @EntityColumn({ db: { type: 'int', default: 1 } })
    @ApiProperty({ description: 'Max times a single user can use this code', default: 1 })
    maxUsesPerUser!: number;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional({ description: 'Optional expiry date' })
    expiresAt?: Date;

    @EntityColumn({ db: { type: 'int', default: 0 } })
    @ApiProperty({ description: 'Total number of times this code has been used across all users' })
    totalUsesCount!: number;
}
