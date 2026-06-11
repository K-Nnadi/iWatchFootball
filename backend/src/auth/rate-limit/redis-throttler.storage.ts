import { Inject, Injectable } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
interface ThrottlerStorageRecord {
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
    timeToBlockExpire: number;
}
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../../shared/redis/redis.constants';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

    async increment(
        key: string,
        ttl: number,
        limit: number,
        blockDuration: number,
        throttlerName: string,
    ): Promise<ThrottlerStorageRecord> {
        const hitsKey = `throttle:${throttlerName}:${key}`;
        const blockKey = `throttle:block:${throttlerName}:${key}`;

        const blockPttl = await this.redis.pttl(blockKey);
        if (blockPttl > 0) {
            const hitsRaw = await this.redis.get(hitsKey);
            return {
                totalHits: parseInt(hitsRaw ?? '0', 10) || 0,
                timeToExpire: Math.ceil(blockPttl / 1000),
                isBlocked: true,
                timeToBlockExpire: Math.ceil(blockPttl / 1000),
            };
        }

        const totalHits = await this.redis.incr(hitsKey);
        let windowPttl = await this.redis.pttl(hitsKey);
        if (windowPttl < 0) {
            await this.redis.pexpire(hitsKey, ttl);
            windowPttl = ttl;
        }

        if (totalHits > limit) {
            await this.redis.set(blockKey, '1', 'PX', blockDuration);
            return {
                totalHits,
                timeToExpire: Math.ceil(windowPttl / 1000),
                isBlocked: true,
                timeToBlockExpire: Math.ceil(blockDuration / 1000),
            };
        }

        return {
            totalHits,
            timeToExpire: Math.ceil(windowPttl / 1000),
            isBlocked: false,
            timeToBlockExpire: 0,
        };
    }
}
