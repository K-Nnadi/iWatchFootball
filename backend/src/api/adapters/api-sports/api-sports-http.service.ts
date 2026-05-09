import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpWrapper } from '@iWatchFootball/base-tools/http/httpWrapper';
import { isAxiosError } from 'axios';
import { API_SPORTS_BASE_URL, API_SPORTS_CONFIG } from './api-sports.config';

/** Treat as "not set" so we fall back to FOOTBALLAPISPORTS_API_KEY (RapidAPI). */
const PLACEHOLDER_API_KEYS = new Set(
  ['', '123', 'change_me', 'changeme', 'replace', 'your_key', 'api_key', 'xxx', 'test', 'placeholder'].map(
    (s) => s.toLowerCase(),
  ),
);

function resolveDirectKey(): string | undefined {
  const raw = process.env.API_SPORTS_KEY || process.env.APISPORTS_KEY;
  if (raw == null || raw === '') return undefined;
  const t = raw.trim();
  if (PLACEHOLDER_API_KEYS.has(t.toLowerCase())) return undefined;
  return t;
}

/**
 * API-Sports (v3) can be used with a direct subscription (x-apisports-key)
 * or via RapidAPI (x-rapidapi-key + x-rapidapi-host).
 */
@Injectable()
export class ApiSportsHttpService {
  private readonly logger = new Logger(ApiSportsHttpService.name);
  private readonly httpWrapper: HttpWrapper;
  private readonly authMode: 'direct' | 'rapidapi' | 'none';

  constructor() {
    const directKey = resolveDirectKey();
    const rapidKey =
      process.env.FOOTBALLAPISPORTS_API_KEY || process.env.RAPIDAPI_FOOTBALL_KEY;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (directKey) {
      headers['x-apisports-key'] = directKey;
      this.authMode = 'direct';
    } else if (rapidKey) {
      headers['x-rapidapi-host'] = 'v3.football.api-sports.io';
      headers['x-rapidapi-key'] = rapidKey;
      this.authMode = 'rapidapi';
    } else {
      this.authMode = 'none';
      this.logger.warn(
        'No API-Sports key: set API_SPORTS_KEY (direct) or FOOTBALLAPISPORTS_API_KEY (RapidAPI). ' +
          'If you use a placeholder like 123, it is ignored so RapidAPI can be used instead.',
      );
    }

    this.httpWrapper = new HttpWrapper(
      {
        baseUrl: API_SPORTS_BASE_URL,
        headers,
        responseType: 'json',
      },
      true,
      API_SPORTS_CONFIG.retryAttempts,
    );
  }

  async get<T = any>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    if (this.authMode === 'none') {
      throw new HttpException(
        'API-Sports is not configured. Set API_SPORTS_KEY (api-sports.io) or FOOTBALLAPISPORTS_API_KEY (RapidAPI).',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    try {
      const resp = await this.httpWrapper.request<T>({
        method: 'GET',
        path,
        params: params as any,
      });
      return resp.data;
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response) {
        const status = e.response.status;
        const data = e.response.data as any;
        const msg =
          data?.message ||
          data?.errors ||
          (typeof data === 'string' ? data : JSON.stringify(data)) ||
          e.message;
        this.logger.warn(
          `API-Sports ${path} failed: ${status} — ${typeof msg === 'string' ? msg : JSON.stringify(msg)} (auth: ${this.authMode})`,
        );
        if (status === 401 || status === 403) {
          throw new HttpException(
            `API-Sports rejected the request (${status}). ` +
              (this.authMode === 'direct'
                ? 'Check API_SPORTS_KEY on https://dashboard.api-sports.io (direct subscription).'
                : 'Check FOOTBALLAPISPORTS_API_KEY (RapidAPI). If you also set API_SPORTS_KEY, use a real key or remove it (placeholders like 123 are ignored).') +
              ` Details: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`,
            status,
          );
        }
      }
      throw e;
    }
  }
}
