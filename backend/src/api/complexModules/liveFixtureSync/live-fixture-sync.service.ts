import { Injectable, Logger } from '@nestjs/common';
import { ApiSportsAdapterService } from '../../adapters/api-sports/api-sports-adapter.service';

export type LiveFixtureSyncResult = {
  created: number;
  updated: number;
  skipped: number;
  apiRequests: number;
  liveCount: number;
  errors: string[];
};

@Injectable()
export class LiveFixtureSyncService {
  private readonly logger = new Logger(LiveFixtureSyncService.name);

  constructor(private readonly apiSportsAdapter: ApiSportsAdapterService) {}

  async syncLiveFixtures(): Promise<LiveFixtureSyncResult> {
    this.logger.log('Starting live fixture sync');
    const result = await this.apiSportsAdapter.importLiveFixtures({
      fixtureUpsertConcurrency: 16,
    });

    if (result.errors.length > 0) {
      this.logger.warn(`Live fixture sync completed with ${result.errors.length} error(s)`);
    } else {
      this.logger.log(
        `Live fixture sync complete: ${result.liveCount} live, +${result.created} created, ~${result.updated} updated`,
      );
    }

    return result;
  }
}
