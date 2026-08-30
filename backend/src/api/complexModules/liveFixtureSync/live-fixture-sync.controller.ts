import { Controller, HttpCode, HttpStatus, Optional, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { LiveFixtureSyncService } from './live-fixture-sync.service';
import { LiveFixtureSyncScheduler } from './live-fixture-sync.scheduler';

const hasRedis = !!process.env.REDIS_HOST;

@ApiTags('Admin live fixtures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/live-fixtures')
export class LiveFixtureSyncController {
  constructor(
    private readonly liveFixtureSyncService: LiveFixtureSyncService,
    @Optional() private readonly scheduler?: LiveFixtureSyncScheduler,
  ) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger live fixture sync',
    description:
      'When Redis is configured, enqueues a BullMQ job. Otherwise runs synchronously (one API-Sports request for all live matches).',
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
