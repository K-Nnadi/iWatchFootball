export interface RateLimitBucketConfig {
    limit: number;
    ttlMs: number;
}

export interface RateLimitConfig {
    enabled: boolean;
    default: RateLimitBucketConfig;
    auth: RateLimitBucketConfig;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
    if (value == null || value === '') return fallback;
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function loadRateLimitConfig(): RateLimitConfig {
    return {
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        default: {
            ttlMs: parsePositiveInt(process.env.RATE_LIMIT_TTL_MS, 60_000),
            limit: parsePositiveInt(process.env.RATE_LIMIT_MAX, 100),
        },
        auth: {
            ttlMs: parsePositiveInt(process.env.RATE_LIMIT_AUTH_TTL_MS, 60_000),
            limit: parsePositiveInt(process.env.RATE_LIMIT_AUTH_MAX, 10),
        },
    };
}
