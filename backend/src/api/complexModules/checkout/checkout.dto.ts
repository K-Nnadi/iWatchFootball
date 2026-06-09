import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../enums/payment.enum';

export class ConfirmCheckoutDto {
    @ApiProperty()
    fixtureId!: number;

    @ApiProperty()
    offerKey!: string;

    @ApiProperty()
    holderId!: string;

    @ApiProperty({ minimum: 1 })
    quantity!: number;

    @ApiProperty()
    unitPrice!: number;

    @ApiProperty({ description: 'Ticket category label stored on Ticket rows' })
    category!: string;

    @ApiProperty({ enum: PaymentMethod })
    paymentMethod!: PaymentMethod;

    @ApiPropertyOptional()
    paymentProcessorId?: number;

    @ApiPropertyOptional({ description: 'Provider transaction id (e.g. Stripe payment_intent)' })
    providerPaymentRef?: string;

    @ApiPropertyOptional({ description: 'Client-generated idempotency key for safe retries' })
    idempotencyKey?: string;

    @ApiPropertyOptional({ description: 'Discount code id to apply (primary market only)' })
    discountCodeId?: number;
}

/** Trusted relay (e.g. after Stripe verification in a worker) — requires webhook secret header. */
export class WebhookConfirmCheckoutDto extends ConfirmCheckoutDto {
    @ApiProperty({ description: 'Purchasing user id (must match Stripe session metadata)' })
    userId!: number;
}
