import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('sellerProfile')
export class SellerProfile extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int', unique: true } })
    @ApiProperty()
    userId!: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiPropertyOptional()
    stripeConnectAccountId?: string;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ default: false })
    stripeConnectOnboardingComplete!: boolean;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ default: false })
    payoutsEnabled!: boolean;
}
