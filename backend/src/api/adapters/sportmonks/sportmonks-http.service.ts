import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpWrapper } from '@iWatchFootball/base-tools/http/httpWrapper';
import { isAxiosError } from 'axios';
import { SPORTMONKS_BASE_URL, SPORTMONKS_CONFIG } from './sportmonks.config';
import {
  extractSportMonksList,
  type SportMonksListResponse,
  type SportMonksPagination,
} from './sportmonks-response.util';

function resolveApiToken(): string | undefined {
  const raw = process.env.SPORTMONKS_API_TOKEN || process.env.SPORTMONKS_TOKEN;
  if (raw == null || raw.trim() === '') return undefined;
  return raw.trim();
}

@Injectable()
export class SportMonksHttpService {
  private readonly logger = new Logger(SportMonksHttpService.name);
  private readonly httpWrapper: HttpWrapper;
  private readonly apiToken: string | undefined;

  constructor() {
    this.apiToken = resolveApiToken();
    this.httpWrapper = new HttpWrapper(
      {
        baseUrl: SPORTMONKS_BASE_URL,
        headers: { Accept: 'application/json' },
        responseType: 'json',
      },
      true,
      SPORTMONKS_CONFIG.retryAttempts,
    );
    if (!this.apiToken) {
      this.logger.warn('No SportMonks API token: set SPORTMONKS_API_TOKEN.');
    }
  }

  isConfigured(): boolean {
    return !!this.apiToken;
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
    if (!this.apiToken) {
      throw new HttpException(
        'SportMonks is not configured. Set SPORTMONKS_API_TOKEN.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const query = { ...(params ?? {}), api_token: this.apiToken };
    try {
      const resp = await this.httpWrapper.request<T>({
        method: 'GET',
        path,
        params: query as Record<string, string | number | boolean>,
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
        this.logger.warn(`SportMonks ${path} failed: ${status} — ${String(msg)}`);
        if (status === 401 || status === 403) {
          throw new HttpException(
            `SportMonks rejected the request (${status}). Check SPORTMONKS_API_TOKEN and plan scope.`,
            status,
          );
        }
        if (status === 429) {
          throw new HttpException('SportMonks rate limit exceeded (429).', status);
        }
      }
      throw e;
    }
  }

  async delay(): Promise<void> {
    const ms = SPORTMONKS_CONFIG.requestDelayMs;
    if (ms > 0) await new Promise((r) => setTimeout(r, ms));
  }

  /**
   * Fetch all pages for a list endpoint. Stops when `has_more` is false or limits hit.
   */
  async getAllPages<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    opts?: { maxPages?: number; maxRequests?: number },
  ): Promise<{ items: T[]; apiRequests: number }> {
    const maxPages = opts?.maxPages ?? 50;
    const maxRequests = opts?.maxRequests ?? maxPages;
    const perPage = Number(params?.per_page ?? SPORTMONKS_CONFIG.defaultPerPage);
    const items: T[] = [];
    let page = 1;
    let apiRequests = 0;
    let hasMore = true;

    while (hasMore && page <= maxPages && apiRequests < maxRequests) {
      const body = await this.get<SportMonksListResponse<T>>(path, {
        ...params,
        page,
        per_page: perPage,
      });
      apiRequests += 1;
      const chunk = extractSportMonksList<T>(body);
      items.push(...chunk);
      const pagination: SportMonksPagination | undefined = body?.pagination;
      hasMore = pagination?.has_more === true;
      page += 1;
      if (hasMore) await this.delay();
    }

    return { items, apiRequests };
  }
}
