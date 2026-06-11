import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import type { FastifyReply } from 'fastify';
import {
    generateEcdhKeyPair,
    newSessionId,
} from '@iWatchFootball/base-tools/crypto/api-payload.crypto';
import { Public } from '../../auth/decorators/public.decorator';
import { SessionKeyStore } from './session-key.store';
import { isApiPayloadEncryptionEnabled } from './api-encryption.config';

const SESSION_COOKIE = 'api_sid';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

class EstablishSessionBody {
    @ApiProperty({ description: 'Client ECDH P-256 public key (SPKI, base64)' })
    @IsString()
    @IsNotEmpty()
    clientPublicKey!: string;
}

class EstablishSessionResponse {
    @ApiProperty({ description: 'Server ECDH P-256 public key (SPKI, base64)' })
    serverPublicKey!: string;
}

@Controller('session')
export class SessionCryptoController {
    constructor(private readonly sessionKeys: SessionKeyStore) {}

    @Post('crypto')
    @Public()
    @ApiOperation({ summary: 'Establish per-tab API payload encryption session (ECDH)' })
    @ApiOkResponse({ type: EstablishSessionResponse })
    async establishSession(
        @Body() body: EstablishSessionBody,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<EstablishSessionResponse | { enabled: false }> {
        if (!isApiPayloadEncryptionEnabled()) {
            return { enabled: false };
        }

        const clientPublicKeySpki = Buffer.from(body.clientPublicKey, 'base64');
        const serverKeys = generateEcdhKeyPair();
        const sessionId = newSessionId();

        await this.sessionKeys.saveFromEcdh(sessionId, serverKeys.privateKey, clientPublicKeySpki);

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieParts = [
            `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
            'Path=/',
            'HttpOnly',
            `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
            isProduction ? 'Secure' : '',
            isProduction ? 'SameSite=None' : 'SameSite=Lax',
        ].filter(Boolean);
        void response.header('Set-Cookie', cookieParts.join('; '));

        return {
            serverPublicKey: serverKeys.publicKeySpki.toString('base64'),
        };
    }
}
