import { Controller, HttpCode, HttpStatus, Logger, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { HighlightsScheduler } from './highlights.scheduler';
import { HighlightsService } from './highlights.service';

const hasRedis = !!process.env.REDIS_HOST;

@ApiTags('fixtures')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('fixtures')
export class HighlightsController {
    private readonly logger = new Logger(HighlightsController.name);

    constructor(
        private readonly highlightsService: HighlightsService,
        private readonly scheduler: HighlightsScheduler,
    ) {}

    @Post(':id/highlights/sync')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Trigger highlight sync for a fixture (admin only)' })
    @ApiResponse({ status: 200, description: 'Sync triggered' })
    async syncHighlights(@Param('id', ParseIntPipe) fixtureId: number): Promise<{ message: string }> {
        if (hasRedis) {
            await this.scheduler.enqueueSync(fixtureId, 0);
            return { message: `Highlight sync enqueued for fixture ${fixtureId}` };
        }

        this.logger.log(`Redis not available — running highlight sync synchronously for fixture ${fixtureId}`);
        await this.highlightsService.syncFixtureHighlights(fixtureId);
        return { message: `Highlight sync completed synchronously for fixture ${fixtureId}` };
    }
}
