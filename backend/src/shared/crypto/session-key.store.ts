import { Inject, Injectable, Optional } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { deriveAesKeyFromEcdh } from '@iWatchFootball/base-tools/crypto/api-payload.crypto';

const SESSION_TTL_SECONDS = 60 * 60 * 24;
const REDIS_PREFIX = 'api-crypto:';

type MemoryEntry = { key: Buffer; expiresAt: number };

@Injectable()
export class SessionKeyStore {
    private readonly memory = new Map<string, MemoryEntry>();

    constructor(@Optional() @Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

    async saveFromEcdh(
        sessionId: string,
        serverPrivateKey: Buffer,
        clientPublicKeySpki: Buffer,
    ): Promise<Buffer> {
        const aesKey = deriveAesKeyFromEcdh(serverPrivateKey, clientPublicKeySpki);
        await this.set(sessionId, aesKey);
        return aesKey;
    }

    async get(sessionId: string): Promise<Buffer | null> {
        if (this.redis) {
            const raw = await this.redis.get(`${REDIS_PREFIX}${sessionId}`);
            return raw ? Buffer.from(raw, 'base64') : null;
        }

        const entry = this.memory.get(sessionId);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.memory.delete(sessionId);
            return null;
        }
        return entry.key;
    }

    private async set(sessionId: string, aesKey: Buffer): Promise<void> {
        if (this.redis) {
            await this.redis.set(
                `${REDIS_PREFIX}${sessionId}`,
                aesKey.toString('base64'),
                'EX',
                SESSION_TTL_SECONDS,
            );
            return;
        }

        this.memory.set(sessionId, {
            key: aesKey,
            expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
        });
    }
}
