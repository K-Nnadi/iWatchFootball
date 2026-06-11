import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiEncryptionBootstrap } from './api-encryption.bootstrap';
import { ApiEncryptionInterceptor } from './api-encryption.interceptor';
import { SessionCryptoController } from './session-crypto.controller';
import { SessionKeyStore } from './session-key.store';

@Module({
    controllers: [SessionCryptoController],
    providers: [
        SessionKeyStore,
        ApiEncryptionInterceptor,
        ApiEncryptionBootstrap,
        {
            provide: APP_INTERCEPTOR,
            useClass: ApiEncryptionInterceptor,
        },
    ],
    exports: [SessionKeyStore, ApiEncryptionInterceptor],
})
export class ApiEncryptionModule {}
