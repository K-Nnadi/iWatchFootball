import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { SportMonksAdapterService } from './sportmonks-adapter.service';
import { SportMonksHttpService } from './sportmonks-http.service';
import { extractSportMonksList } from './sportmonks-response.util';

export class SportMonksImportLeaguesDto {
  @ApiProperty({ type: [Number], example: [8], description: 'SportMonks league ids (8 = Premier League)' })
  leagueIds!: number[];

  @ApiPropertyOptional({ default: true })
  currentSeasonOnly?: boolean;
}

export class SportMonksSyncStandingsDto {
  @ApiProperty({ description: 'Local season id' })
  seasonId!: number;
}

export class SportMonksImportFixturesDto {
  @ApiProperty({ description: 'YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  to!: string;

  @ApiPropertyOptional({ description: 'SportMonks league id filter' })
  leagueId?: number;

  @ApiPropertyOptional({ description: 'SportMonks season id filter' })
  sportmonksSeasonId?: number;

  @ApiPropertyOptional({ default: 'UTC' })
  timezone?: string;

  @ApiPropertyOptional({ default: 20 })
  maxPages?: number;

  @ApiPropertyOptional({ default: 30 })
  maxRequests?: number;

  @ApiPropertyOptional({ default: false })
  syncDetailsAfter?: boolean;

  @ApiPropertyOptional({ default: 20 })
  syncDetailsMaxRequests?: number;

  @ApiPropertyOptional({ default: true })
  createMissingTeams?: boolean;
}

export class SportMonksSyncFixtureDetailsDto {
  @ApiPropertyOptional({ description: 'Local fixture id' })
  fixtureId?: number;

  @ApiPropertyOptional({ description: 'SportMonks fixture id' })
  sportmonksFixtureId?: number;
}

export class SportMonksSyncSquadsDto {
  @ApiProperty({ description: 'Local season id' })
  seasonId!: number;

  @ApiPropertyOptional({ default: 40 })
  maxRequests?: number;

  @ApiPropertyOptional({ type: [Number], description: 'Limit to these local team ids' })
  teamIds?: number[];
}

export class SportMonksRunPipelineDto {
  @ApiProperty({ type: [Number], example: [8] })
  leagueIds!: number[];

  @ApiProperty({ description: 'YYYY-MM-DD' })
  from!: string;

  @ApiProperty({ description: 'YYYY-MM-DD' })
  to!: string;

  @ApiPropertyOptional({ default: true })
  syncStandings?: boolean;

  @ApiPropertyOptional({ default: true })
  syncFixtureDetails?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Import season squads into playerTeamStint' })
  syncSquads?: boolean;

  @ApiProperty({ example: 100 })
  maxApiRequests!: number;

  @ApiPropertyOptional({ default: 'UTC' })
  timezone?: string;
}

@ApiTags('SportMonks Adapter')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('sportmonks')
export class SportMonksController {
  constructor(
    private readonly adapter: SportMonksAdapterService,
    private readonly http: SportMonksHttpService,
  ) {}

  @Get('leagues')
  @ApiOperation({
    summary: 'List leagues available to your SportMonks token',
    description: 'Use this to find league IDs for sync/run on free/single-league plans.',
  })
  async listLeagues() {
    const body = await this.http.get<unknown>('/leagues', { per_page: 50 });
    const leagues = extractSportMonksList<{ id: number; name?: string; short_code?: string }>(body);
    return {
      count: leagues.length,
      leagues: leagues.map((l) => ({ id: l.id, name: l.name, shortCode: l.short_code })),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'SportMonks adapter configuration status' })
  status() {
    return {
      configured: this.http.isConfigured(),
      baseUrl: 'https://api.sportmonks.com/v3/football',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('sync/import/leagues')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import leagues and seasons from SportMonks' })
  @ApiBody({ type: SportMonksImportLeaguesDto })
  importLeagues(@Body() body: SportMonksImportLeaguesDto) {
    return this.adapter.importLeagues(body);
  }

  @Post('sync/standings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync standings for a local season (SportMonks season id from metadata)' })
  @ApiBody({ type: SportMonksSyncStandingsDto })
  syncStandings(@Body() body: SportMonksSyncStandingsDto) {
    return this.adapter.syncStandings(body);
  }

  @Post('sync/import/fixtures')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import fixtures for a date window' })
  @ApiBody({ type: SportMonksImportFixturesDto })
  importFixtures(@Body() body: SportMonksImportFixturesDto) {
    return this.adapter.importFixtures(body);
  }

  @Post('sync/fixture-details')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync goals, cards, substitutions and lineups for one fixture' })
  @ApiBody({ type: SportMonksSyncFixtureDetailsDto })
  syncFixtureDetails(@Body() body: SportMonksSyncFixtureDetailsDto) {
    return this.adapter.syncFixtureDetails(body);
  }

  @Post('sync/import/squads')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import season squads into playerTeamStint' })
  @ApiBody({ type: SportMonksSyncSquadsDto })
  importSquads(@Body() body: SportMonksSyncSquadsDto) {
    return this.adapter.importSquads(body);
  }

  @Post('sync/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run full SportMonks pipeline',
    description: 'Leagues → fixtures → standings → optional fixture details under maxApiRequests budget',
  })
  @ApiBody({ type: SportMonksRunPipelineDto })
  @ApiOkResponse({ description: 'Pipeline summary with per-step counts' })
  runPipeline(@Body() body: SportMonksRunPipelineDto) {
    return this.adapter.runPipeline(body);
  }
}
