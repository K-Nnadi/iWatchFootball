import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { CheckoutService } from './checkout.service';
import { WebhookConfirmCheckoutDto } from './checkout.dto';

/**
 * Trusted payment relay: verify Stripe (or other PSP) in your edge worker, then POST here
 * with X-Payment-Webhook-Secret matching PAYMENT_WEBHOOK_SECRET.
 *
 * Do not expose this URL without the secret. For native Stripe signature verification
 * on raw bodies, add a Fastify raw-body plugin and validate stripe-signature separately.
 */
@Controller('webhooks')
@ApiTags('webhooks')
export class PaymentWebhookController {
    constructor(private readonly checkoutService: CheckoutService) {}

    @Post('payment')
    @Public()
    @ApiOperation({
        summary:
            'Complete checkout after external PSP success (shared-secret trusted relay)',
    })
    @ApiBody({ type: WebhookConfirmCheckoutDto })
    async handlePaymentConfirmed(
        @Headers('x-payment-webhook-secret') secret: string | undefined,
        @Body() body: WebhookConfirmCheckoutDto,
    ) {
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
