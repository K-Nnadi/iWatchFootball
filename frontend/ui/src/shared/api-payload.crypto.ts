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

function base64ToBytes(value: string): Uint8Array {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function exportSpki(publicKey: CryptoKey): Promise<string> {
    const spki = await crypto.subtle.exportKey('spki', publicKey);
    return bytesToBase64(new Uint8Array(spki));
}

async function importPeerPublicKey(spkiBase64: string): Promise<CryptoKey> {
    const spki = base64ToBytes(spkiBase64);
    return crypto.subtle.importKey(
        'spki',
        spki,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        [],
    );
}

export async function generateClientEcdhKeyPair(): Promise<CryptoKeyPair> {
    return crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveKey'],
    );
}

export async function deriveAesKey(
    privateKey: CryptoKey,
    serverPublicKeySpki: string,
): Promise<CryptoKey> {
    const peerKey = await importPeerPublicKey(serverPublicKeySpki);
    return crypto.subtle.deriveKey(
        { name: 'ECDH', public: peerKey },
        privateKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );
}

export async function encryptPayload(
    data: unknown,
    aesKey: CryptoKey,
): Promise<EncryptedPayload> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plaintext);

    const combined = new Uint8Array(ciphertext);
    const tagLength = 16;
    const body = combined.slice(0, combined.length - tagLength);
    const tag = combined.slice(combined.length - tagLength);

    return {
        e: ENVELOPE_VERSION,
        iv: bytesToBase64(iv),
        t: bytesToBase64(tag),
        d: bytesToBase64(body),
    };
}

export async function decryptPayload<T = unknown>(
    envelope: EncryptedPayload,
    aesKey: CryptoKey,
): Promise<T> {
    const iv = base64ToBytes(envelope.iv);
    const tag = base64ToBytes(envelope.t);
    const body = base64ToBytes(envelope.d);
    const combined = new Uint8Array(body.length + tag.length);
    combined.set(body);
    combined.set(tag, body.length);

    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, combined);
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

export async function exportClientPublicKey(publicKey: CryptoKey): Promise<string> {
    return exportSpki(publicKey);
}
