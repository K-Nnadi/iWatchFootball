import { useQuery } from '@tanstack/react-query';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type StadiumHomeClubRow = {
    teamId: number;
    name: string;
    logoUrl?: string | null;
    relationship?: string;
};

export type StadiumFixtureRow = {
    id: number;
    date: string;
    homeTeamId: number;
    awayTeamId: number;
    homeScore?: number;
    awayScore?: number;
    metadata?: unknown;
};

export type StadiumLore = {
    source: 'wikipedia';
    pageTitle: string;
    extract: string;
    thumbnailUrl?: string;
    pageUrl: string;
    fetchedAt: string;
    attribution: string;
};

export type StadiumProfileResponse = {
    stadium: {
        id: number;
        name: string;
        country: string;
        opened?: string;
        capacity?: number;
        metadata?: unknown;
    };
    homeClubs: StadiumHomeClubRow[];
    recentFixtures: StadiumFixtureRow[];
    lore?: StadiumLore | null;
};

export async function fetchStadiumProfile(stadiumId: number): Promise<StadiumProfileResponse> {
    const res = await fetch(`${baseURL}/stadium/${stadiumId}/profile`);
    if (!res.ok) {
        throw new Error(`Failed to load stadium profile (${res.status})`);
    }
    return res.json() as Promise<StadiumProfileResponse>;
}

export function useStadiumProfile(stadiumId: number, enabled = true) {
    return useQuery({
        queryKey: ['stadiumProfile', stadiumId],
        queryFn: () => fetchStadiumProfile(stadiumId),
        enabled: enabled && Number.isFinite(stadiumId) && stadiumId > 0,
    });
}
