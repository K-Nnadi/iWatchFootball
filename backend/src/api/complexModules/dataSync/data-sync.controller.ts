import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Optional,
  Param,
  ParseIntPipe,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { DataSyncRunDto, isApiSportsPipelineEnabled } from './data-sync.dto';
import { SyncJobService } from './sync-job.service';
import { DataSyncPipelineService } from './data-sync-pipeline.service';

const hasRedis = !!process.env.REDIS_HOST;

@ApiTags('Admin data sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/data-sync')
export class DataSyncController {
  constructor(
    private readonly syncJobService: SyncJobService,
    private readonly pipeline: DataSyncPipelineService,
    @Optional() @InjectQueue('data-sync') private readonly dataSyncQueue?: Queue,
  ) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'One-click bulk sync (StatsBomb + budgeted API-Sports)',
    description:
      'Runs StatsBomb (optional) then API-Sports steps under a shared maxApiRequests budget. When Redis is configured, defaults to async (BullMQ) to avoid HTTP timeouts; poll GET /admin/data-sync/jobs/:id. Use resumeJobId to continue checkpoints after partial runs or crashes.',
  })
  @ApiBody({
    type: DataSyncRunDto,
    examples: {
      premierLeagueSlice: {
        summary: 'PL — bounded API budget',
        description:
          'Typical free-tier pattern: keep maxApiRequests modest, re-run with resumeJobId if status is partial. StatsBomb does not count toward the API budget.',
        value: {
          statsbomb: true,
          statsbombOptions: { skipLineups: true },
          apiSports: {
            enabled: true,
            season: 2024,
            country: 'England',
            leagueApiIds: [39],
            maxApiRequests: 80,
            leagues: { maxStandingsRequests: 15 },
            players: { maxPages: 2, maxRequestsPerLeague: 8 },
            fixtures: {
              from: '2024-08-01',
              to: '2025-05-31',
              maxRequestsPerLeague: 20,
            },
            enrich: { limit: 25, maxRequests: 20 },
          },
        },
      },
      apiOnlyTight: {
        summary: 'API-Sports only — small window',
        value: {
          statsbomb: false,
          async: false,
          apiSports: {
            enabled: true,
            season: 2024,
            country: 'England',
            leagueApiIds: [39],
            maxApiRequests: 40,
            fixtures: { from: '2024-08-16', to: '2024-08-18', maxRequestsPerLeague: 5 },
          },
        },
      },
      resume: {
        summary: 'Resume previous job',
        value: { resumeJobId: 1 },
      },
    },
  })
  @ApiResponse({ status: 200 })
  async run(@Body() body: DataSyncRunDto) {
    this.assertValidRunDto(body);

    const useAsync = body.async ?? hasRedis;
    if (body.async === true && !this.dataSyncQueue) {
      throw new ServiceUnavailableException('async=true requires REDIS_HOST (BullMQ)');
    }

    const job =
      body.resumeJobId != null
        ? await this.resumeJob(body.resumeJobId)
        : await this.syncJobService.createWithSteps(body);

    if (useAsync && this.dataSyncQueue) {
      const bullJob = await this.dataSyncQueue.add(
        'pipeline-run',
        { syncJobId: job.id },
        {
          attempts: 1,
          removeOnComplete: { age: 3600, count: 50 },
          removeOnFail: { age: 86400 },
        },
      );
      await this.syncJobService.setBullJobId(job.id, String(bullJob.id));
      return {
        syncJobId: job.id,
        bullJobId: String(bullJob.id),
        async: true,
        message:
          'Queued. Poll GET /admin/data-sync/jobs/:syncJobId for DB checkpoints; bullJobId is the BullMQ job id.',
      };
    }

    const result = await this.pipeline.execute(job.id);
    return {
      syncJobId: job.id,
      async: false,
      ...result,
    };
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get sync job, steps, and cursors' })
  async getJob(@Param('id', ParseIntPipe) id: number) {
    return this.syncJobService.getJobWithSteps(id);
  }

  private async resumeJob(id: number) {
    const existing = await this.syncJobService.findOneOrFail(id);
    await this.syncJobService.markRunning(existing.id);
    return existing;
  }

  private assertValidRunDto(body: DataSyncRunDto) {
    if (body.resumeJobId != null) {
      return;
    }
    if (!body.statsbomb && !isApiSportsPipelineEnabled(body)) {
      throw new BadRequestException('Enable at least one of statsbomb or apiSports (or pass resumeJobId)');
    }
    if (isApiSportsPipelineEnabled(body)) {
      const api = body.apiSports!;
      if (api.maxApiRequests == null || Number(api.maxApiRequests) < 0) {
        throw new BadRequestException('apiSports.maxApiRequests is required and must be >= 0');
      }
      if (api.season == null || Number.isNaN(Number(api.season))) {
        throw new BadRequestException('apiSports.season is required');
      }
    }
  }
}
