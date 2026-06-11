import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
    decryptPayload,
    isEncryptedPayload,
} from '@iWatchFootball/base-tools/crypto/api-payload.crypto';
import { SessionKeyStore } from './session-key.store';
import { isApiPayloadEncryptionEnabled, shouldSkipEncryption } from './api-encryption.config';

const SESSION_COOKIE = 'api_sid';

function readSessionId(request: FastifyRequest): string | undefined {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) return undefined;
    const match = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
    if (!match) return undefined;
    return decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
}

export function registerApiEncryptionHooks(
    fastify: FastifyInstance,
    sessionKeys: SessionKeyStore,
): void {
    fastify.addHook('preHandler', async (request, _reply) => {
        if (!isApiPayloadEncryptionEnabled()) return;
        if (shouldSkipEncryption(request.url ?? '')) return;

        const body = request.body;
        if (!isEncryptedPayload(body)) return;

        const sessionId = readSessionId(request);
        if (!sessionId) return;

        const aesKey = await sessionKeys.get(sessionId);
        if (!aesKey) return;

        request.body = decryptPayload(body, aesKey);
    });
}
