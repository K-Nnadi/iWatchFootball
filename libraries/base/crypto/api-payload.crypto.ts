import {
    createCipheriv,
    createDecipheriv,
    createPrivateKey,
    createPublicKey,
    diffieHellman,
    generateKeyPairSync,
    hkdfSync,
    randomBytes,
    randomUUID,
} from 'crypto';

export const API_PAYLOAD_HKDF_INFO = 'iwf-api-payload-v1';
export const ENVELOPE_VERSION = 1;

export type EncryptedPayload = {
    e: typeof ENVELOPE_VERSION;
    iv: string;
    t: string;
    d: string;
};

export function isEncryptedPayload(value: unknown): value is EncryptedPayload {
    if (!value || typeof value !== 'object') return false;
    const obj = value as Record<string, unknown>;
    return (
        obj.e === ENVELOPE_VERSION &&
        typeof obj.iv === 'string' &&
        typeof obj.t === 'string' &&
        typeof obj.d === 'string'
    );
}

export function generateEcdhKeyPair(): { privateKey: Buffer; publicKeySpki: Buffer } {
    const pair = generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding: { type: 'spki', format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });
    return {
        privateKey: pair.privateKey,
        publicKeySpki: pair.publicKey,
    };
}

export function deriveAesKeyFromEcdh(privateKeyPkcs8: Buffer, peerPublicKeySpki: Buffer): Buffer {
    const privateKey = createPrivateKey({ key: privateKeyPkcs8, format: 'der', type: 'pkcs8' });
    const publicKey = createPublicKey({ key: peerPublicKeySpki, format: 'der', type: 'spki' });
    const shared = diffieHellman({ privateKey, publicKey });
    return Buffer.from(hkdfSync('sha256', shared, Buffer.alloc(0), API_PAYLOAD_HKDF_INFO, 32));
}

export function encryptPayload(data: unknown, aesKey: Buffer): EncryptedPayload {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', aesKey, iv);
    const plaintext = Buffer.from(JSON.stringify(data), 'utf8');
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        e: ENVELOPE_VERSION,
        iv: iv.toString('base64'),
        t: tag.toString('base64'),
        d: encrypted.toString('base64'),
    };
}

export function decryptPayload<T = unknown>(envelope: EncryptedPayload, aesKey: Buffer): T {
    const iv = Buffer.from(envelope.iv, 'base64');
    const tag = Buffer.from(envelope.t, 'base64');
    const ciphertext = Buffer.from(envelope.d, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')) as T;
}

export function newSessionId(): string {
    return randomUUID();
}
