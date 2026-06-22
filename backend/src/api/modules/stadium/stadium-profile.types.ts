import { Stadium } from './stadium.entity';

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
    stadium: Pick<Stadium, 'id' | 'name' | 'country' | 'opened' | 'capacity' | 'metadata'>;
    homeClubs: StadiumHomeClubRow[];
    recentFixtures: StadiumFixtureRow[];
    lore?: StadiumLore | null;
};
