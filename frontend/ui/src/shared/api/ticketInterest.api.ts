import axios from 'axios';

export interface TicketInterest {
    id: number;
    fixtureId: number;
    quantity: number;
    maxPriceGbp?: number;
    preferredStand?: string;
    wantsNotification: boolean;
    status: 'ACTIVE' | 'NOTIFIED' | 'CANCELLED';
    createdAt: string;
}

export interface DemandStats {
    fixtureId: number;
    interestedCount: number;
    totalTicketsWanted: number;
}

export interface CreateTicketInterestPayload {
    fixtureId: number;
    quantity: number;
    maxPriceGbp?: number;
    preferredStand?: string;
    wantsNotification: boolean;
}

export async function createTicketInterest(payload: CreateTicketInterestPayload): Promise<TicketInterest> {
    const { data } = await axios.post<TicketInterest>('/ticket-interest', payload);
    return data;
}

export async function getMyTicketInterests(): Promise<TicketInterest[]> {
    const { data } = await axios.get<TicketInterest[]>('/ticket-interest/my');
    return data;
}

export async function cancelTicketInterest(id: number): Promise<void> {
    await axios.delete(`/ticket-interest/${id}`);
}

export async function getTicketDemand(fixtureId: number): Promise<DemandStats> {
    const { data } = await axios.get<DemandStats>(`/ticket-interest/${fixtureId}/demand`);
    return data;
}
