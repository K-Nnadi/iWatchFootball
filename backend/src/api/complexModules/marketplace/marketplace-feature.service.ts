import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PlatformConfigService } from '../../modules/platformConfig/platformConfig.service';
import { MARKETPLACE_CONFIG, MARKETPLACE_DEFAULTS } from './marketplace.constants';

@Injectable()
export class MarketplaceFeatureService {
    constructor(private readonly platformConfig: PlatformConfigService) {}

    async isEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            MARKETPLACE_CONFIG.ENABLED,
            MARKETPLACE_DEFAULTS.ENABLED,
        );
    }

    async assertEnabled(): Promise<void> {
        if (!(await this.isEnabled())) {
            throw new ServiceUnavailableException('Marketplace is not enabled');
        }
    }
}
