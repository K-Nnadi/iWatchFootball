import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const SYNC_STEP = {
  STATS_BOMB: 'statsbomb',
  API_LEAGUES: 'api_leagues',
  API_PLAYERS: 'api_players',
  API_FIXTURES: 'api_fixtures',
  API_ENRICH: 'api_enrich',
  SPORTMONKS: 'sportmonks',
  SPORTAPI: 'sportapi',
} as const;

export class StatsBombPipelineOptionsDto {
  @ApiPropertyOptional()
  skipFixtures?: boolean;

  @ApiPropertyOptional()
  skipCards?: boolean;

  @ApiPropertyOptional()
  skipPlayers?: boolean;

  @ApiPropertyOptional()
  skipGoals?: boolean;

  @ApiPropertyOptional()
  skipStadiums?: boolean;

  @ApiPropertyOptional()
  skipLineups?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Skip unchanged competition-seasons (StatsBomb match_updated watermark)' })
  incremental?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Force full re-sync of all StatsBomb competition-seasons' })
  forceFull?: boolean;
}

export class ApiSportsLeaguesPipelineDto {
  @ApiPropertyOptional({ default: true })
  syncTeamsAndStandings?: boolean;

  @ApiPropertyOptional({ default: true })
  onlyStandingsCoverage?: boolean;

  @ApiPropertyOptional({ default: true })
  onlyLeagueType?: boolean;

  @ApiPropertyOptional({ default: 20, description: 'Cap on /standings calls (plus one /leagues)' })
  maxStandingsRequests?: number;
}

export class ApiSportsPlayersPipelineDto {
  @ApiPropertyOptional({ default: 2 })
  maxPages?: number;

  @ApiPropertyOptional({ default: 10, description: 'Per league; also bounded by remaining budget' })
  maxRequestsPerLeague?: number;

  @ApiPropertyOptional({ default: true })
  skipOnAmbiguousName?: boolean;
}

export class ApiSportsFixturesPipelineDto {
  @ApiProperty({ description: 'YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  to!: string;

  @ApiPropertyOptional({ default: true })
  allPages?: boolean;

  @ApiPropertyOptional({ default: 20 })
  maxPages?: number;

  @ApiPropertyOptional({ default: 50, description: 'Per league' })
  maxRequestsPerLeague?: number;

  @ApiPropertyOptional({
    default: false,
    description: 'After each league window, persist GET /fixtures/events for imported matches',
  })
  syncEventsAfter?: boolean;

  @ApiPropertyOptional({ default: 20 })
  syncEventsMaxRequests?: number;

  @ApiPropertyOptional({
    default: false,
    description: 'After each league window, persist GET /fixtures/lineups for imported matches',
  })
  syncLineupsAfter?: boolean;

  @ApiPropertyOptional({ default: 20 })
  syncLineupsMaxRequests?: number;
}

export class ApiSportsEnrichPipelineDto {
  @ApiPropertyOptional({ description: 'Max players to try (also limited by budget via maxRequests)' })
  limit?: number;

  @ApiPropertyOptional({ description: 'Season fallback for /players?id=' })
  season?: number;

  @ApiPropertyOptional({
    description: 'Hard stop on API calls for this enrich step',
  })
  maxRequests?: number;
}

export class ApiSportsPipelineDto {
  @ApiPropertyOptional({
    default: true,
    description: 'When false, the API-Sports block is skipped (useful with preset objects)',
  })
  enabled?: boolean;

  @ApiProperty({ description: 'API-Football season year (e.g. 2024 for 2024/25)', example: 2024 })
  season!: number;

  @ApiPropertyOptional({
    example: 'England',
    description: 'With season, runs GET /leagues then import + optional standings',
  })
  country?: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [39],
    description: 'API league ids for players + fixtures passes',
  })
  leagueApiIds?: number[];

  @ApiProperty({
    description: 'Global cap on API-Sports HTTP requests for this run (leagues + players + fixtures + enrich)',
    example: 80,
  })
  maxApiRequests!: number;

  @ApiPropertyOptional({ type: ApiSportsLeaguesPipelineDto })
  leagues?: ApiSportsLeaguesPipelineDto;

  @ApiPropertyOptional({ type: ApiSportsPlayersPipelineDto })
  players?: ApiSportsPlayersPipelineDto;

  @ApiPropertyOptional({ type: ApiSportsFixturesPipelineDto })
  fixtures?: ApiSportsFixturesPipelineDto;

