import { Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { PlatformConfigService } from './platformConfig.service';
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
}
