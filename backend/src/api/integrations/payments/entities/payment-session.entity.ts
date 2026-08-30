import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentSessionStatus } from '../../../enums/paymentSession.enum';

export interface PaymentSessionCheckoutContext {
    fixtureId: number;
    offerKey: string;
    holderId: string;
    quantity: number;
    unitPrice: number;
    category: string;
    discountCodeId?: number;
    paymentProcessorId?: number;
    listingId?: number;
    marketplaceTransactionId?: number;
}

@Entity('paymentSession')
export class PaymentSession extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    userId!: number;

    @EntityColumn({ db: { type: 'varchar', length: 32 } })
    providerSlug!: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255, unique: true } })
    providerSessionId?: string;

    @EntityEnumColumn({
        db: { enum: PaymentSessionStatus, default: PaymentSessionStatus.PENDING },
        api: { enum: PaymentSessionStatus },
    })
    status!: PaymentSessionStatus;

    @EntityColumn({ db: { type: 'decimal', precision: 18, scale: 2 } })
    amount!: string;

    @EntityColumn({ db: { type: 'varchar', length: 3, default: 'gbp' } })
    currency!: string;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    checkoutContext?: PaymentSessionCheckoutContext;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 128 } })
    idempotencyKey?: string;

    @EntityColumn({ db: { type: 'timestamptz' } })
    expiresAt!: Date;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255 } })
    providerPaymentRef?: string;

    @OptionalEntityColumn({ db: { type: 'int' } })
    paymentId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    listingId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    marketplaceTransactionId?: number;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    fulfilledAt?: Date;
}
