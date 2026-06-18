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
import { ADS_CONFIG, ADS_DEFAULTS } from './platform-features.constants';

export interface PlatformFeatureFlags {
    marketplaceEnabled: boolean;
    adsEnabled: boolean;
}

@AuthedController('platform-config')
@ApiTags('platform-config')
export class PlatformConfigController {
    constructor(private readonly platformConfig: PlatformConfigService) {}

    @Get('features')
    @Public()
    @ApiOperation({ summary: 'Public platform feature flags for client UI' })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                marketplaceEnabled: { type: 'boolean' },
                adsEnabled: { type: 'boolean' },
            },
        },
    })
    async getFeatures(): Promise<PlatformFeatureFlags> {
        const [marketplaceEnabled, adsEnabled] = await Promise.all([
            this.platformConfig.getBoolean(MARKETPLACE_CONFIG.ENABLED, MARKETPLACE_DEFAULTS.ENABLED),
            this.platformConfig.getBoolean(ADS_CONFIG.ENABLED, ADS_DEFAULTS.ENABLED),
        ]);
        return { marketplaceEnabled, adsEnabled };
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
