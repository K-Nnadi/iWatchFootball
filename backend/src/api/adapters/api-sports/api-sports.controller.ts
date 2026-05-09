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
}

export class ApiSportsSyncTransfersDto {
  @ApiProperty({ description: 'API-Sports team id' })
  teamApiId!: number;

  @ApiProperty({ required: false, description: 'Optional season filter' })
  season?: number;
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

/** Raw JSON from api-sports.io (shape varies by endpoint). */
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
  constructor(private readonly apiSportsAdapterService: ApiSportsAdapterService) {}

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
}
