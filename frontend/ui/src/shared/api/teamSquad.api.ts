import { useQuery } from '@tanstack/react-query';
import type { Player } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type TeamSquadResponse = {
    players: Player[];
    seasonId?: number;
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

export function useTeamTransfers(teamId: number, enabled = true) {
    return useQuery({
        queryKey: ['teamTransfers', teamId],
        queryFn: () => fetchTeamTransfers(teamId),
        enabled: enabled && Number.isFinite(teamId) && teamId > 0,
    });
}
