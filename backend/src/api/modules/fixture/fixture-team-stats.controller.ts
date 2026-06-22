import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FixtureTeamStatService } from '../fixtureTeamStat/fixtureTeamStat.service';

@ApiTags('Fixture')
@Controller('fixture')
export class FixtureTeamStatsController {
    constructor(private readonly fixtureTeamStatService: FixtureTeamStatService) {}

    @Get(':fixtureId/team-stats')
    @ApiOperation({
        summary: 'Get team stats for a fixture',
        description:
            'Returns home and away team aggregate stats for the given fixture. ' +
            'Source is `api_sports` when synced from API-Sports `/fixtures/statistics`, ' +
            'or `derived` when aggregated from player-level StatsBomb rollups.',
    })
    @ApiParam({ name: 'fixtureId', type: Number })
    async getTeamStats(@Param('fixtureId', ParseIntPipe) fixtureId: number) {
        return this.fixtureTeamStatService.getByFixture(fixtureId);
    }
}
