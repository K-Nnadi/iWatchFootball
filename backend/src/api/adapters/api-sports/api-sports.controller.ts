import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { ApiSportsAdapterService } from './api-sports-adapter.service';

export class ApiSportsStandingsItemDto {
  @ApiProperty({ description: 'API-Sports league id', example: 39 })
  league!: number;

  @ApiProperty({ description: 'API-Sports season year', example: 2023 })
  season!: number;

  @ApiProperty({ description: 'Local competition id' })
  competitionId!: number;

  @ApiProperty({ description: 'Local season id' })
  seasonId!: number;
}

export class ApiSportsSyncStandingsDto {
  @ApiProperty({ type: [ApiSportsStandingsItemDto] })
  items!: ApiSportsStandingsItemDto[];
}

export class ApiSportsEnrichPlayersDto {
  @ApiProperty({ required: false, description: 'Max players to process' })
  limit?: number;

  @ApiProperty({ required: false, description: 'Season year for /players fallback', example: 2023 })
  season?: number;

  @ApiProperty({
    required: false,
    description: 'Hard cap on API calls in this run (each player may use 1–2 requests)',
  })
  maxRequests?: number;
}

export class ApiSportsSyncTransfersDto {
  @ApiProperty({ description: 'API-Sports team id' })
  teamApiId!: number;

  @ApiProperty({ required: false, description: 'Optional season filter' })
  season?: number;
}

export class ApiSportsImportFixturesDto {
  @ApiProperty({ description: 'API-Sports league id', example: 39 })
  leagueApiId!: number;

  @ApiProperty({ description: 'API-Football season year (e.g. 2024 for 2024/25)', example: 2024 })
  seasonYear!: number;

  @ApiProperty({ description: 'from date YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ description: 'to date YYYY-MM-DD' })
  to!: string;

  @ApiPropertyOptional({ default: true, description: 'Follow paging until complete (within maxPages/maxRequests)' })
  allPages?: boolean;

  @ApiPropertyOptional({ default: 20, description: 'Max fixture list pages' })
  maxPages?: number;

  @ApiPropertyOptional({ default: 50, description: 'Max /fixtures HTTP calls' })
  maxRequests?: number;

  @ApiPropertyOptional({
    default: false,
    description:
      'When true, after fixtures, one GET /standings for this league+season and upsert `competitionStanding` (+1 API request).',
  })
  syncStandingsAfter?: boolean;

  @ApiPropertyOptional({
    default: false,
    description:
      'After fixtures (+0 HTTP), recomputes `competitionStanding` positions from persisted fixtures that have numeric scores (no form string). Runs in parallel with `syncStandingsAfter` when both are true.',
  })
  recomputeStandingsFromFixturesAfter?: boolean;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 64,
    default: 16,
    description: 'Max concurrent DB upserts for fixture rows.',
  })
  fixtureUpsertConcurrency?: number;

  @ApiPropertyOptional({
    default: false,
    description:
      'After fixtures, one **`GET /teams?league=&season=`** (no `page`; API-Football returns all teams in one response) links each club **`venue`** to `teamStadium` as primary home. Not derived from match venue.',
  })
  syncPrimaryVenuesAfter?: boolean;

  @ApiPropertyOptional({
    default: 5,
    description: 'Ignored for primary-venue sync (reserved). API-Football does not accept `page` with league+season on /teams.',
  })
  primaryVenuesMaxPages?: number;

  @ApiPropertyOptional({
    default: 8,
    description: 'Ignored for primary-venue sync (single /teams call). Reserved for future use.',
  })
  primaryVenuesMaxRequests?: number;

  @ApiPropertyOptional({
    default: false,
    description:
      'After fixtures, call GET /fixtures/statistics for each imported fixture and upsert fixtureTeamStat. ' +
      'One request per fixture — guard spend with syncStatsMaxRequests.',
  })
  syncStatsAfter?: boolean;

  @ApiPropertyOptional({
    default: 20,
    description: 'Max /fixtures/statistics requests when syncStatsAfter is true.',
  })
  syncStatsMaxRequests?: number;
}

export class ApiSportsSyncPrimaryVenuesDto {
  @ApiProperty({ description: 'API-Sports league id', example: 39 })
  league!: number;

