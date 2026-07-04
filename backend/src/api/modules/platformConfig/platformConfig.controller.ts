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
import { AdvancedStatsFeatureService } from './advanced-stats-feature.service';
import { TICKET_LINKS_CONFIG, TICKET_LINKS_DEFAULTS } from '../../complexModules/ticketLinks/ticket-links.constants';
import { ATTENDANCE_TRACKING_CONFIG, ATTENDANCE_TRACKING_DEFAULTS } from '../../complexModules/attendanceTracking/attendance-tracking.constants';
import { TICKET_DEMAND_CONFIG, TICKET_DEMAND_DEFAULTS } from '../../complexModules/ticketDemand/ticket-demand.constants';
import { MARKETPLACE_FEES_CONFIG, MARKETPLACE_FEES_DEFAULTS } from '../../complexModules/marketplace/marketplace-fees.constants';

export interface PlatformFeatureFlags {
    marketplaceEnabled: boolean;
    adsEnabled: boolean;
    playerAdvancedStatsEnabled: boolean;
    attendanceStatsEnabled: boolean;
    attendanceAdvancedStatsEnabled: boolean;
    ticketLinksEnabled: boolean;
    affiliateLinksEnabled: boolean;
    matchdayAffiliatesEnabled: boolean;
    hospitalityLinksEnabled: boolean;
    sponsoredPlacementsEnabled: boolean;
    ticketAlertsEnabled: boolean;
    affiliateDisclosureEnabled: boolean;
    attendanceTrackingEnabled: boolean;
    ticketDocumentUploadEnabled: boolean;
    ticketDemandEnabled: boolean;
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
                ticketLinksEnabled: { type: 'boolean' },
                affiliateLinksEnabled: { type: 'boolean' },
                matchdayAffiliatesEnabled: { type: 'boolean' },
                hospitalityLinksEnabled: { type: 'boolean' },
                sponsoredPlacementsEnabled: { type: 'boolean' },
                ticketAlertsEnabled: { type: 'boolean' },
                affiliateDisclosureEnabled: { type: 'boolean' },
                attendanceTrackingEnabled: { type: 'boolean' },
                ticketDocumentUploadEnabled: { type: 'boolean' },
                ticketDemandEnabled: { type: 'boolean' },
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
            ticketLinksEnabled,
            affiliateLinksEnabled,
            matchdayAffiliatesEnabled,
            hospitalityLinksEnabled,
            sponsoredPlacementsEnabled,
            ticketAlertsEnabled,
            affiliateDisclosureEnabled,
            attendanceTrackingEnabled,
            ticketDocumentUploadEnabled,
            ticketDemandEnabled,
        ] = await Promise.all([
            this.platformConfig.getBoolean(MARKETPLACE_CONFIG.ENABLED, MARKETPLACE_DEFAULTS.ENABLED),
            this.platformConfig.getBoolean(ADS_CONFIG.ENABLED, ADS_DEFAULTS.ENABLED),
            this.advancedStatsFeature.isPlayerAdvancedStatsEnabled(),
            this.advancedStatsFeature.isAttendanceStatsEnabled(),
            this.advancedStatsFeature.isAttendanceAdvancedStatsEnabled(),
            this.platformConfig.getBoolean(TICKET_LINKS_CONFIG.ENABLED, TICKET_LINKS_DEFAULTS.ENABLED),
            this.platformConfig.getBoolean(TICKET_LINKS_CONFIG.AFFILIATE_ENABLED, TICKET_LINKS_DEFAULTS.AFFILIATE_ENABLED),
            this.platformConfig.getBoolean(TICKET_LINKS_CONFIG.MATCHDAY_AFFILIATES_ENABLED, TICKET_LINKS_DEFAULTS.MATCHDAY_AFFILIATES_ENABLED),
            this.platformConfig.getBoolean(TICKET_LINKS_CONFIG.HOSPITALITY_ENABLED, TICKET_LINKS_DEFAULTS.HOSPITALITY_ENABLED),
            this.platformConfig.getBoolean(TICKET_LINKS_CONFIG.SPONSORED_PLACEMENTS_ENABLED, TICKET_LINKS_DEFAULTS.SPONSORED_PLACEMENTS_ENABLED),
            this.platformConfig.getBoolean(TICKET_LINKS_CONFIG.TICKET_ALERTS_ENABLED, TICKET_LINKS_DEFAULTS.TICKET_ALERTS_ENABLED),
            this.platformConfig.getBoolean(TICKET_LINKS_CONFIG.AFFILIATE_DISCLOSURE_ENABLED, TICKET_LINKS_DEFAULTS.AFFILIATE_DISCLOSURE_ENABLED),
            this.platformConfig.getBoolean(ATTENDANCE_TRACKING_CONFIG.ENABLED, ATTENDANCE_TRACKING_DEFAULTS.ENABLED),
            this.platformConfig.getBoolean(ATTENDANCE_TRACKING_CONFIG.DOCUMENT_UPLOAD_ENABLED, ATTENDANCE_TRACKING_DEFAULTS.DOCUMENT_UPLOAD_ENABLED),
            this.platformConfig.getBoolean(TICKET_DEMAND_CONFIG.ENABLED, TICKET_DEMAND_DEFAULTS.ENABLED),
        ]);
        return {
            marketplaceEnabled,
            adsEnabled,
            playerAdvancedStatsEnabled,
            attendanceStatsEnabled,
            attendanceAdvancedStatsEnabled,
            ticketLinksEnabled,
            affiliateLinksEnabled,
            matchdayAffiliatesEnabled,
            hospitalityLinksEnabled,
            sponsoredPlacementsEnabled,
            ticketAlertsEnabled,
            affiliateDisclosureEnabled,
            attendanceTrackingEnabled,
            ticketDocumentUploadEnabled,
            ticketDemandEnabled,
        };
    }

    @Get('fees')
    @Public()
    @ApiOperation({ summary: 'Public marketplace fee structure (buyer fee, seller fee)' })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                buyerFeeRate: { type: 'number', description: 'Buyer-side fee as a decimal (e.g. 0.10 = 10%)' },
                sellerFeeRate: { type: 'number', description: 'Seller-side fee as a decimal (e.g. 0.05 = 5%)' },
            },
        },
    })
    async getFees() {
        const [buyerFeeRate, sellerFeeRate] = await Promise.all([
            this.platformConfig.getNumber(MARKETPLACE_FEES_CONFIG.BUYER_FEE_RATE, MARKETPLACE_FEES_DEFAULTS.BUYER_FEE_RATE),
            this.platformConfig.getNumber(MARKETPLACE_FEES_CONFIG.SELLER_FEE_RATE, MARKETPLACE_FEES_DEFAULTS.SELLER_FEE_RATE),
        ]);
        return { buyerFeeRate, sellerFeeRate };
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
