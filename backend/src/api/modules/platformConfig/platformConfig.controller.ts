import { Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserRole } from '../../../auth/types/security.types';
import { PlatformConfigService } from './platformConfig.service';
import { UpdatePlatformConfigDto } from './platformConfig.dto';
import { MARKETPLACE_CONFIG, MARKETPLACE_DEFAULTS } from '../../complexModules/marketplace/marketplace.constants';
import {
    ADS_CONFIG,
    ADS_DEFAULTS,
} from './platform-features.constants';
import { AdvancedStatsFeatureService } from './advanced-stats-feature.service';

export interface PlatformFeatureFlags {
    marketplaceEnabled: boolean;
    adsEnabled: boolean;
    playerAdvancedStatsEnabled: boolean;
    attendanceStatsEnabled: boolean;
    attendanceAdvancedStatsEnabled: boolean;
}

@AuthedController('platform-config')
@ApiTags('platform-config')
export class PlatformConfigController {
    constructor(
        private readonly platformConfig: PlatformConfigService,
        private readonly advancedStatsFeature: AdvancedStatsFeatureService,
    ) {}

    @Get('features')
    @Public()
    @ApiOperation({ summary: 'Public platform feature flags for client UI' })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                marketplaceEnabled: { type: 'boolean' },
                adsEnabled: { type: 'boolean' },
                playerAdvancedStatsEnabled: { type: 'boolean' },
                attendanceStatsEnabled: { type: 'boolean' },
                attendanceAdvancedStatsEnabled: { type: 'boolean' },
            },
        },
    })
    async getFeatures(): Promise<PlatformFeatureFlags> {
        const [
            marketplaceEnabled,
            adsEnabled,
            playerAdvancedStatsEnabled,
            attendanceStatsEnabled,
            attendanceAdvancedStatsEnabled,
        ] = await Promise.all([
            this.platformConfig.getBoolean(MARKETPLACE_CONFIG.ENABLED, MARKETPLACE_DEFAULTS.ENABLED),
            this.platformConfig.getBoolean(ADS_CONFIG.ENABLED, ADS_DEFAULTS.ENABLED),
            this.advancedStatsFeature.isPlayerAdvancedStatsEnabled(),
            this.advancedStatsFeature.isAttendanceStatsEnabled(),
            this.advancedStatsFeature.isAttendanceAdvancedStatsEnabled(),
        ]);
        return {
            marketplaceEnabled,
            adsEnabled,
            playerAdvancedStatsEnabled,
            attendanceStatsEnabled,
            attendanceAdvancedStatsEnabled,
        };
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'List all platform config entries (admin only)' })
    async listAll() {
        return this.platformConfig.listAll();
    }

    @Patch(':key')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a platform config value (admin only)' })
    @ApiBody({ type: UpdatePlatformConfigDto })
    async updateConfig(@Param('key') key: string, @Body() dto: UpdatePlatformConfigDto) {
        await this.platformConfig.set(key, dto);
        return { ok: true, key, valueType: dto.valueType };
    }
}
