import { Controller, Get, HttpCode, HttpStatus, Optional, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { LiveFixtureSyncService } from './live-fixture-sync.service';
import { LiveFixtureSyncScheduler } from './live-fixture-sync.scheduler';
import { LiveFixtureSyncConfigService } from './live-fixture-sync-config.service';
import { isLiveFixtureSyncEnabledByEnv } from './live-fixture-sync.config';

const hasRedis = !!process.env.REDIS_HOST;

@ApiTags('Admin live fixtures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/live-fixtures')
export class LiveFixtureSyncController {
  constructor(
    private readonly liveFixtureSyncService: LiveFixtureSyncService,
    private readonly config: LiveFixtureSyncConfigService,
    @Optional() private readonly scheduler?: LiveFixtureSyncScheduler,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Live fixture sync scheduler status' })
  @ApiResponse({ status: 200 })
  async getStatus() {
    const enabled = await this.config.isScheduledSyncEnabled();
    return {
      redisConfigured: this.config.isRedisConfigured(),
      schedulerRegistered: hasRedis,
      scheduledSyncEnabled: enabled,
      envAllowsSync: isLiveFixtureSyncEnabledByEnv(),
      cron: this.config.getCronExpression(),
      platformConfigKey: 'live_fixture_sync_enabled',
    };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger live fixture sync',
    description:
      'Persists live scores/status and timeline events (goals, cards, subs). When Redis is configured, enqueues BullMQ; otherwise runs synchronously.',
  })
  @ApiResponse({ status: 200 })
  async triggerSync() {
    if (hasRedis && this.scheduler) {
      return this.scheduler.triggerSync();
    }
    const result = await this.liveFixtureSyncService.syncLiveFixtures();
    return { async: false, ...result };
  }
}
