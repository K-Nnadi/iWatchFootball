import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PlatformConfigService } from '../../modules/platformConfig/platformConfig.service';
import { TICKET_LINKS_CONFIG, TICKET_LINKS_DEFAULTS } from './ticket-links.constants';

@Injectable()
export class TicketLinksFeatureService {
    constructor(private readonly platformConfig: PlatformConfigService) {}

    async isEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            TICKET_LINKS_CONFIG.ENABLED,
            TICKET_LINKS_DEFAULTS.ENABLED,
        );
    }

    async isAffiliateEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            TICKET_LINKS_CONFIG.AFFILIATE_ENABLED,
            TICKET_LINKS_DEFAULTS.AFFILIATE_ENABLED,
        );
    }

    async assertEnabled(): Promise<void> {
        if (!(await this.isEnabled())) {
            throw new ServiceUnavailableException('Ticket links are not enabled');
        }
    }
}
