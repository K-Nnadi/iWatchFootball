import { create } from 'zustand';
import { getPlatformFeatures } from '../api/platformFeatures.api';

interface PlatformFeaturesStore {
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
    loaded: boolean;
    initializeFeatures: () => Promise<void>;
}

const DEFAULTS = {
    marketplaceEnabled: false,
    adsEnabled: false,
    playerAdvancedStatsEnabled: true,
    attendanceStatsEnabled: true,
    attendanceAdvancedStatsEnabled: true,
    ticketLinksEnabled: false,
    affiliateLinksEnabled: false,
    matchdayAffiliatesEnabled: false,
    hospitalityLinksEnabled: false,
    sponsoredPlacementsEnabled: false,
    ticketAlertsEnabled: false,
    affiliateDisclosureEnabled: true,
    attendanceTrackingEnabled: false,
    ticketDocumentUploadEnabled: false,
    ticketDemandEnabled: false,
};

export const usePlatformFeaturesStore = create<PlatformFeaturesStore>((set) => ({
    ...DEFAULTS,
    loaded: false,
    initializeFeatures: async () => {
        try {
            const features = await getPlatformFeatures();
            set({ ...features, loaded: true });
        } catch {
            set({ ...DEFAULTS, loaded: true });
        }
    },
}));
