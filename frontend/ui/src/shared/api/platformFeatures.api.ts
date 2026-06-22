import axios from 'axios';

export interface PlatformFeatures {
    marketplaceEnabled: boolean;
    adsEnabled: boolean;
    playerAdvancedStatsEnabled: boolean;
    attendanceStatsEnabled: boolean;
    attendanceAdvancedStatsEnabled: boolean;
}

export async function getPlatformFeatures(): Promise<PlatformFeatures> {
    const { data } = await axios.get<Partial<PlatformFeatures>>('/platform-config/features');
    return {
        marketplaceEnabled: data.marketplaceEnabled ?? false,
        adsEnabled: data.adsEnabled ?? true,
        playerAdvancedStatsEnabled: data.playerAdvancedStatsEnabled ?? true,
        attendanceStatsEnabled: data.attendanceStatsEnabled ?? true,
        attendanceAdvancedStatsEnabled: data.attendanceAdvancedStatsEnabled ?? true,
    };
}
