import { create } from 'zustand';
import { getPlatformFeatures } from '../api/platformFeatures.api';

interface PlatformFeaturesStore {
    marketplaceEnabled: boolean;
    adsEnabled: boolean;
    playerAdvancedStatsEnabled: boolean;
    attendanceStatsEnabled: boolean;
    attendanceAdvancedStatsEnabled: boolean;
    loaded: boolean;
    initializeFeatures: () => Promise<void>;
}

export const usePlatformFeaturesStore = create<PlatformFeaturesStore>((set) => ({
    marketplaceEnabled: false,
    adsEnabled: false,
    playerAdvancedStatsEnabled: true,
    attendanceStatsEnabled: true,
    attendanceAdvancedStatsEnabled: true,
    loaded: false,
    initializeFeatures: async () => {
        try {
            const features = await getPlatformFeatures();
            set({
                marketplaceEnabled: features.marketplaceEnabled,
                adsEnabled: features.adsEnabled,
                playerAdvancedStatsEnabled: features.playerAdvancedStatsEnabled,
                attendanceStatsEnabled: features.attendanceStatsEnabled,
                attendanceAdvancedStatsEnabled: features.attendanceAdvancedStatsEnabled,
                loaded: true,
            });
        } catch {
            set({
                marketplaceEnabled: false,
                adsEnabled: false,
                playerAdvancedStatsEnabled: true,
                attendanceStatsEnabled: true,
                attendanceAdvancedStatsEnabled: true,
                loaded: true,
            });
        }
    },
}));
