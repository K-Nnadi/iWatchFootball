import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { PlayerMatchesService } from './player-matches.service';
import { PlayerAdvancedStatsService } from '../playerFixtureStat/player-advanced-stats.service';
import { AdvancedStatsFeatureService } from '../platformConfig/advanced-stats-feature.service';
import { PlayerService, type PlayerLookupRow } from './player.service';
import type { PlayerMatchesResponse } from './player-matches.types';
import type { PlayerAdvancedStatsResponse } from '../playerFixtureStat/player-advanced-stats.service';

@ApiTags('player')
@Controller('player')
export class PlayerProfileController {
    constructor(
        private readonly playerService: PlayerService,
        private readonly playerMatchesService: PlayerMatchesService,
        private readonly playerAdvancedStatsService: PlayerAdvancedStatsService,
        private readonly advancedStatsFeature: AdvancedStatsFeatureService,
    ) {}

    @Post('lookup')
    @Public()
    @ApiOperation({ summary: 'Resolve player names and photos by id (public, body — not GET /query $in)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: { ids: { type: 'array', items: { type: 'number' } } },
        },
    })
    @ApiOkResponse({ description: 'id, name, photoUrl for each found player' })
    async lookupPlayers(@Body() body: { ids?: unknown }): Promise<PlayerLookupRow[]> {
        const ids = Array.isArray(body?.ids)
            ? body.ids.map((value) => Number(value)).filter((id) => Number.isInteger(id) && id > 0)
            : [];
        return this.playerService.lookupByIds(ids);
    }

    @Get(':playerId/matches')
    @Public()
    @ApiOperation({ summary: 'Recent results and upcoming fixtures for a player' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiOkResponse({ description: 'Match history grouped by results and fixtures' })
    async getPlayerMatches(
        @Param('playerId', ParseIntPipe) playerId: number,
        @Query('limit') limitRaw?: string,
    ): Promise<PlayerMatchesResponse> {
        const limit =
            limitRaw != null && limitRaw !== '' && Number.isFinite(Number(limitRaw))
                ? Math.min(50, Math.max(1, Number(limitRaw)))
                : 30;
        return this.playerMatchesService.getPlayerMatches(playerId, limit);
    }

    @Get(':playerId/advanced-stats')
    @Public()
    @ApiOperation({ summary: 'Composed advanced performance stats for a player (xG, passing, possession, defending)' })
    @ApiQuery({ name: 'seasonId', required: false, type: Number })
    @ApiOkResponse({ description: 'Advanced stat categories with totals and per-90 values' })
    async getPlayerAdvancedStats(
        @Param('playerId', ParseIntPipe) playerId: number,
        @Query('seasonId') seasonIdRaw?: string,
    ): Promise<PlayerAdvancedStatsResponse> {
        await this.advancedStatsFeature.assertPlayerAdvancedStatsEnabled();
        const seasonId =
            seasonIdRaw != null && seasonIdRaw !== '' && Number.isFinite(Number(seasonIdRaw))
                ? Number(seasonIdRaw)
                : undefined;
        return this.playerAdvancedStatsService.getForPlayer(playerId, seasonId);
    }
}
