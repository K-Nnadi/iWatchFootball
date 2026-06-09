import axios from 'axios';

export interface PlatformFeatures {
    marketplaceEnabled: boolean;
}

export async function getPlatformFeatures(): Promise<PlatformFeatures> {
    const { data } = await axios.get<PlatformFeatures>('/platform-config/features');
    return data;
}
