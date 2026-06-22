import { useQuery } from '@tanstack/react-query';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type ManagerCareerSource = 'employment' | 'teamIds' | 'teamManagerId';

export type ManagerCareerRow = {
    teamId: number;
    teamName: string;
    crest?: string | null;
    from?: string;
    to?: string;
    isCurrent: boolean;
    source: ManagerCareerSource;
};

export type ManagerProfileResponse = {
    manager: {
        id: number;
        name: string;
        nickname: string;
        nationality: string;
        teamIds?: number[];
        metadata?: unknown;
    };
    career: ManagerCareerRow[];
    currentTeamId?: number;
    clubsManagedCount: number;
};

export async function fetchManagerProfile(managerId: number): Promise<ManagerProfileResponse> {
    const res = await fetch(`${baseURL}/manager/${managerId}/profile`);
    if (!res.ok) {
        throw new Error(`Failed to load manager profile (${res.status})`);
    }
    return res.json() as Promise<ManagerProfileResponse>;
}

export function useManagerProfile(managerId: number, enabled = true) {
    return useQuery({
        queryKey: ['managerProfile', managerId],
        queryFn: () => fetchManagerProfile(managerId),
        enabled: enabled && Number.isFinite(managerId) && managerId > 0,
    });
}
