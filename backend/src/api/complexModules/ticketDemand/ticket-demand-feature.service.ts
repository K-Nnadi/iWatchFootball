import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PlatformConfigService } from '../../modules/platformConfig/platformConfig.service';
import { TICKET_DEMAND_CONFIG, TICKET_DEMAND_DEFAULTS } from './ticket-demand.constants';

@Injectable()
export class TicketDemandFeatureService {
    constructor(private readonly platformConfig: PlatformConfigService) {}

    async isEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            TICKET_DEMAND_CONFIG.ENABLED,
            TICKET_DEMAND_DEFAULTS.ENABLED,
        );
    }

    async assertEnabled(): Promise<void> {
        if (!(await this.isEnabled())) {
            throw new ServiceUnavailableException('Ticket demand tracking is not enabled');
        }
    }
}
