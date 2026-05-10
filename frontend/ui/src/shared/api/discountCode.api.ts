import axios from 'axios';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface DiscountValidation {
    valid: boolean;
    discountAmount: number;
    type: DiscountType;
    value: number;
    discountCodeId: number;
}

export interface DiscountCode {
    id: number;
    code: string;
    type: DiscountType;
    value: number;
    active: boolean;
    maxUsesPerUser: number;
    expiresAt?: string;
    totalUsesCount: number;
    createdAt: string;
}

export async function validateDiscountCode(
    code: string,
    orderTotal: number,
): Promise<DiscountValidation> {
    const { data } = await axios.get<DiscountValidation>(
        `/discount-code/validate/${encodeURIComponent(code)}`,
        { params: { orderTotal } },
    );
    return data;
}

export async function adminListDiscountCodes(): Promise<DiscountCode[]> {
    const { data } = await axios.get<DiscountCode[]>('/discount-code');
    return Array.isArray(data) ? data : [];
}

export async function adminCreateDiscountCode(payload: {
    code: string;
    type: DiscountType;
    value: number;
    maxUsesPerUser?: number;
    expiresAt?: string;
}): Promise<DiscountCode> {
    const { data } = await axios.post<DiscountCode>('/discount-code', payload);
    return data;
}

export async function adminToggleDiscountCode(id: number): Promise<DiscountCode> {
    const { data } = await axios.patch<DiscountCode>(`/discount-code/${id}/toggle`);
    return data;
}
