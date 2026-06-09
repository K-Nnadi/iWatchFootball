export type PaymentIntegrationSlug = 'stripe' | 'paypal';

export type PaymentContextType = 'primary_checkout';

export interface PaymentCheckoutContext {
    fixtureId: number;
    offerKey: string;
    holderId: string;
    quantity: number;
    unitPrice: number;
    category: string;
    discountCodeId?: number;
    paymentProcessorId?: number;
}

export interface PaymentContext {
    type: PaymentContextType;
    userId: number;
    amount: number;
    currency: string;
    idempotencyKey: string;
    paymentSessionId: number;
    checkout: PaymentCheckoutContext;
    holdExpiresAt: Date;
}

export interface CreateSessionResult {
    providerSessionId: string;
    clientSecret: string;
    publishableKey: string;
    expiresAt: Date;
}

export interface WebhookEventResult {
    type: string;
    providerSessionId?: string;
    providerPaymentRef?: string;
    paymentSessionId?: number;
    userId?: number;
}
