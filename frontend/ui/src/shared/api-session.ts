import axios from 'axios';
import {
    deriveAesKey,
    exportClientPublicKey,
    generateClientEcdhKeyPair,
} from './api-payload.crypto';

let sessionAesKey: CryptoKey | null = null;
let sessionReady: Promise<void> | null = null;

export function isApiPayloadEncryptionEnabled(): boolean {
    return import.meta.env.VITE_API_PAYLOAD_ENCRYPTION === 'true';
}

export function getSessionAesKey(): CryptoKey | null {
    return sessionAesKey;
}

export function ensureApiSession(): Promise<void> {
    if (!isApiPayloadEncryptionEnabled()) {
        return Promise.resolve();
    }
    if (sessionAesKey) {
        return Promise.resolve();
    }
    if (!sessionReady) {
        sessionReady = bootstrapSession().finally(() => {
            sessionReady = null;
        });
    }
    return sessionReady;
}

async function bootstrapSession(): Promise<void> {
    try {
        const keyPair = await generateClientEcdhKeyPair();
        const clientPublicKey = await exportClientPublicKey(keyPair.publicKey);
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        const response = await axios.post<{ serverPublicKey?: string; enabled?: false }>(
            '/session/crypto',
            { clientPublicKey },
            { baseURL, withCredentials: true },
        );

        if (!response.data.serverPublicKey) {
            return;
        }

        sessionAesKey = await deriveAesKey(keyPair.privateKey, response.data.serverPublicKey);
    } catch (error) {
        console.warn('API encryption session could not be established; continuing without encrypted payloads.', error);
    }
}
