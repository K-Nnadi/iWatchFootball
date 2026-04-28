import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
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

@ApiTags('API-Sports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api-sports')
export class ApiSportsController {
  constructor(private readonly apiSportsAdapterService: ApiSportsAdapterService) {}

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
}
