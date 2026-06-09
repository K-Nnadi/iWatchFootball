import axios from 'axios';

export type CheckoutPaymentMethod = 'CreditCard' | 'PayPal' | 'PlatformCredit';

export async function confirmCheckout(body: {
    fixtureId: number;
    offerKey: string;
    holderId: string;
    quantity: number;
    unitPrice: number;
    category: string;
    paymentMethod: CheckoutPaymentMethod;
    paymentProcessorId?: number;
    providerPaymentRef?: string;
    idempotencyKey?: string;
    discountCodeId?: number;
}): Promise<{ paymentId: number; ticketIds: number[]; idempotent: boolean }> {
    const { data } = await axios.post<{
        paymentId: number;
        ticketIds: number[];
        idempotent: boolean;
    }>('/checkout/confirm', body);
    return data;
}
