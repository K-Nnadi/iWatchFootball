import type { RedisOptions } from 'ioredis';

export function isRedisEnabled(): boolean {
    return !!process.env.REDIS_HOST?.trim();
}

export function buildRedisOptions(): RedisOptions {
    return {
        host: process.env.REDIS_HOST!.trim(),
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
    };
}

/** BullMQ shares the same connection settings as the shared Redis client. */
export function buildBullConnection(): RedisOptions {
    return buildRedisOptions();
}
