import axios from 'axios';

export interface PaymentProviderDto {
    id: number;
    name: string;
    slug: string;
    type: 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'CRYPTO' | 'CREDIT';
    logoUrl?: string;
    publishableKey?: string;
    disabled?: boolean;
}

export interface CreatePaymentSessionPayload {
    fixtureId: number;
    offerKey: string;
    holderId: string;
    quantity: number;
    unitPrice: number;
    category: string;
    discountCodeId?: number;
    providerSlug?: string;
    idempotencyKey?: string;
}

export interface CreatePaymentSessionResponse {
    paymentSessionId: number;
    clientSecret: string;
    publishableKey: string;
    providerSlug: string;
    amount: number;
    currency: string;
    expiresAt: string;
}

export interface PaymentSessionStatusResponse {
    id: number;
    status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
    amount: string;
    currency: string;
    providerSlug: string;
    expiresAt: string;
    providerPaymentRef?: string;
}

export async function getPaymentProviders(): Promise<PaymentProviderDto[]> {
    const { data } = await axios.get<PaymentProviderDto[]>('/payments/providers');
    return data;
}

export async function createPaymentSession(
    payload: CreatePaymentSessionPayload,
): Promise<CreatePaymentSessionResponse> {
    const { data } = await axios.post<CreatePaymentSessionResponse>('/payments/sessions', payload);
    return data;
}

export async function getPaymentSessionStatus(
    sessionId: number,
): Promise<PaymentSessionStatusResponse> {
    const { data } = await axios.get<PaymentSessionStatusResponse>(`/payments/sessions/${sessionId}`);
    return data;
}

export async function pollPaymentSessionUntilComplete(
    sessionId: number,
    options?: { maxAttempts?: number; intervalMs?: number },
): Promise<PaymentSessionStatusResponse> {
    const maxAttempts = options?.maxAttempts ?? 30;
    const intervalMs = options?.intervalMs ?? 1500;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const status = await getPaymentSessionStatus(sessionId);
        if (status.status === 'COMPLETED') {
            return status;
        }
        if (status.status === 'FAILED' || status.status === 'EXPIRED') {
            throw new Error(`Payment session ${status.status.toLowerCase()}`);
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error('Payment confirmation timed out — check your email or order history');
}
