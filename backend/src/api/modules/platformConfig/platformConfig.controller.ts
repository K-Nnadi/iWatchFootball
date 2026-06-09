import { Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { PlatformConfigService } from './platformConfig.service';
import { MARKETPLACE_CONFIG, MARKETPLACE_DEFAULTS } from '../../complexModules/marketplace/marketplace.constants';

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
            },
        },
    })
    async getFeatures(): Promise<{ marketplaceEnabled: boolean }> {
        const marketplaceEnabled = await this.platformConfig.getBoolean(
            MARKETPLACE_CONFIG.ENABLED,
            MARKETPLACE_DEFAULTS.ENABLED,
        );
        return { marketplaceEnabled };
    }
}
