import { Injectable, Logger } from '@nestjs/common';
import { HttpWrapper } from '@iWatchFootball/base-tools/http/httpWrapper';
import { API_SPORTS_BASE_URL, API_SPORTS_CONFIG } from './api-sports.config';

/**
 * API-Sports (v3) can be used with a direct subscription (x-apisports-key)
 * or via RapidAPI (x-rapidapi-key + x-rapidapi-host).
 */
@Injectable()
export class ApiSportsHttpService {
  private readonly logger = new Logger(ApiSportsHttpService.name);
  private readonly httpWrapper: HttpWrapper;

  constructor() {
    const directKey = process.env.API_SPORTS_KEY || process.env.APISPORTS_KEY;
    const rapidKey = process.env.FOOTBALLAPISPORTS_API_KEY;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (directKey) {
      headers['x-apisports-key'] = directKey;
    } else if (rapidKey) {
      headers['x-rapidapi-host'] = 'v3.football.api-sports.io';
      headers['x-rapidapi-key'] = rapidKey;
    } else {
      this.logger.warn(
        'No API-Sports key: set API_SPORTS_KEY (direct) or FOOTBALLAPISPORTS_API_KEY (RapidAPI).',
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
    const resp = await this.httpWrapper.request<T>({
      method: 'GET',
      path,
      params: params as any,
    });
    return resp.data;
  }
}
