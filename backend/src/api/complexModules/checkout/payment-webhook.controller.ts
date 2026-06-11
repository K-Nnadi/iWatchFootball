import {
    Body,
    Controller,
    GoneException,
    Headers,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { CheckoutService } from './checkout.service';
import { WebhookConfirmCheckoutDto } from './checkout.dto';

function isLegacyPaymentWebhookEnabled(): boolean {
    return process.env.LEGACY_PAYMENT_WEBHOOK_ENABLED === 'true';
}

/**
 * @deprecated Use native Stripe webhooks at POST /webhooks/stripe (signature-verified).
 * This shared-secret relay cannot complete card payments under current checkout rules.
 */
@SkipThrottle()
@Controller('webhooks')
@ApiTags('webhooks')
export class PaymentWebhookController {
    constructor(private readonly checkoutService: CheckoutService) {}

    @Post('payment')
    @Public()
    @ApiOperation({
        summary: 'Deprecated — use POST /webhooks/stripe',
        deprecated: true,
    })
    @ApiBody({ type: WebhookConfirmCheckoutDto })
    async handlePaymentConfirmed(
        @Headers('x-payment-webhook-secret') secret: string | undefined,
        @Body() body: WebhookConfirmCheckoutDto,
    ) {
        if (!isLegacyPaymentWebhookEnabled()) {
            throw new GoneException(
                'This endpoint is retired. Configure Stripe to POST to /webhooks/stripe instead.',
            );
        }

        const expected = process.env.PAYMENT_WEBHOOK_SECRET;
        if (!expected || secret !== expected) {
            throw new UnauthorizedException('Invalid webhook secret');
        }
        return this.checkoutService.confirmPurchase({
            userId: body.userId,
            fixtureId: body.fixtureId,
            offerKey: body.offerKey,
            holderId: body.holderId,
            quantity: body.quantity,
            unitPrice: body.unitPrice,
            category: body.category,
            paymentMethod: body.paymentMethod,
            paymentProcessorId: body.paymentProcessorId,
            providerPaymentRef: body.providerPaymentRef,
            idempotencyKey: body.idempotencyKey ?? body.providerPaymentRef,
        });
    }
}
