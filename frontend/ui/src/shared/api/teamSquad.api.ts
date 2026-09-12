import { useQuery } from '@tanstack/react-query';
import type { SquadPositionGroup } from '../positionGroup';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type SquadMember = {
    id: number;
    name: string;
    nationality: string;
    dateOfBirth?: string | null;
    photoUrl?: string | null;
    position: string;
    positionGroup: SquadPositionGroup;
    kitNumber?: number;
    isLoan: boolean;
};

export type TeamSquadResponse = {
    players: SquadMember[];
    scope: 'current' | 'season';
    seasonId?: number;
};

export type TeamSeasonOption = {
    id: number;
    yearStart: number;
    yearEnd: number;
    label: string;
};

export type TeamSeasonsResponse = {
    seasons: TeamSeasonOption[];
};

export type TeamCurrentManager = {
    id: number;
    name: string;
    nationality: string;
};

export type TeamCurrentManagerResponse = {
    manager: TeamCurrentManager | null;
    source?: 'employment' | 'teamManagerId';
};

export type TeamTransferRow = {
    id: number;
    playerId: number;
    sourceTeamId: number;
    destinationTeamId: number;
    transferFee: number;
    date?: string;
    isLoan?: boolean;
};

export type TeamTransfersResponse = {
    ins: TeamTransferRow[];
    outs: TeamTransferRow[];
};

export async function fetchTeamSquad(teamId: number, seasonId?: number): Promise<TeamSquadResponse> {
    const qs =
        seasonId != null && Number.isFinite(seasonId) ? `?seasonId=${encodeURIComponent(String(seasonId))}` : '';
    const res = await fetch(`${baseURL}/team/${teamId}/squad${qs}`);
    if (!res.ok) {
        throw new Error(`Failed to load squad (${res.status})`);
    }
    return res.json() as Promise<TeamSquadResponse>;
}

export async function fetchTeamManager(teamId: number): Promise<TeamCurrentManagerResponse> {
    const res = await fetch(`${baseURL}/team/${teamId}/manager`);
    if (!res.ok) {
        throw new Error(`Failed to load manager (${res.status})`);
    }
    return res.json() as Promise<TeamCurrentManagerResponse>;
}

export async function fetchTeamSeasons(teamId: number): Promise<TeamSeasonsResponse> {
    const res = await fetch(`${baseURL}/team/${teamId}/seasons`);
    if (!res.ok) {
        throw new Error(`Failed to load seasons (${res.status})`);
    }
    return res.json() as Promise<TeamSeasonsResponse>;
}

export async function fetchTeamTransfers(teamId: number): Promise<TeamTransfersResponse> {
    const res = await fetch(`${baseURL}/team/${teamId}/transfers`);
    if (!res.ok) {
        throw new Error(`Failed to load transfers (${res.status})`);
    }
    return res.json() as Promise<TeamTransfersResponse>;
}

export function useTeamSquad(teamId: number, seasonId?: number, enabled = true) {
    return useQuery({
        queryKey: ['teamSquad', teamId, seasonId ?? 'current'],
        queryFn: () => fetchTeamSquad(teamId, seasonId),
        enabled: enabled && Number.isFinite(teamId) && teamId > 0,
    });
}

export function useTeamManager(teamId: number, enabled = true) {
    return useQuery({
        queryKey: ['teamManager', teamId],
        queryFn: () => fetchTeamManager(teamId),
        enabled: enabled && Number.isFinite(teamId) && teamId > 0,
    });
}

export function useTeamSeasons(teamId: number, enabled = true) {
    return useQuery({
        queryKey: ['teamSeasons', teamId],
        queryFn: () => fetchTeamSeasons(teamId),
        enabled: enabled && Number.isFinite(teamId) && teamId > 0,
    });
}

export function useTeamTransfers(teamId: number, enabled = true) {
    return useQuery({
        queryKey: ['teamTransfers', teamId],
        queryFn: () => fetchTeamTransfers(teamId),
        enabled: enabled && Number.isFinite(teamId) && teamId > 0,
    });
}
