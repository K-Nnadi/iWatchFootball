import { Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { CreateLogDTO, Log } from './log.entity';
import { LogService, LogHistoryResponse } from './log.service';
import { AttendanceAdvancedStatsService } from '../playerFixtureStat/attendance-advanced-stats.service';
import { AdvancedStatsFeatureService } from '../platformConfig/advanced-stats-feature.service';
import type { AttendanceAdvancedStatsResponse } from '../playerFixtureStat/attendance-advanced-stats.service';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('log')
export class LogController extends CrudController<Log, CreateLogDTO>(Log, CreateLogDTO) {
    constructor(
        private readonly logService: LogService,
        private readonly attendanceAdvancedStats: AttendanceAdvancedStatsService,
        private readonly advancedStatsFeature: AdvancedStatsFeatureService,
    ) {
        super(logService);
    }

    @Get('my-history')
    @ApiOperation({
        summary: 'Get match log history with freemium gating (verified limit for free users)',
    })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                logs: { type: 'array', items: { type: 'object' } },
                entitlements: { type: 'object' },
            },
        },
    })
    async getMyHistory(@Req() req: AuthedRequest): Promise<LogHistoryResponse> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.logService.getMyHistory(userId);
    }

    @Get('my-attendance-advanced-stats')
    @ApiOperation({ summary: 'Advanced attendance stat leaderboards across logged fixtures' })
    @ApiOkResponse({ description: 'Ranked leaderboards for xG, key passes, and related metrics' })
    async getMyAttendanceAdvancedStats(
        @Req() req: AuthedRequest,
    ): Promise<AttendanceAdvancedStatsResponse> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        await this.advancedStatsFeature.assertAttendanceAdvancedStatsEnabled();
        return this.attendanceAdvancedStats.getLeaderboardsForUser(userId);
    }
}
