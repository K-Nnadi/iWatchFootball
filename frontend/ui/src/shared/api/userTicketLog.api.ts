import axios from 'axios';

export interface TicketLogEntry {
    id: number;
    userId: number;
    ticketId: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    ticket?: {
        id: number;
        category: string;
        price: number;
        fixtureId: number;
        fixtureLabel?: string;
        fixtureDate?: string;
        metadata?: Record<string, unknown>;
    };
}

export async function getMyTicketLog(): Promise<TicketLogEntry[]> {
    const { data } = await axios.get<TicketLogEntry[]>('/user-ticket-log/my');
    return Array.isArray(data) ? data : [];
}
