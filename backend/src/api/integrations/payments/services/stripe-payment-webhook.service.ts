import { Injectable, Logger } from '@nestjs/common';
import { StripePaymentAdapter } from '../adapters/stripe/stripe-payment.adapter';
import {
    PaymentFulfillmentRejectedError,
    PaymentFulfillmentService,
} from './payment-fulfillment.service';
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

        try {
            if (paymentEvent) {
                this.logger.log(
                    JSON.stringify({
                        type: 'stripe_webhook_payment',
                        stripeEventId: event.id,
                        eventType: paymentEvent.type,
                        paymentSessionId: paymentEvent.paymentSessionId,
                    }),
                );
                if (
                    paymentEvent.type === 'checkout.session.completed' &&
                    paymentEvent.paymentSessionId &&
                    paymentEvent.providerPaymentRef
                ) {
                    await this.fulfillment.fulfillPrimaryCheckout({
                        paymentSessionId: paymentEvent.paymentSessionId,
                        providerPaymentRef: paymentEvent.providerPaymentRef,
                        paymentStatus: paymentEvent.paymentStatus,
                        amountTotalCents: paymentEvent.amountTotalCents,
                        currency: paymentEvent.currency,
                    });
                } else if (
                    paymentEvent.type === 'checkout.session.expired' &&
                    paymentEvent.paymentSessionId
                ) {
                    await this.fulfillment.markExpired(paymentEvent.paymentSessionId);
                }
            } else {
                await this.stripeSubscription.handleWebhookEvent(event);
            }

            this.logger.log(
                JSON.stringify({
                    type: 'stripe_webhook_processed',
                    stripeEventId: event.id,
                    eventType: event.type,
                }),
            );
        } catch (e) {
            if (e instanceof PaymentFulfillmentRejectedError) {
                this.logger.warn(
                    JSON.stringify({
                        type: 'stripe_webhook_rejected',
                        stripeEventId: event.id,
                        eventType: event.type,
                        message: e.message,
                    }),
                );
                return;
            }
            this.logger.error(
                JSON.stringify({
                    type: 'stripe_webhook_failed',
                    stripeEventId: event.id,
                    eventType: event.type,
                    message: e instanceof Error ? e.message : String(e),
                }),
            );
            throw e;
        }
    }
}
