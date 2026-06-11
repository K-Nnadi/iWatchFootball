const SKIP_PREFIXES = [
    '/health',
    '/webhooks/',
    '/api-docs',
    '/session/crypto',
];

export function isApiPayloadEncryptionEnabled(): boolean {
    return process.env.API_PAYLOAD_ENCRYPTION === 'true';
}

export function shouldSkipEncryption(url: string): boolean {
    const path = url.split('?')[0] ?? url;
    return SKIP_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}
