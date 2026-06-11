import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { registerApiEncryptionHooks } from './api-encryption.hook';
import { isApiPayloadEncryptionEnabled } from './api-encryption.config';
import { SessionKeyStore } from './session-key.store';

@Injectable()
export class ApiEncryptionBootstrap implements OnApplicationBootstrap {
    constructor(
        private readonly adapterHost: HttpAdapterHost,
        private readonly sessionKeys: SessionKeyStore,
    ) {}

    onApplicationBootstrap(): void {
        if (!isApiPayloadEncryptionEnabled()) {
            return;
        }

        const fastify = this.adapterHost.httpAdapter.getInstance();
        registerApiEncryptionHooks(fastify, this.sessionKeys);
        console.log('✅ API payload encryption request hooks registered');
    }
}
