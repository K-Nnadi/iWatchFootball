import { Throttle } from '@nestjs/throttler';
import { loadRateLimitConfig } from './rate-limit.config';

/** Stricter auth-route limits (login/register). Also enables the named `auth` throttler bucket. */
export const AuthThrottle = () => {
    const { auth } = loadRateLimitConfig();
    return Throttle({
        auth: { limit: auth.limit, ttl: auth.ttlMs },
    });
};