  @ApiProperty({ description: 'API-Football season year (e.g. 2024)', example: 2024 })
  season!: number;

  @ApiPropertyOptional({
    description:
      'Ignored: with `league`+`season`, API-Football returns all teams in one response and rejects the `page` parameter.',
  })
  maxPages?: number;

  @ApiPropertyOptional({ description: 'Ignored: single GET /teams request.' })
  maxRequests?: number;
}

export class ApiSportsImportPlayersDto {
  @ApiProperty({ description: 'API-Sports league id', example: 39 })
  league!: number;

  @ApiProperty({ description: 'API-Sports season year', example: 2024 })
  season!: number;

  @ApiPropertyOptional({
    default: true,
    description:
      'If true (default), when multiple local players share the same name with placeholder DOB (1900-01-01), we skip linking/creating to avoid wrong matches and duplicates.',
  })
  skipOnAmbiguousName?: boolean;

  @ApiPropertyOptional({
    default: 2,
    description:
      'Max pages to fetch from GET /players. Each page is one API request. Increase slowly to protect the 100/day quota.',
  })
  maxPages?: number;

  @ApiPropertyOptional({
    default: 10,
    description:
      'Hard cap on /players requests in this run (safety guard; each page is one request).',
  })
  maxRequests?: number;
}

export class ApiSportsImportLeaguesDto {
  @ApiPropertyOptional({ example: 'England', description: 'With `season`, calls GET /leagues on API-Sports' })
  country?: string;

  @ApiPropertyOptional({ example: 2023, description: 'API-Sports season year (with `country`)' })
  season?: number;

  @ApiPropertyOptional({
    type: 'array',
    description:
      'Paste the `response` array from a /leagues call (or send full JSON — we read `.response`).',
    items: { type: 'object' },
  })
  response?: any[];

  @ApiPropertyOptional({
    description:
      'API season for `/standings` when pasting `response` (e.g. 2023). With `country`+`season`, this is set automatically.',
    example: 2023,
  })
  standingsSeasonYear?: number;

  @ApiPropertyOptional({
    default: true,
    description:
      'If true (default), one GET /standings per eligible league after import (teams + standings in one call; no /teams). Respects onlyStandingsCoverage, onlyLeagueType, maxStandingsRequests.',
  })
  syncTeamsAndStandings?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Skip leagues where seasons[].coverage.standings is false (saves daily quota).',
  })
  onlyStandingsCoverage?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'Only sync standings for competition type League, not Cup.',
  })
  onlyLeagueType?: boolean;

  @ApiPropertyOptional({
    default: 20,
    description: 'Cap on extra /standings calls in this request (1 league = 1 call).',
  })
  maxStandingsRequests?: number;
}

export class ApiSyncFixtureStatsDto {
  @ApiProperty({ description: 'Local fixture id to sync statistics for' })
  fixtureId!: number;
}


const apiSportsRawResponseSchema = {
  description: 'Raw API-Sports JSON (get, parameters, errors, results, paging, response, …)',
  schema: {
    type: 'object',
    additionalProperties: true,
  },
} as const;

@ApiTags('API-Sports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api-sports')
export class ApiSportsController {
  constructor(
    private readonly apiSportsAdapterService: ApiSportsAdapterService,
  ) {}

