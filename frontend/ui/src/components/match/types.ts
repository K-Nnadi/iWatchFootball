export interface Player {
    id: string;
    name: string;
    number: number;
    position: string; // 'GK', 'DF', 'MF', 'FW'
}

export interface Lineup {
    formation: string; // e.g. '4-3-3'
    players: Player[]; // 11 players in starting lineup
    substitutes?: Player[];
}

export interface MatchDetails {
    matchId?: string;
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

