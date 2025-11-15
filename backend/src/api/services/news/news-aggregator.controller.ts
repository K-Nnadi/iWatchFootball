import { Controller, Post, Param, Get, UseGuards, Optional, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NewsAggregatorScheduler } from './news-aggregator.scheduler';
import { NewsAggregatorService } from './news-aggregator.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';

@ApiTags('news-aggregation')
@Controller('news-aggregation')
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
    if (!this.scheduler) {
      throw new HttpException(
        'News aggregation scheduler is not available. Redis connection required.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const job = await this.scheduler.triggerAggregation();
    return {
      message: 'News aggregation job triggered',
      jobId: job.id,
    };
  }


  @Post('trigger/:feedName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger news aggregation for a specific feed' })
  @ApiResponse({ status: 200, description: 'News aggregation job triggered for feed' })
  async triggerFeedAggregation(@Param('feedName') feedName: string) {
    if (!this.scheduler) {
      throw new HttpException(
        'News aggregation scheduler is not available. Redis connection required.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const job = await this.scheduler.triggerAggregation(feedName);
    return {
      message: `News aggregation job triggered for feed: ${feedName}`,
      jobId: job.id,
    };
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

