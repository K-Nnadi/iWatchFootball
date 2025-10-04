export interface StatsBombConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  batchSize: number;
}

export const STATSBOMB_CONFIG: StatsBombConfig = {
  baseUrl: 'https://raw.githubusercontent.com/statsbomb/open-data/master/data',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  batchSize: 100, // Process 100 records at a time
};

export interface SyncOptions {
  skipCompetitions?: boolean;
  skipTeams?: boolean;
  skipPlayers?: boolean;
  skipFixtures?: boolean;
  skipEvents?: boolean;
  competitionIds?: number[];
  seasonIds?: number[];
}

export interface SyncResult {
  success: boolean;
  message: string;
  statistics: {
    competitions: number;
    teams: number;
    players: number;
    fixtures: number;
    goals: number;
    errors: number;
  };
  duration: number;
  timestamp: string;
}
