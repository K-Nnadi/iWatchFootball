import { Injectable } from '@nestjs/common';
import { PaymentProviderAdapter } from '../../interfaces/payment-provider.adapter';
import {
    CreateSessionResult,
    PaymentContext,
    WebhookEventResult,
} from '../../types/payment-integration.types';
import { StripeCredentialsService } from '../../services/stripe-credentials.service';
import {
    stripeConstructEvent,
    stripeCreatePaymentCheckoutSession,
    StripeEvent,
} from '../../stripe/stripe-http.client';

@Injectable()
export class StripePaymentAdapter implements PaymentProviderAdapter {
    readonly slug = 'stripe';

    constructor(private readonly credentials: StripeCredentialsService) {}

    async createCheckoutSession(ctx: PaymentContext): Promise<CreateSessionResult> {
        const secretKey = await this.credentials.getSecretKey();
        const publishableKey = await this.credentials.getPublishableKey();

        const amountPence = Math.round(ctx.amount * 100);
        const expiresAtUnix = Math.floor(ctx.holdExpiresAt.getTime() / 1000);

        const session = await stripeCreatePaymentCheckoutSession(secretKey, {
            amountPence,
            currency: ctx.currency,
            userId: ctx.userId,
            paymentSessionId: ctx.paymentSessionId,
            expiresAtUnix,
            description: `Match tickets (fixture ${ctx.checkout.fixtureId})`,
        });

        if (!session.client_secret) {
            throw new Error('Stripe did not return a client secret for checkout session');
        }

        return {
            providerSessionId: session.id,
            clientSecret: session.client_secret,
            publishableKey,
            expiresAt: new Date(session.expires_at * 1000),
        };
    }

    async verifyWebhook(rawBody: Buffer, signature: string): Promise<StripeEvent> {
        const webhookSecret = await this.credentials.getWebhookSecret();
        return stripeConstructEvent(rawBody, signature, webhookSecret);
    }

    parseWebhookEvent(event: StripeEvent): WebhookEventResult | null {
        if (event.type === 'checkout.session.completed') {
            const obj = event.data.object;
            const mode = obj.mode as string | undefined;
            if (mode === 'subscription') {
                return null;
            }
            const purpose = (obj.metadata as Record<string, string> | undefined)?.purpose;
            if (mode !== 'payment' && purpose !== 'primary_ticket_checkout') {
                return null;
            }
            const paymentSessionId = Number(
                (obj.metadata as Record<string, string> | undefined)?.paymentSessionId ??
                    obj.client_reference_id,
            );
            const userId = Number((obj.metadata as Record<string, string> | undefined)?.userId);
            const amountTotal = obj.amount_total as number | null | undefined;
            const currency = obj.currency as string | null | undefined;
            const paymentStatus = obj.payment_status as string | undefined;
            return {
                type: event.type,
                providerSessionId: String(obj.id),
                providerPaymentRef: String(obj.payment_intent ?? obj.id),
                paymentSessionId: Number.isFinite(paymentSessionId) ? paymentSessionId : undefined,
                userId: Number.isFinite(userId) ? userId : undefined,
                paymentStatus,
                amountTotalCents: amountTotal != null ? Number(amountTotal) : undefined,
                currency: currency ?? undefined,
            };
        }
        if (event.type === 'checkout.session.expired') {
            const obj = event.data.object;
            const purpose = (obj.metadata as Record<string, string> | undefined)?.purpose;
            if (purpose !== 'primary_ticket_checkout') return null;
            const paymentSessionId = Number(
                (obj.metadata as Record<string, string> | undefined)?.paymentSessionId,
            );
            return {
                type: event.type,
                providerSessionId: String(obj.id),
                paymentSessionId: Number.isFinite(paymentSessionId) ? paymentSessionId : undefined,
            };
        }
        return null;
    }
}
