export interface Player {
    id: string;
    name: string;
    number: number;
    position: string; // 'GK', 'DF', 'MF', 'FW'
    /** DB `position.id` — fallback tie-break only; pitch order uses StatsBomb slots below */
    positionId?: number;
    /** Order in StatsBomb Starting XI / lineup payload (0 = first row top-down in tactics) */
    lineupSlotIndex?: number;
    /** StatsBomb catalog position id from events or lineups file */
    statsbombPositionId?: number;
}

export interface Lineup {
    formation: string; // e.g. '4-3-3'
    players: Player[]; // 11 players in starting lineup
    substitutes?: Player[];
    /** When loaded from API / StatsBomb sync */
    managerName?: string;
}

export interface MatchDetails {
    matchId?: string;
    /** From fixture columns when available */
    homeScore?: number;
    awayScore?: number;
    homeTeam: string;
    awayTeam: string;
    homeTeamId?: number;
    awayTeamId?: number;
    date: string;
    venue: string;
    competition?: string;
    /** When set, competition pill links to `/competition/:id` */
    competitionId?: number;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    homeLineup?: Lineup;
    awayLineup?: Lineup;
    homePredictedLineup?: Lineup;
    awayPredictedLineup?: Lineup;
    /** Last five outcomes (most recent left→right or as provided by API). Only show form UI when both sides are set. */
    homeRecentForm?: ('W' | 'D' | 'L')[];
    awayRecentForm?: ('W' | 'D' | 'L')[];
    stadiumId?: number;
    stadiumMetadata?: unknown;
}

