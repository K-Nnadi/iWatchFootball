import axios from 'axios';

export async function acquireTicketHold(body: {
    fixtureId: number;
    offerKey: string;
    holderId: string;
    quantity: number;
    holdMinutes?: number;
}): Promise<{ expiresAt: string; holdMinutes: number }> {
    const { data } = await axios.post<{ expiresAt: string; holdMinutes: number }>('/ticket-hold/acquire', body);
    return data;
}

export async function releaseTicketHold(holderId: string): Promise<void> {
    await axios.post('/ticket-hold/release', { holderId });
}

export async function verifyTicketHold(params: {
    fixtureId: number;
    offerKey: string;
    holderId: string;
}): Promise<{ expiresAt: string }> {
    const { data } = await axios.get<{ expiresAt: string }>('/ticket-hold/verify', { params });
    return data;
}
