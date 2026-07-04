import { Module } from '@nestjs/common';
import { PlatformConfigModule } from '../../modules/platformConfig/platformConfig.module';
import { TicketLinksFeatureService } from './ticket-links-feature.service';
import { TicketLinksEnabledGuard } from './ticket-links-enabled.guard';

@Module({
    imports: [PlatformConfigModule],
    providers: [TicketLinksFeatureService, TicketLinksEnabledGuard],
    exports: [TicketLinksFeatureService, TicketLinksEnabledGuard],
})
export class TicketLinksFeatureModule {}
