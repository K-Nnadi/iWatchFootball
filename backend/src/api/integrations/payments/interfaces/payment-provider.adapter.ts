import {
    CreateSessionResult,
    PaymentContext,
    WebhookEventResult,
} from '../types/payment-integration.types';
import { StripeEvent } from '../stripe/stripe-http.client';

export interface PaymentProviderAdapter {
    readonly slug: string;
    createCheckoutSession(ctx: PaymentContext): Promise<CreateSessionResult>;
    verifyWebhook(rawBody: Buffer, signature: string): Promise<StripeEvent>;
    parseWebhookEvent(event: StripeEvent): WebhookEventResult | null;
}
