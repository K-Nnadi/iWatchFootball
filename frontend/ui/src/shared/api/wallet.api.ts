import axios from 'axios';

export interface CreditBalance {
    id: number;
    userId: number;
    balance: number;
}

export type TransactionType =
    | 'CASH_PAYMENT'
    | 'CREDIT_TOP_UP'
    | 'CREDIT_USAGE'
    | 'REFUND'
    | 'CREDIT_REFUND';

export interface WalletTransaction {
    id: number;
    type: TransactionType;
    amount: number;
    description: string;
    paymentId?: number;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

export async function getMyCredit(): Promise<CreditBalance | null> {
    try {
        const { data } = await axios.get<CreditBalance[]>('/credit');
        const rows = Array.isArray(data) ? data : [];
        if (rows.length === 0) return null;
        const totalBalance = rows.reduce((s, r) => s + Number(r.balance ?? 0), 0);
        return { ...rows[0], balance: totalBalance };
    } catch {
        return null;
    }
}

export async function getMyTransactions(): Promise<WalletTransaction[]> {
    try {
        const { data } = await axios.get<WalletTransaction[]>('/transaction');
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}
