import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import {
    decryptPayload,
    encryptPayload,
    isEncryptedPayload,
} from './api-payload.crypto';
import { ensureApiSession, getSessionAesKey, isApiPayloadEncryptionEnabled } from './api-session';

const SKIP_ENCRYPTION_PREFIXES = ['/health', '/webhooks/', '/api-docs', '/session/crypto'];

function shouldSkipEncryption(url: string | undefined): boolean {
    if (!url) return true;
    const path = url.split('?')[0] ?? url;
    return SKIP_ENCRYPTION_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(prefix),
    );
}

async function maybeEncryptRequestBody(config: InternalAxiosRequestConfig): Promise<void> {
    if (!isApiPayloadEncryptionEnabled()) return;
    if (shouldSkipEncryption(config.url)) return;
    if (config.data == null || isEncryptedPayload(config.data)) return;

    const method = (config.method ?? 'get').toLowerCase();
    if (!['post', 'put', 'patch'].includes(method)) return;

    await ensureApiSession();
    const aesKey = getSessionAesKey();
    if (!aesKey) return;

    config.data = await encryptPayload(config.data, aesKey);
}

async function maybeDecryptResponse(response: AxiosResponse): Promise<AxiosResponse> {
    if (!isApiPayloadEncryptionEnabled()) return response;
    if (shouldSkipEncryption(response.config.url)) return response;
    if (!isEncryptedPayload(response.data)) return response;

    await ensureApiSession();
    const aesKey = getSessionAesKey();
    if (!aesKey) return response;

    response.data = await decryptPayload(response.data, aesKey);
    return response;
}

/**
 * Configure API base URL and auth interceptors.
 * Call once at startup **before** `createRoot(...).render(...)` (see `index.tsx`) so the first
 * React Query requests use `axios.defaults.baseURL`. If this runs only in `useEffect`, early
 * requests resolve relative URLs against the Vite dev server (e.g. `localhost:5173`).
 */
export function configureApiClient() {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  axios.defaults.baseURL = baseURL;
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (isApiPayloadEncryptionEnabled()) {
        await ensureApiSession();
      }

      await maybeEncryptRequestBody(config);
      return config;
    },
    (error) => Promise.reject(error),
  );

  axios.interceptors.response.use(
    async (response) => maybeDecryptResponse(response),
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      return Promise.reject(error);
    },
  );
}
