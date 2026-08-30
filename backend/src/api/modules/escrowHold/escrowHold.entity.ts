import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EscrowHoldStatus } from '../../enums/escrowHold.enum';

@Entity('escrowHold')
export class EscrowHold extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    marketplaceTransactionId!: number;

    @EntityColumn({ db: { type: 'decimal', precision: 10, scale: 2 } })
    @ApiProperty()
    amount!: number;

    @EntityColumn({ db: { type: 'varchar', length: 3, default: 'GBP' } })
    @ApiProperty({ default: 'GBP' })
    currency!: string;

    @EntityEnumColumn({ db: { type: 'varchar', length: 20 } })
    @ApiProperty({ enum: EscrowHoldStatus })
    status!: EscrowHoldStatus;

    @EntityColumn({ db: { type: 'timestamptz' } })
    @ApiProperty()
    heldAt!: Date;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    releasedAt?: Date;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    refundedAt?: Date;
}