  @Post('sync/import/leagues')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import competitions + seasons from API-Sports /leagues',
    description:
      'Either pass `country` + `season` (fetches live) or paste `response` from discover. Upserts competitions/seasons. By default, also runs up to `maxStandingsRequests` GET /standings calls (one per league) to upsert teams, competitionStanding, and teamCompetitionSeason — skipping cups and leagues without standings coverage to limit API usage.',
  })
  @ApiBody({ type: ApiSportsImportLeaguesDto })
  @ApiResponse({ status: 200, description: 'Import counts' })
  async importLeagues(@Body() body: ApiSportsImportLeaguesDto) {
    const importOpts = {
      standingsSeasonYear:
        body.standingsSeasonYear != null ? Number(body.standingsSeasonYear) : undefined,
      syncTeamsAndStandings: body.syncTeamsAndStandings,
      onlyStandingsCoverage: body.onlyStandingsCoverage,
      onlyLeagueType: body.onlyLeagueType,
      maxStandingsRequests:
        body.maxStandingsRequests != null ? Number(body.maxStandingsRequests) : undefined,
    };
    const pasted = (body as any)?.response;
    if (Array.isArray(pasted) && pasted.length > 0) {
      return this.apiSportsAdapterService.importLeaguesFromApiPayload(
        { response: pasted },
        importOpts,
      );
    }
    if (body.country != null && body.country !== '' && body.season != null && body.season !== ('' as any)) {
      return this.apiSportsAdapterService.importLeaguesFromDiscover({
        country: String(body.country),
        season: Number(body.season),
        ...importOpts,
      });
    }
    throw new BadRequestException(
      'Provide `country` + `season` to fetch from API-Sports, or `response` with the array from GET /leagues.',
    );
  }

  @Post('sync/standings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync league standings from API-Sports',
    description:
      'Requires API key (API_SPORTS_KEY or FOOTBALLAPISPORTS_API_KEY). Maps teams by metadata.providers.apisports.externalId.',
  })
  @ApiBody({ type: ApiSportsSyncStandingsDto })
  @ApiResponse({ status: 200, description: 'Standings upsert result' })
  async syncStandings(@Body() body: ApiSportsSyncStandingsDto) {
    return this.apiSportsAdapterService.syncStandings(body.items);
  }

  @Post('enrich/players')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enrich player DOB, nationality, height from API-Sports',
    description:
      'Only processes players with metadata.providers.apisports.externalId (or metadata.apisportsPlayerId).',
  })
  @ApiBody({ type: ApiSportsEnrichPlayersDto })
  async enrichPlayers(@Body() body: ApiSportsEnrichPlayersDto) {
    return this.apiSportsAdapterService.enrichPlayers({
      limit: body.limit,
      season: body.season,
      maxRequests: body.maxRequests,
    });
  }

  @Post('sync/import/fixtures')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import fixtures into DB (API-Football /fixtures)',
    description:
      'Upserts `fixture` rows by `metadata.providers.apisports.externalId`, or merges into an existing same-competition fixture when kickoff differs by ≤6h and teams match (and both sides agree on score when finalized). Requires competition + season (yearStart/yearEnd) and teams already linked for that league. **`syncStandingsAfter`: true** adds one **`/standings`** call; **`recomputeStandingsFromFixturesAfter`: true** rebuilds ladder from scored fixtures (+0 requests). **`syncPrimaryVenuesAfter`: true** runs paged **`GET /teams`** and links each club **`venue`** to **`teamStadium`** as primary home (not match venue). Fixture upserts use **`fixtureUpsertConcurrency`**. With `from`/`to`, API-Football returns all fixtures in one call and rejects `page`; `allPages`/`maxPages` here are ignored.',
  })
  @ApiBody({ type: ApiSportsImportFixturesDto })
  async importFixtures(@Body() body: ApiSportsImportFixturesDto) {
    return this.apiSportsAdapterService.importFixturesFromLeagueWindow({
      leagueApiId: Number(body.leagueApiId),
      seasonYear: Number(body.seasonYear),
      from: String(body.from),
      to: String(body.to),
      allPages: body.allPages,
      maxPages: body.maxPages != null ? Number(body.maxPages) : undefined,
      maxRequests: body.maxRequests != null ? Number(body.maxRequests) : undefined,
      syncStandingsAfter: body.syncStandingsAfter === true,
      recomputeStandingsFromFixturesAfter: body.recomputeStandingsFromFixturesAfter === true,
      fixtureUpsertConcurrency:
        body.fixtureUpsertConcurrency != null ? Number(body.fixtureUpsertConcurrency) : undefined,
      syncPrimaryVenuesAfter: body.syncPrimaryVenuesAfter === true,
      primaryVenuesMaxPages:
        body.primaryVenuesMaxPages != null ? Number(body.primaryVenuesMaxPages) : undefined,
      primaryVenuesMaxRequests:
        body.primaryVenuesMaxRequests != null ? Number(body.primaryVenuesMaxRequests) : undefined,
      syncStatsAfter: body.syncStatsAfter === true,
      syncStatsMaxRequests:
        body.syncStatsMaxRequests != null ? Number(body.syncStatsMaxRequests) : undefined,
    });
  }

  @Post('sync/import/team-primary-venues')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Link primary stadiums from API-Football GET /teams',
    description:
      'One **`GET /teams?league=&season=`** (no `page` — API-Football rejects `page` with this filter and returns all teams in one response). For each row, resolves the local team by `metadata.providers.apisports.externalId`, upserts `stadium` from the club **`venue`**, and upserts **`teamStadium`** with `metadata.relationship: primary_home` and `source: api-sports-teams`.',
  })
  @ApiBody({ type: ApiSportsSyncPrimaryVenuesDto })
  @ApiResponse({ status: 200, description: 'Counts + errors' })
  async importTeamPrimaryVenues(@Body() body: ApiSportsSyncPrimaryVenuesDto) {
    return this.apiSportsAdapterService.syncPrimaryVenuesFromTeamsLeagueSeason({
      league: Number(body.league),
      season: Number(body.season),
      maxPages: body.maxPages != null ? Number(body.maxPages) : undefined,
      maxRequests: body.maxRequests != null ? Number(body.maxRequests) : undefined,
    });
  }

  @Post('sync/import/players')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import missing players from API-Sports /players (league+season)',
    description:
      'Creates players when missing, deduping by API-Sports id first, then strict name+DOB match. Caps pages/requests to protect daily quota.',
  })
  @ApiBody({ type: ApiSportsImportPlayersDto })
  async importPlayers(@Body() body: ApiSportsImportPlayersDto) {
    return this.apiSportsAdapterService.importPlayersFromLeagueSeason({
      league: Number(body.league),
      season: Number(body.season),
      skipOnAmbiguousName: body.skipOnAmbiguousName,
      maxPages: body.maxPages != null ? Number(body.maxPages) : undefined,
      maxRequests: body.maxRequests != null ? Number(body.maxRequests) : undefined,
    });
  }

  @Post('sync/transfers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import transfers for an API-Sports team',
    description:
      'Resolves players and teams via metadata.providers.apisports.externalId. Skips rows that cannot be mapped.',
  })
  @ApiBody({ type: ApiSportsSyncTransfersDto })
  async syncTransfers(@Body() body: ApiSportsSyncTransfersDto) {
    return this.apiSportsAdapterService.syncTransfersForApiTeam({
      teamApiId: body.teamApiId,
      season: body.season,
    });
  }

  @Get('discover/leagues')
  @ApiOperation({
    summary: 'List/search leagues from API-Sports',
    description:
      'Proxies GET /leagues. See API-Football leagues docs for full filter list.',
  })
  @ApiQuery({ name: 'id', required: false, type: Number, description: 'API-Sports league id' })
  @ApiQuery({ name: 'country', required: false, type: String, example: 'England' })
  @ApiQuery({ name: 'season', required: false, type: Number, example: 2023 })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'e.g. league, cup' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'League name search' })
  @ApiQuery({ name: 'code', required: false, type: String, description: 'League code (e.g. GB)' })
  @ApiQuery({ name: 'team', required: false, type: Number })
  @ApiQuery({ name: 'current', required: false, type: String, description: 'true / false' })
  @ApiOkResponse(apiSportsRawResponseSchema)
  async discoverLeagues(@Query() query: Record<string, string | undefined>) {
    return this.apiSportsAdapterService.discoverLeagues(query);
  }

  @Get('discover/league/:id')
  @ApiOperation({
    summary: 'One league + seasons coverage',
    description:
      'Proxies GET /leagues?id={id}. Use `response[0].seasons` for valid `season` years for standings.',
  })
  @ApiOkResponse(apiSportsRawResponseSchema)
  async discoverLeagueById(@Param('id', ParseIntPipe) id: number) {
    return this.apiSportsAdapterService.discoverLeagueByApiId(id);
  }

  @Get('discover/fixtures')
  @ApiOperation({
    summary: 'Fixtures from API-Sports (API-Football v3)',
    description:
      'Proxies **GET /fixtures** — see [API-Football documentation v3](https://www.api-football.com/documentation-v3). ' +
      '**Efficient:** `date=YYYY-MM-DD` (+ optional `timezone` for “today”); narrow with `league`+`season`; batch with `ids=id1-id2`; ' +
      'use **GET /api-sports/discover/fixtures/live** for all live matches in one call. ' +
      '**allPages=true** merges pagination server-side (multiple upstream requests, capped by `maxPages`).',
  })
  @ApiQuery({ name: 'date', required: false, type: String, example: '2026-05-10' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'ids', required: false, type: String, description: 'Hyphen-separated fixture ids (one call for many)' })
  @ApiQuery({ name: 'league', required: false, type: Number })
  @ApiQuery({ name: 'season', required: false, type: Number })
  @ApiQuery({ name: 'team', required: false, type: Number })
  @ApiQuery({ name: 'venue', required: false, type: Number })
  @ApiQuery({ name: 'round', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Pagination (starts at 1)' })
  @ApiQuery({
    name: 'allPages',
    required: false,
    type: String,
    description: 'If true, fetch all pages until API paging ends (max `maxPages` requests)',
  })
  @ApiQuery({ name: 'maxPages', required: false, type: Number, description: 'Cap when allPages=true (default 20, max 50)' })
  @ApiQuery({ name: 'timezone', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'live', required: false, type: String, description: 'e.g. all' })
  @ApiQuery({ name: 'last', required: false, type: Number, description: 'Last N fixtures for a team (requires team)' })
  @ApiQuery({ name: 'next', required: false, type: Number, description: 'Next N fixtures for a team (requires team)' })
  @ApiOkResponse(apiSportsRawResponseSchema)
  async discoverFixtures(@Query() query: Record<string, string | undefined>) {
    return this.apiSportsAdapterService.discoverFixtures(query);
  }

  @Get('discover/fixtures/live')
  @ApiOperation({
    summary: 'Live fixtures + events (one API call)',
    description:
      'Proxies **GET /fixtures?live=all** — preferred over polling `/fixtures/events` per fixture. See [API-Football v3](https://www.api-football.com/documentation-v3).',
  })
  @ApiOkResponse(apiSportsRawResponseSchema)
  async discoverLiveFixtures() {
    return this.apiSportsAdapterService.discoverLiveFixtures();
  }

  @Get('discover/teams')
  @ApiOperation({
    summary: 'Teams (+ club venue) from API-Sports',
    description:
      'Proxies **GET /teams** — each entry includes **`team`** and **`venue`** (registered home ground). See [API-Football documentation v3](https://www.api-football.com/documentation-v3). Typical: `league` + `season`, or `id` / `team` for one club.',
  })
  @ApiQuery({ name: 'id', required: false, type: Number, description: 'API-Sports team id' })
  @ApiQuery({ name: 'team', required: false, type: Number })
  @ApiQuery({ name: 'league', required: false, type: Number })
  @ApiQuery({ name: 'season', required: false, type: Number })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'venue', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiOkResponse(apiSportsRawResponseSchema)
  async discoverTeams(@Query() query: Record<string, string | undefined>) {
    return this.apiSportsAdapterService.discoverTeams(query);
  }

  @Get('discover/countries')
  @ApiOperation({
    summary: 'Countries from API-Sports',
    description: 'Proxies GET /countries. Optional: `search`, `code`.',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'code', required: false, type: String, description: 'ISO country code' })
  @ApiOkResponse(apiSportsRawResponseSchema)
  async discoverCountries(@Query() query: Record<string, string | undefined>) {
    return this.apiSportsAdapterService.discoverCountries(query);
  }

  @Post('sync/import/fixture-stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync fixture statistics from API-Sports for one fixture',
    description:
      'Calls GET /fixtures/statistics?fixture={apiId} and upserts one `fixtureTeamStat` row per team. ' +
      'The fixture must already have `metadata.providers.apisports.externalId` set ' +
      '(i.e. imported via the fixtures endpoint). Returns "ok", "skipped" (no api id), or "no_data".',
  })
  @ApiBody({ type: ApiSyncFixtureStatsDto })
  @ApiResponse({ status: 200, description: '"ok" | "skipped" | "no_data"' })
  async syncImportFixtureStats(@Body() body: ApiSyncFixtureStatsDto) {
    return this.apiSportsAdapterService.syncFixtureStats(Number(body.fixtureId));
  }
}
