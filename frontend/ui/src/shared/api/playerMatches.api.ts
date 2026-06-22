import { useQuery } from '@tanstack/react-query';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type PlayerMatchResult = 'W' | 'D' | 'L';

export type PlayerMatchRow = {
    fixtureId: number;
    date: string;
    opponentTeamId: number;
    opponentName: string;
    home: boolean;
    homeScore?: number;
    awayScore?: number;
    result?: PlayerMatchResult;
    goals: number;
    assists: number;
    minutes: number;
    isStarting: boolean;
    competitionId?: number;
};

export type PlayerSeasonSummary = {
    competition: string;
    goals: number;
    assists: number;
    started: number;
    matches: number;
    minutes: number;
    rating: number;
    yellowCards: number;
    redCards: number;
};

export type PlayerMatchesResponse = {
    results: PlayerMatchRow[];
    fixtures: PlayerMatchRow[];
    season: PlayerSeasonSummary;
};

export async function fetchPlayerMatches(playerId: number, limit = 30): Promise<PlayerMatchesResponse> {
    const res = await fetch(`${baseURL}/player/${playerId}/matches?limit=${limit}`);
    if (!res.ok) {
        throw new Error(`Failed to load player matches (${res.status})`);
    }
    return res.json() as Promise<PlayerMatchesResponse>;
}

export function usePlayerMatches(playerId: number, enabled = true) {
    return useQuery({
        queryKey: ['playerMatches', playerId],
        queryFn: () => fetchPlayerMatches(playerId),
        enabled: enabled && Number.isFinite(playerId) && playerId > 0,
    });
}
