import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../../shared/redis/redis.constants';
import { AppThrottlerGuard } from './app-throttler.guard';
import { loadRateLimitConfig } from './rate-limit.config';
import { RedisThrottlerStorage } from './redis-throttler.storage';

const AUTH_LIMIT_KEY = 'THROTTLER:LIMITauth';

@Global()
@Module({
    imports: [
        ThrottlerModule.forRootAsync({
            inject: [Reflector, REDIS_CLIENT],
            useFactory: (reflector: Reflector, redis: Redis | null) => {
                const config = loadRateLimitConfig();
                return {
                    storage: redis ? new RedisThrottlerStorage(redis) : undefined,
                    skipIf: () => !config.enabled,
                    errorMessage: 'Too many requests. Please try again later.',
                    throttlers: [
                        {
                            name: 'default',
                            ttl: config.default.ttlMs,
                            limit: config.default.limit,
                        },
                        {
                            name: 'auth',
                            ttl: config.auth.ttlMs,
                            limit: config.auth.limit,
                            skipIf: (context) => {
                                const limit = reflector.getAllAndOverride<number | undefined>(
                                    AUTH_LIMIT_KEY,
                                    [context.getHandler(), context.getClass()],
                                );
                                return limit == null;
                            },
                        },
                    ],
                };
            },
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AppThrottlerGuard,
        },
    ],
})
export class RateLimitModule {}
