import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export interface AdminSnapshot {
    fixtures: {
        total: number;
        scheduled: number;
        live: number;
        completed: number;
        postponedOrCancelled: number;
    };
    attendance: {
        totalRecords: number;
        withTicket: number;
    };
    ticketLinks: {
        active: number;
        clicks: number;
    };
    marketplace: {
        active: number;
        sold: number;
        pendingReview: number;
    };
    community: {
        ticketDemandSignals: number;
        highlights: number;
    };
}

async function fetchAdminSnapshot(): Promise<AdminSnapshot> {
    const { data } = await axios.get<AdminSnapshot>('/admin/snapshot');
    return data;
}

export function useAdminSnapshot() {
    return useQuery({
        queryKey: ['admin-snapshot'],
        queryFn: fetchAdminSnapshot,
        staleTime: 60 * 1000,
    });
}
