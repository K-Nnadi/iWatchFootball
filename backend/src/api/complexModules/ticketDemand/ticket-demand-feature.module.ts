import { Module } from '@nestjs/common';
import { PlatformConfigModule } from '../../modules/platformConfig/platformConfig.module';
import { TicketDemandFeatureService } from './ticket-demand-feature.service';

@Module({
    imports: [PlatformConfigModule],
    providers: [TicketDemandFeatureService],
    exports: [TicketDemandFeatureService],
})
export class TicketDemandFeatureModule {}
