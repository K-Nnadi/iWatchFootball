import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_ENABLED, REDIS_SUBSCRIBER } from './redis.constants';
import { buildRedisOptions, isRedisEnabled } from './redis.config';

@Injectable()
class RedisShutdownHook implements OnApplicationShutdown {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
        @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis | null,
    ) {}

    async onApplicationShutdown(): Promise<void> {
        await Promise.all(
            [this.redis, this.subscriber]
                .filter((c): c is Redis => c != null)
                .map((c) => c.quit().catch(() => c.disconnect())),
        );
    }
}

@Global()
@Module({
    providers: [
        {
            provide: REDIS_ENABLED,
            useValue: isRedisEnabled(),
        },
        {
            provide: REDIS_CLIENT,
            useFactory: (): Redis | null => {
                if (!isRedisEnabled()) return null;
                return new Redis(buildRedisOptions());
            },
        },
        {
            provide: REDIS_SUBSCRIBER,
            useFactory: (): Redis | null => {
                if (!isRedisEnabled()) return null;
                return new Redis(buildRedisOptions());
            },
        },
        RedisShutdownHook,
    ],
    exports: [REDIS_CLIENT, REDIS_SUBSCRIBER, REDIS_ENABLED],
})
export class RedisModule {}
