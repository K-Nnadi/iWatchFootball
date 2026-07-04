import axios from 'axios';

export interface PlatformFeatures {
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

export async function getPlatformFeatures(): Promise<PlatformFeatures> {
    const { data } = await axios.get<Partial<PlatformFeatures>>('/platform-config/features');
    return {
        marketplaceEnabled: data.marketplaceEnabled ?? false,
        adsEnabled: data.adsEnabled ?? true,
        playerAdvancedStatsEnabled: data.playerAdvancedStatsEnabled ?? true,
        attendanceStatsEnabled: data.attendanceStatsEnabled ?? true,
        attendanceAdvancedStatsEnabled: data.attendanceAdvancedStatsEnabled ?? true,
        ticketLinksEnabled: data.ticketLinksEnabled ?? false,
        affiliateLinksEnabled: data.affiliateLinksEnabled ?? false,
        matchdayAffiliatesEnabled: data.matchdayAffiliatesEnabled ?? false,
        hospitalityLinksEnabled: data.hospitalityLinksEnabled ?? false,
        sponsoredPlacementsEnabled: data.sponsoredPlacementsEnabled ?? false,
        ticketAlertsEnabled: data.ticketAlertsEnabled ?? false,
        affiliateDisclosureEnabled: data.affiliateDisclosureEnabled ?? true,
        attendanceTrackingEnabled: data.attendanceTrackingEnabled ?? false,
        ticketDocumentUploadEnabled: data.ticketDocumentUploadEnabled ?? false,
        ticketDemandEnabled: data.ticketDemandEnabled ?? false,
    };
}
