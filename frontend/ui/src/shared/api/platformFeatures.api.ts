import axios from 'axios';

export interface PlatformFeatures {
    marketplaceEnabled: boolean;
    adsEnabled: boolean;
}

export async function getPlatformFeatures(): Promise<PlatformFeatures> {
    const { data } = await axios.get<Partial<PlatformFeatures>>('/platform-config/features');
    return {
        marketplaceEnabled: data.marketplaceEnabled ?? false,
        adsEnabled: data.adsEnabled ?? true,
    };
}
