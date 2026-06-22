/** Platform config keys exposed as public client feature flags. */
export const ADS_CONFIG = {
    ENABLED: 'ads_enabled',
} as const;

export const ADS_DEFAULTS = {
    ENABLED: true,
} as const;

export const PLAYER_ADVANCED_STATS_CONFIG = {
    ENABLED: 'player_advanced_stats_enabled',
} as const;

export const PLAYER_ADVANCED_STATS_DEFAULTS = {
    ENABLED: true,
} as const;

export const ATTENDANCE_STATS_CONFIG = {
    ENABLED: 'attendance_stats_enabled',
    ADVANCED_ENABLED: 'attendance_advanced_stats_enabled',
} as const;

export const ATTENDANCE_STATS_DEFAULTS = {
    ENABLED: true,
    ADVANCED_ENABLED: true,
} as const;
