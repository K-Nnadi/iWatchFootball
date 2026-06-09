import * as crypto from 'crypto';
import axios, { isAxiosError } from 'axios';

const STRIPE_API = 'https://api.stripe.com/v1';

export class StripeApiError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly param?: string;

    constructor(message: string, status: number, code?: string, param?: string) {
        super(message);
        this.name = 'StripeApiError';
        this.status = status;
        this.code = code;
        this.param = param;
    }
}

interface StripeErrorBody {
    error?: {
        message?: string;
        type?: string;
        code?: string;
        param?: string;
    };
}

function throwStripeApiError(err: unknown): never {
    if (isAxiosError(err) && err.response?.data) {
        const body = err.response.data as StripeErrorBody;
        const message =
            body.error?.message ?? `Stripe request failed (HTTP ${err.response.status})`;
        throw new StripeApiError(
            message,
            err.response.status,
            body.error?.code,
            body.error?.param,
        );
    }
    throw err;
}

async function stripePost<T>(path: string, secretKey: string, body: string): Promise<T> {
    try {
        const { data } = await axios.post<T>(`${STRIPE_API}${path}`, body, {
            headers: stripeHeaders(secretKey),
        });
        return data;
    } catch (err) {
        throwStripeApiError(err);
    }
}

async function stripeGet<T>(path: string, secretKey: string): Promise<T> {
    try {
        const { data } = await axios.get<T>(`${STRIPE_API}${path}`, {
            headers: stripeHeaders(secretKey),
        });
        return data;
    } catch (err) {
        throwStripeApiError(err);
    }
}

export interface StripeSubscriptionObject {
    id: string;
    customer: string | { id: string };
    status: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    metadata?: Record<string, string>;
}

export interface StripeEvent {
    type: string;
    data: { object: Record<string, unknown> };
}

function stripeHeaders(secretKey: string): Record<string, string> {
    return {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };
}

function encodeForm(data: Record<string, string | number | boolean | undefined>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    }
    return params.toString();
}

export async function stripeCreateCustomer(
    secretKey: string,
    email: string | undefined,
    userId: number,
): Promise<{ id: string }> {
    const body = encodeForm({
        email,
        'metadata[userId]': String(userId),
    });
    return stripePost<{ id: string }>('/customers', secretKey, body);
}

export async function stripeCreateSubscriptionCheckoutSession(
    secretKey: string,
    params: {
        customerId: string;
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        userId: number;
    },
): Promise<{ url: string | null }> {
    const body = encodeForm({
        mode: 'subscription',
        customer: params.customerId,
        'line_items[0][price]': params.priceId,
        'line_items[0][quantity]': 1,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        'metadata[userId]': String(params.userId),
        'metadata[purpose]': 'tracker_premium',
        'subscription_data[metadata][userId]': String(params.userId),
        'subscription_data[metadata][planSlug]': 'premium_monthly',
    });
    return stripePost<{ url: string | null }>('/checkout/sessions', secretKey, body);
}

/** Embedded Payment Element — ui_mode custom, one-off payment. */
export async function stripeCreatePaymentCheckoutSession(
    secretKey: string,
    params: {
        amountPence: number;
        currency: string;
        userId: number;
        paymentSessionId: number;
        expiresAtUnix: number;
        description: string;
    },
): Promise<{ id: string; client_secret: string | null; expires_at: number }> {
    const body = encodeForm({
        mode: 'payment',
        ui_mode: 'custom',
        'line_items[0][price_data][currency]': params.currency,
        'line_items[0][price_data][unit_amount]': params.amountPence,
        'line_items[0][price_data][product_data][name]': params.description,
        'line_items[0][quantity]': 1,
        expires_at: params.expiresAtUnix,
        'metadata[userId]': String(params.userId),
        'metadata[paymentSessionId]': String(params.paymentSessionId),
        'metadata[purpose]': 'primary_ticket_checkout',
        client_reference_id: String(params.paymentSessionId),
    });
    return stripePost<{ id: string; client_secret: string | null; expires_at: number }>(
        '/checkout/sessions',
        secretKey,
        body,
    );
}

export async function stripeCreatePortalSession(
    secretKey: string,
    customerId: string,
    returnUrl: string,
): Promise<{ url: string }> {
    const body = encodeForm({ customer: customerId, return_url: returnUrl });
    return stripePost<{ url: string }>('/billing_portal/sessions', secretKey, body);
}

export async function stripeRetrieveSubscription(
    secretKey: string,
    subscriptionId: string,
): Promise<StripeSubscriptionObject> {
    return stripeGet<StripeSubscriptionObject>(`/subscriptions/${subscriptionId}`, secretKey);
}

/** Verify Stripe webhook signature (t=timestamp,v1=sig). */
export function stripeConstructEvent(
    payload: Buffer | string,
    signatureHeader: string,
    webhookSecret: string,
): StripeEvent {
    const payloadStr = typeof payload === 'string' ? payload : payload.toString('utf8');
    const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
    }, {});

    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) {
        throw new Error('Invalid stripe-signature header');
    }

    const signedPayload = `${timestamp}.${payloadStr}`;
    const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload, 'utf8')
        .digest('hex');

    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (
        sigBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
        throw new Error('Webhook signature verification failed');
    }

    return JSON.parse(payloadStr) as StripeEvent;
}
