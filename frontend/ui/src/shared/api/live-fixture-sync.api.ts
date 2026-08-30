import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export type LiveFixtureSyncStatus = {
    redisConfigured: boolean;
    schedulerRegistered: boolean;
    scheduledSyncEnabled: boolean;
    envAllowsSync: boolean;
    cron: string;
    platformConfigKey: string;
};

export type LiveFixtureSyncResult = {
    async?: boolean;
    bullJobId?: string;
    created?: number;
    updated?: number;
    skipped?: number;
    apiRequests?: number;
    liveCount?: number;
    errors?: string[];
    events?: {
        goals: number;
        cards: number;
        substitutions: number;
        skipped: number;
        eventApiRequests: number;
    };
};

export async function getLiveFixtureSyncStatus(): Promise<LiveFixtureSyncStatus> {
    const { data } = await axios.get<LiveFixtureSyncStatus>('/admin/live-fixtures/status');
    return data;
}

export async function triggerLiveFixtureSync(): Promise<LiveFixtureSyncResult> {
    const { data } = await axios.post<LiveFixtureSyncResult>('/admin/live-fixtures/sync');
    return data;
}

export function useLiveFixtureSyncStatus() {
    return useQuery({
        queryKey: ['live-fixture-sync-status'],
        queryFn: getLiveFixtureSyncStatus,
        staleTime: 30_000,
    });
}
