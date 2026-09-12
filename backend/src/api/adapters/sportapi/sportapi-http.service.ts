import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpWrapper } from '@iWatchFootball/base-tools/http/httpWrapper';
import { isAxiosError } from 'axios';
import { SPORTAPI_BASE_URL, SPORTAPI_CONFIG, SPORTAPI_HOST } from './sportapi.config';

function resolveRapidApiKey(): string | undefined {
  const raw =
    process.env.RAPIDAPI_SPORTAPI_KEY ||
    process.env.RAPIDAPI_KEY ||
    process.env.RAPIDAPI_SPORT_API_KEY;
  if (raw == null || raw.trim() === '') return undefined;
  return raw.trim();
}

@Injectable()
export class SportApiHttpService {
  private readonly logger = new Logger(SportApiHttpService.name);
  private readonly httpWrapper: HttpWrapper;
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = resolveRapidApiKey();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (this.apiKey) {
      headers['x-rapidapi-host'] = SPORTAPI_HOST;
      headers['x-rapidapi-key'] = this.apiKey;
    }
    this.httpWrapper = new HttpWrapper(
      {
        baseUrl: SPORTAPI_BASE_URL,
        headers,
        responseType: 'json',
      },
      true,
      SPORTAPI_CONFIG.retryAttempts,
    );
    if (!this.apiKey) {
      this.logger.warn(
        'No RapidAPI SportAPI key: set RAPIDAPI_SPORTAPI_KEY (or RAPIDAPI_KEY).',
      );
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private unwrapAxios(raw: unknown): unknown {
    const o = raw as Record<string, unknown> | null;
    const isAxiosLike =
      o != null &&
      typeof o === 'object' &&
      !Array.isArray(o) &&
      'data' in o &&
      typeof o.status === 'number';
    if (isAxiosLike) return o.data;
    return raw;
  }

  async get<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new HttpException(
        'RapidAPI SportAPI is not configured. Set RAPIDAPI_SPORTAPI_KEY.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    try {
      const resp = await this.httpWrapper.request<T>({
        method: 'GET',
        path,
        params: params as Record<string, string | number | boolean>,
      });
      return this.unwrapAxios(resp) as T;
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response) {
        const status = e.response.status;
        const data = e.response.data as Record<string, unknown> | string | undefined;
        const msg =
          (typeof data === 'object' && data != null && (data.message ?? data.error)) ||
          (typeof data === 'string' ? data : JSON.stringify(data)) ||
          e.message;
        this.logger.warn(`SportAPI ${path} failed: ${status} — ${String(msg)}`);
        if (status === 401 || status === 403) {
          throw new HttpException(
            `RapidAPI SportAPI rejected the request (${status}). Check RAPIDAPI_SPORTAPI_KEY and SportAPI subscription.`,
            status,
          );
        }
        if (status === 429) {
          throw new HttpException('RapidAPI SportAPI rate limit exceeded (429).', status);
        }
      }
      throw e;
    }
  }

  async delay(): Promise<void> {
    const ms = SPORTAPI_CONFIG.requestDelayMs;
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }
}
