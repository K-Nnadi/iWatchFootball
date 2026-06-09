import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../../enums/payment.enum';

export class ConfirmMarketplacePurchaseDto {
    @ApiProperty({ description: 'ID of the marketplace listing to purchase' })
    listingId!: number;

    @ApiProperty({ description: 'holderId returned by POST /marketplace/hold/:listingId' })
    holderId!: string;

    @ApiProperty({ enum: PaymentMethod })
    paymentMethod!: PaymentMethod;

    @ApiPropertyOptional({ description: 'ID of the payment processor used' })
    paymentProcessorId?: number;

    @ApiPropertyOptional({ description: 'Provider transaction reference (e.g. Stripe payment_intent)' })
    providerPaymentRef?: string;

    @ApiPropertyOptional({ description: 'Client-generated idempotency key for safe retries' })
    idempotencyKey?: string;
}
