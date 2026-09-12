import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { PlayerFixtureStatService } from './player-fixture-stat.service';

@ApiTags('competition-stats')
@Controller('competition-stats')
export class CompetitionSeasonStatsController {
    constructor(private readonly playerFixtureStatService: PlayerFixtureStatService) {}

    @Get('assists')
    @Public()
    @ApiOperation({ summary: 'Assist totals for a competition season (goals + StatsBomb rollups)' })
    @ApiQuery({ name: 'competitionId', required: true, type: Number })
    @ApiQuery({ name: 'seasonId', required: true, type: Number })
    @ApiOkResponse({ description: 'playerId and assist count' })
    async getSeasonAssists(
        @Query('competitionId') competitionIdRaw?: string,
        @Query('seasonId') seasonIdRaw?: string,
    ): Promise<Array<{ playerId: number; assists: number }>> {
        const ids = this.parseSeasonIds(competitionIdRaw, seasonIdRaw);
        if (!ids) return [];
        return this.playerFixtureStatService.assistCountsForCompetitionSeason(ids.competitionId, ids.seasonId);
    }

    @Get('appearances')
    @Public()
    @ApiOperation({ summary: 'Appearance totals for a competition season (starts, subs, match events)' })
    @ApiQuery({ name: 'competitionId', required: true, type: Number })
    @ApiQuery({ name: 'seasonId', required: true, type: Number })
    @ApiOkResponse({ description: 'playerId and games played' })
    async getSeasonAppearances(
        @Query('competitionId') competitionIdRaw?: string,
        @Query('seasonId') seasonIdRaw?: string,
    ): Promise<Array<{ playerId: number; played: number }>> {
        const ids = this.parseSeasonIds(competitionIdRaw, seasonIdRaw);
        if (!ids) return [];
        return this.playerFixtureStatService.appearanceCountsForCompetitionSeason(ids.competitionId, ids.seasonId);
    }

    private parseSeasonIds(
        competitionIdRaw?: string,
        seasonIdRaw?: string,
    ): { competitionId: number; seasonId: number } | null {
        const competitionId = Number(competitionIdRaw);
        const seasonId = Number(seasonIdRaw);
        if (!Number.isInteger(competitionId) || competitionId <= 0 || !Number.isInteger(seasonId) || seasonId <= 0) {
            return null;
        }
        return { competitionId, seasonId };
    }
}
