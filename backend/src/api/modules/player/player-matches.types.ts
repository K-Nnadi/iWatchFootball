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
