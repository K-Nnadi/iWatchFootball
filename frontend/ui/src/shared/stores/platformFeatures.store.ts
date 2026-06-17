import { create } from 'zustand';
import { getPlatformFeatures } from '../api/platformFeatures.api';

interface PlatformFeaturesStore {
    marketplaceEnabled: boolean;
    adsEnabled: boolean;
    loaded: boolean;
    initializeFeatures: () => Promise<void>;
}

export const usePlatformFeaturesStore = create<PlatformFeaturesStore>((set) => ({
    marketplaceEnabled: false,
    adsEnabled: false,
    loaded: false,
    initializeFeatures: async () => {
        try {
            const features = await getPlatformFeatures();
            set({
                marketplaceEnabled: features.marketplaceEnabled,
                adsEnabled: features.adsEnabled,
                loaded: true,
            });
        } catch {
            set({ marketplaceEnabled: false, adsEnabled: false, loaded: true });
        }
    },
}));
