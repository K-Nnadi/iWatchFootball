import { Module } from '@nestjs/common';
import { PlatformConfigModule } from '../../modules/platformConfig/platformConfig.module';
import { MarketplaceFeatureService } from './marketplace-feature.service';
import { MarketplaceEnabledGuard } from './marketplace-enabled.guard';

@Module({
    imports: [PlatformConfigModule],
    providers: [MarketplaceFeatureService, MarketplaceEnabledGuard],
    exports: [MarketplaceFeatureService, MarketplaceEnabledGuard],
})
export class MarketplaceFeatureModule {}
