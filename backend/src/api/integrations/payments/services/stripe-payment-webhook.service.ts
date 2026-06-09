import { Injectable, Logger } from '@nestjs/common';
import { StripePaymentAdapter } from '../adapters/stripe/stripe-payment.adapter';
import { PaymentFulfillmentService } from './payment-fulfillment.service';
import { StripeEvent } from '../stripe/stripe-http.client';
import { StripeSubscriptionService } from './stripe-subscription.service';

@Injectable()
export class StripePaymentWebhookService {
    private readonly logger = new Logger(StripePaymentWebhookService.name);

    constructor(
        private readonly stripePaymentAdapter: StripePaymentAdapter,
        private readonly fulfillment: PaymentFulfillmentService,
        private readonly stripeSubscription: StripeSubscriptionService,
    ) {}

    async constructEvent(rawBody: Buffer, signature: string): Promise<StripeEvent> {
        return this.stripePaymentAdapter.verifyWebhook(rawBody, signature);
    }

    async handleEvent(event: StripeEvent): Promise<void> {
        const paymentEvent = this.stripePaymentAdapter.parseWebhookEvent(event);
        if (paymentEvent) {
            this.logger.log(`Stripe payment webhook: ${paymentEvent.type}`);
            if (
                paymentEvent.type === 'checkout.session.completed' &&
                paymentEvent.paymentSessionId &&
                paymentEvent.providerPaymentRef
            ) {
                await this.fulfillment.fulfillPrimaryCheckout(
                    paymentEvent.paymentSessionId,
                    paymentEvent.providerPaymentRef,
                );
            } else if (
                paymentEvent.type === 'checkout.session.expired' &&
                paymentEvent.paymentSessionId
            ) {
                await this.fulfillment.markExpired(paymentEvent.paymentSessionId);
            }
            return;
        }

        await this.stripeSubscription.handleWebhookEvent(event);
    }
}
