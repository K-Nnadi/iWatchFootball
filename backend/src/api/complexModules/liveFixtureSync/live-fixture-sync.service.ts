import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ApiSportsAdapterService } from '../../adapters/api-sports/api-sports-adapter.service';
import { ApiSportsHttpService } from '../../adapters/api-sports/api-sports-http.service';
import { SportApiAdapterService } from '../../adapters/sportapi/sportapi-adapter.service';
import { SportApiHttpService } from '../../adapters/sportapi/sportapi-http.service';

import { ApiSportsFixtureEventsSyncResult } from '../../adapters/api-sports/api-sports-fixture-events.types';

export type LiveFixtureSyncResult = {
  created: number;
  updated: number;
  skipped: number;
  apiRequests: number;
  liveCount: number;
  errors: string[];
  events: ApiSportsFixtureEventsSyncResult & { eventApiRequests: number };
  sources: string[];
};

@Injectable()
export class LiveFixtureSyncService {
  private readonly logger = new Logger(LiveFixtureSyncService.name);

  constructor(
    private readonly apiSportsAdapter: ApiSportsAdapterService,
    private readonly apiSportsHttp: ApiSportsHttpService,
    private readonly sportApiAdapter: SportApiAdapterService,
    private readonly sportApiHttp: SportApiHttpService,
  ) {}

  async syncLiveFixtures(): Promise<LiveFixtureSyncResult> {
    const apiSportsOn = this.apiSportsHttp.isConfigured();
    const sportApiOn = this.sportApiHttp.isConfigured();
    if (!apiSportsOn && !sportApiOn) {
      throw new ServiceUnavailableException(
        'No live data provider configured. Set API_SPORTS_KEY / FOOTBALLAPISPORTS_API_KEY or RAPIDAPI_SPORTAPI_KEY.',
      );
    }

    this.logger.log(
      `Starting live fixture sync (api-sports=${apiSportsOn}, sportapi=${sportApiOn})`,
    );

    const result: LiveFixtureSyncResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      apiRequests: 0,
      liveCount: 0,
      errors: [],
      events: { goals: 0, cards: 0, substitutions: 0, skipped: 0, eventApiRequests: 0 },
      sources: [],
    };

    if (apiSportsOn) {
      const r = await this.apiSportsAdapter.importLiveFixtures({
        fixtureUpsertConcurrency: 16,
      });
      result.created += r.created;
      result.updated += r.updated;
      result.skipped += r.skipped;
      result.apiRequests += r.apiRequests;
      result.liveCount += r.liveCount;
      result.errors.push(...r.errors);
      result.events = r.events;
      result.sources.push('api-sports');
    }

    if (sportApiOn) {
      const r = await this.sportApiAdapter.importLiveFixtures();
      result.created += r.created;
      result.updated += r.updated;
      result.skipped += r.skipped;
      result.apiRequests += r.apiRequests;
      result.liveCount += r.liveCount;
      result.errors.push(...r.errors);
      result.sources.push('sportapi');
    }

    if (result.errors.length > 0) {
      this.logger.warn(`Live fixture sync completed with ${result.errors.length} error(s)`);
    } else {
      this.logger.log(
        `Live fixture sync complete via ${result.sources.join('+')}: ${result.liveCount} live, +${result.created} created, ~${result.updated} updated`,
      );
    }

    return result;
  }
}
