export interface Player {
    id: string;
    name: string;
    number: number;
    position: string; // 'GK', 'DF', 'MF', 'FW'
    /** DB `position.id` — stable tie-break for left→right / depth when laying out rows */
    positionId?: number;
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
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    homeLineup?: Lineup;
    awayLineup?: Lineup;
    homePredictedLineup?: Lineup;
    awayPredictedLineup?: Lineup;
}