  @ApiPropertyOptional({ type: ApiSportsEnrichPipelineDto })
  enrich?: ApiSportsEnrichPipelineDto;
}

export class SportMonksPipelineDto {
  @ApiPropertyOptional({
    default: true,
    description: 'When false, the SportMonks block is skipped',
  })
  enabled?: boolean;

  @ApiProperty({
    type: [Number],
    example: [8],
    description: 'SportMonks league ids (8 = Premier League, 2 = Champions League)',
  })
  leagueIds!: number[];

  @ApiProperty({ description: 'Fixture import window start YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ description: 'Fixture import window end YYYY-MM-DD' })
  to!: string;

  @ApiProperty({
    description: 'Cap on SportMonks HTTP requests for this run',
    example: 100,
  })
  maxApiRequests!: number;

  @ApiPropertyOptional({ default: true })
  syncStandings?: boolean;

  @ApiPropertyOptional({ default: true })
  syncFixtureDetails?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Import squads into playerTeamStint' })
  syncSquads?: boolean;

  @ApiPropertyOptional({ default: 'UTC' })
  timezone?: string;
}

export class SportApiPipelineDto {
  @ApiPropertyOptional({
    default: true,
    description: 'When false, the RapidAPI SportAPI block is skipped',
  })
  enabled?: boolean;

  @ApiProperty({
    type: [Number],
    example: [17],
    description: 'Sofascore uniqueTournament ids (17 = Premier League, 7 = Champions League)',
  })
  uniqueTournamentIds!: number[];

  @ApiProperty({ description: 'Fixture import window start YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ description: 'Fixture import window end YYYY-MM-DD' })
  to!: string;

  @ApiProperty({
    description: 'Cap on RapidAPI SportAPI HTTP requests for this run',
    example: 40,
  })
  maxApiRequests!: number;

  @ApiPropertyOptional({ default: true })
  syncStandings?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Per-match incidents/lineups/stats — expensive (3 requests each). Keep false on the BASIC quota.',
  })
  syncFixtureDetails?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Timezone offset in seconds from UTC' })
  timezoneOffset?: number;
}

export class DataSyncRunDto {
  @ApiPropertyOptional({ description: 'Continue a previous job (uses stored preset + step cursors)' })
  resumeJobId?: number;

  @ApiPropertyOptional({ description: 'Run StatsBomb open-data sync first (does not count toward maxApiRequests)' })
  statsbomb?: boolean;

  @ApiPropertyOptional({ type: StatsBombPipelineOptionsDto })
  statsbombOptions?: StatsBombPipelineOptionsDto;

  @ApiPropertyOptional({ type: ApiSportsPipelineDto })
  apiSports?: ApiSportsPipelineDto;

  @ApiPropertyOptional({ type: SportMonksPipelineDto })
  sportmonks?: SportMonksPipelineDto;

  @ApiPropertyOptional({ type: SportApiPipelineDto })
  sportapi?: SportApiPipelineDto;

  @ApiPropertyOptional({
    description:
      'When Redis is configured, defaults true so Swagger returns immediately with bullJobId. Set false to run synchronously.',
  })
  async?: boolean;
}

export function isApiSportsPipelineEnabled(dto: DataSyncRunDto): boolean {
  return dto.apiSports != null && dto.apiSports.enabled !== false;
}

export function isSportMonksPipelineEnabled(dto: DataSyncRunDto): boolean {
  return dto.sportmonks != null && dto.sportmonks.enabled !== false;
}

export function isSportApiPipelineEnabled(dto: DataSyncRunDto): boolean {
  return dto.sportapi != null && dto.sportapi.enabled !== false;
}

export function buildDataSyncStepKeys(dto: DataSyncRunDto): string[] {
  const keys: string[] = [];
  if (dto.statsbomb) keys.push(SYNC_STEP.STATS_BOMB);
  if (isApiSportsPipelineEnabled(dto)) {
    keys.push(SYNC_STEP.API_LEAGUES);
    keys.push(SYNC_STEP.API_PLAYERS);
    keys.push(SYNC_STEP.API_FIXTURES);
    if (dto.apiSports?.enrich) keys.push(SYNC_STEP.API_ENRICH);
  }
  if (isSportMonksPipelineEnabled(dto)) {
    keys.push(SYNC_STEP.SPORTMONKS);
  }
  if (isSportApiPipelineEnabled(dto)) {
    keys.push(SYNC_STEP.SPORTAPI);
  }
  return keys;
}
