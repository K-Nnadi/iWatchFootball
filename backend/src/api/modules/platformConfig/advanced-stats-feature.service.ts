import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PlatformConfigService } from './platformConfig.service';
import {
    ATTENDANCE_STATS_CONFIG,
    ATTENDANCE_STATS_DEFAULTS,
    PLAYER_ADVANCED_STATS_CONFIG,
    PLAYER_ADVANCED_STATS_DEFAULTS,
} from './platform-features.constants';

@Injectable()
export class AdvancedStatsFeatureService {
    constructor(private readonly platformConfig: PlatformConfigService) {}

    async isPlayerAdvancedStatsEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            PLAYER_ADVANCED_STATS_CONFIG.ENABLED,
            PLAYER_ADVANCED_STATS_DEFAULTS.ENABLED,
        );
    }

    async isAttendanceStatsEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            ATTENDANCE_STATS_CONFIG.ENABLED,
            ATTENDANCE_STATS_DEFAULTS.ENABLED,
        );
    }

    async isAttendanceAdvancedStatsEnabled(): Promise<boolean> {
        return this.platformConfig.getBoolean(
            ATTENDANCE_STATS_CONFIG.ADVANCED_ENABLED,
            ATTENDANCE_STATS_DEFAULTS.ADVANCED_ENABLED,
        );
    }

    async assertPlayerAdvancedStatsEnabled(): Promise<void> {
        if (!(await this.isPlayerAdvancedStatsEnabled())) {
            throw new ServiceUnavailableException('Player advanced stats are not enabled');
        }
    }

    async assertAttendanceStatsEnabled(): Promise<void> {
        if (!(await this.isAttendanceStatsEnabled())) {
            throw new ServiceUnavailableException('Attendance stats are not enabled');
        }
    }

    async assertAttendanceAdvancedStatsEnabled(): Promise<void> {
        if (!(await this.isAttendanceAdvancedStatsEnabled())) {
            throw new ServiceUnavailableException('Advanced attendance stats are not enabled');
        }
    }
}
