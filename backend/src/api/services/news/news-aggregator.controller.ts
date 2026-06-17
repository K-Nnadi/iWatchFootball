import { Controller, Post, Param, Get, UseGuards, Optional, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NewsAggregatorScheduler } from './news-aggregator.scheduler';
import { NewsAggregatorService } from './news-aggregator.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';

@ApiTags('newsAggregation')
@Controller('newsAggregation')
export class NewsAggregatorController {
  constructor(
    @Optional() private readonly scheduler: NewsAggregatorScheduler | null,
    private readonly aggregatorService: NewsAggregatorService,
  ) {}

  @Post('trigger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger news aggregation' })
  @ApiResponse({ status: 200, description: 'News aggregation job triggered' })
  async triggerAggregation() {
    if (this.scheduler) {
      const job = await this.scheduler.triggerAggregation();
      return { message: 'News aggregation job queued', jobId: job.id, queued: true };
    }
    // No Redis — run synchronously
    const result = await this.aggregatorService.aggregateAllFeeds();
    return { message: 'News aggregation completed (no-Redis sync)', queued: false, result };
  }

  @Post('trigger/:feedName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger news aggregation for a specific feed' })
  @ApiResponse({ status: 200, description: 'News aggregation job triggered for feed' })
  async triggerFeedAggregation(@Param('feedName') feedName: string) {
    if (this.scheduler) {
      const job = await this.scheduler.triggerAggregation(feedName);
      return { message: `News aggregation job queued for feed: ${feedName}`, jobId: job.id, queued: true };
    }
    // No Redis — run synchronously
    const result = await this.aggregatorService.aggregateFeed(feedName);
    return { message: `News aggregation completed for feed: ${feedName}`, queued: false, result };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get news aggregation status' })
  @ApiResponse({ status: 200, description: 'News aggregation status' })
  async getStatus() {
    return {
      message: 'News aggregation service is running',
      scheduler: this.scheduler ? 'active' : 'inactive (Redis not configured)',
      redisConfigured: !!process.env.REDIS_HOST,
    };
  }
}

