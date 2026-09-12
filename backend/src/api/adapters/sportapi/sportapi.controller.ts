import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { SportApiAdapterService } from './sportapi-adapter.service';
import { SportApiHttpService } from './sportapi-http.service';
import { SPORTAPI_BASE_URL, SPORTAPI_UNIQUE_TOURNAMENT } from './sportapi.config';

export class SportApiImportFixturesDto {
  @ApiProperty({ description: 'YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  to!: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [SPORTAPI_UNIQUE_TOURNAMENT.PREMIER_LEAGUE],
    description: 'Sofascore uniqueTournament ids (17 = Premier League). Omit to import all football events.',
  })
  uniqueTournamentIds?: number[];

  @ApiPropertyOptional({ default: 0, description: 'Timezone offset in seconds from UTC' })
  timezoneOffset?: number;

  @ApiPropertyOptional({ default: 30 })
  maxApiRequests?: number;

  @ApiPropertyOptional({ default: false })
  syncDetailsAfter?: boolean;

  @ApiPropertyOptional({ default: 20 })
  syncDetailsMaxRequests?: number;

  @ApiPropertyOptional({ default: true })
  createMissingTeams?: boolean;
}

export class SportApiSyncFixtureDetailsDto {
  @ApiPropertyOptional({ description: 'Local fixture id' })
  fixtureId?: number;

  @ApiPropertyOptional({ description: 'RapidAPI SportAPI / Sofascore event id' })
  sportapiEventId?: number;
}

export class SportApiSyncStandingsDto {
  @ApiProperty({ example: 17, description: 'uniqueTournament id (17 = Premier League)' })
  uniqueTournamentId!: number;

  @ApiProperty({ description: 'SportAPI season id from an imported fixture metadata.sportapi.seasonId' })
  sportapiSeasonId!: number;
}

export class SportApiImportManagerCareerDto {
  @ApiPropertyOptional({ description: 'Local manager id' })
  managerId?: number;

  @ApiPropertyOptional({ description: 'Sofascore / SportAPI manager id' })
  sportapiManagerId?: number;

  @ApiPropertyOptional({
    description: 'If omitted, GET /api/v1/manager/{sportapiManagerId} is used',
    type: 'array',
  })
  careerHistory?: Array<{
    team?: { name?: string; id?: number; countryHint?: string };
    performance?: Record<string, number>;
    startTimestamp?: number;
    endTimestamp?: number;
  }>;

  @ApiPropertyOptional({ default: true })
  createMissingTeams?: boolean;
}

export class SportApiRunPipelineDto {
  @ApiProperty({
    type: [Number],
    example: [SPORTAPI_UNIQUE_TOURNAMENT.PREMIER_LEAGUE],
  })
  uniqueTournamentIds!: number[];

  @ApiProperty({ description: 'YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  to!: string;

  @ApiPropertyOptional({ default: true })
  syncStandings?: boolean;

  @ApiPropertyOptional({ default: false })
  syncFixtureDetails?: boolean;

  @ApiProperty({ example: 40 })
  maxApiRequests!: number;

  @ApiPropertyOptional({ default: 0 })
  timezoneOffset?: number;
}

@ApiTags('RapidAPI SportAPI Adapter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('sportapi')
export class SportApiController {
  constructor(
    private readonly adapter: SportApiAdapterService,
    private readonly http: SportApiHttpService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'RapidAPI SportAPI adapter configuration status' })
  status() {
    return {
      configured: this.http.isConfigured(),
      baseUrl: SPORTAPI_BASE_URL,
      uniqueTournaments: SPORTAPI_UNIQUE_TOURNAMENT,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('discover/categories')
  @ApiOperation({ summary: 'Football categories with events on a date' })
  @ApiQuery({ name: 'date', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'timezoneOffset', required: false })
  discoverCategories(
    @Query('date') date: string,
    @Query('timezoneOffset') timezoneOffset?: string,
  ) {
    return this.adapter.discoverCategories(date, timezoneOffset != null ? Number(timezoneOffset) : 0);
  }

  @Get('discover/fixtures')
  @ApiOperation({ summary: 'Scheduled football events for a date (proxy, not persisted)' })
  @ApiQuery({ name: 'date', required: true, description: 'YYYY-MM-DD' })
  discoverFixtures(@Query('date') date: string) {
    return this.adapter.discoverScheduledEvents(date);
  }

  @Get('discover/live')
  @ApiOperation({ summary: 'Live football events (proxy, not persisted)' })
  discoverLive() {
    return this.adapter.discoverLiveEvents();
  }

  @Post('sync/import/fixtures')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import fixtures for a date window from RapidAPI SportAPI' })
  @ApiBody({ type: SportApiImportFixturesDto })
  importFixtures(@Body() body: SportApiImportFixturesDto) {
    return this.adapter.importFixtures(body);
  }

  @Post('sync/import/live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import currently live football fixtures' })
  importLive() {
    return this.adapter.importLiveFixtures();
  }

  @Post('sync/fixture-details')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync incidents, lineups and team stats for one fixture' })
  @ApiBody({ type: SportApiSyncFixtureDetailsDto })
  syncFixtureDetails(@Body() body: SportApiSyncFixtureDetailsDto) {
    return this.adapter.syncFixtureDetails(body);
  }

  @Post('sync/standings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync total standings for a uniqueTournament + season' })
  @ApiBody({ type: SportApiSyncStandingsDto })
  syncStandings(@Body() body: SportApiSyncStandingsDto) {
    return this.adapter.syncStandings(body);
  }

  @Post('sync/import/manager-career')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import a manager career into managerEmployment',
    description:
      'Pass sportapiManagerId to fetch Sofascore careerHistory, or pass careerHistory JSON (same shape as scripts/data/manager-86-career.json).',
  })
  @ApiBody({ type: SportApiImportManagerCareerDto })
  importManagerCareer(@Body() body: SportApiImportManagerCareerDto) {
    return this.adapter.importManagerCareer(body);
  }

  @Post('sync/relink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Attach SportAPI ids onto existing teams/leagues/seasons and drop SportAPI-only duplicates',
  })
  relink() {
    return this.adapter.relinkToExistingRecords();
  }

  @Post('sync/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run RapidAPI SportAPI pipeline',
    description: 'Fixtures (by date) → optional details → standings under maxApiRequests budget',
  })
  @ApiBody({ type: SportApiRunPipelineDto })
  @ApiOkResponse({ description: 'Pipeline summary with per-step counts' })
  runPipeline(@Body() body: SportApiRunPipelineDto) {
    return this.adapter.runPipeline(body);
  }
}
