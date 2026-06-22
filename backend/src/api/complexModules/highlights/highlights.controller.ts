import { Body, Controller, HttpCode, HttpStatus, Logger, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { HighlightsScheduler } from './highlights.scheduler';
import { HighlightsService } from './highlights.service';

const hasRedis = !!process.env.REDIS_HOST;

class SyncBulkHighlightsDto {
    @ApiProperty({ description: 'Specific fixture IDs to sync. Omit to auto-detect all recently completed fixtures needing highlights.', required: false, type: [Number] })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    fixtureIds?: number[];

    @ApiProperty({ description: 'How many hours back to look for fixtures needing highlights (default 48)', required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    lookbackHours?: number;
}

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
    @ApiOperation({ summary: 'Trigger highlight sync for a single fixture (admin only)' })
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

    @Post('highlights/sync-bulk')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Trigger highlight sync for multiple fixtures at once (admin only). Omit body to auto-detect all recently completed fixtures.' })
    @ApiResponse({ status: 200, description: 'Bulk sync triggered' })
    async syncBulkHighlights(@Body() dto: SyncBulkHighlightsDto): Promise<{ message: string; queued: number }> {
        const result = await this.highlightsService.syncBulkFixtureHighlights({
            fixtureIds: dto.fixtureIds,
            lookbackHours: dto.lookbackHours,
            useQueue: hasRedis,
            scheduler: this.scheduler,
        });

        return {
            message: hasRedis
                ? `${result.count} fixture(s) enqueued for highlight sync`
                : `${result.count} fixture(s) synced synchronously`,
            queued: result.count,
        };
    }
}
