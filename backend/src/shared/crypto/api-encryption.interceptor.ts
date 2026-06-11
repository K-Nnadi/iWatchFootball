import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';
import type { FastifyRequest } from 'fastify';
import {
    encryptPayload,
    isEncryptedPayload,
} from '@iWatchFootball/base-tools/crypto/api-payload.crypto';
import { SessionKeyStore } from './session-key.store';
import { isApiPayloadEncryptionEnabled, shouldSkipEncryption } from './api-encryption.config';

const SESSION_COOKIE = 'api_sid';

@Injectable()
export class ApiEncryptionInterceptor implements NestInterceptor {
    constructor(private readonly sessionKeys: SessionKeyStore) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (!isApiPayloadEncryptionEnabled()) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest<FastifyRequest>();
        if (shouldSkipEncryption(request.url ?? '')) {
            return next.handle();
        }

        const sessionId = this.readSessionId(request);
        if (!sessionId) {
            return next.handle();
        }

        return next.handle().pipe(
            switchMap((data) =>
                from(
                    (async () => {
                        if (data == null || isEncryptedPayload(data)) {
                            return data;
                        }

                        const aesKey = await this.sessionKeys.get(sessionId);
                        if (!aesKey) {
                            return data;
                        }

                        return encryptPayload(data, aesKey);
                    })(),
                ),
            ),
        );
    }

    private readSessionId(request: FastifyRequest): string | undefined {
        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) return undefined;
        const match = cookieHeader
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
        if (!match) return undefined;
        return decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
    }
}
