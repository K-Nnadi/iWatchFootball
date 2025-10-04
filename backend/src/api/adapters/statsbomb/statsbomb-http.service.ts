import { Injectable, Logger } from '@nestjs/common';
import { HttpWrapper } from '@iWatchFootball/base-tools/http/httpWrapper';
import { STATSBOMB_CONFIG } from './statsbomb.config';

@Injectable()
export class StatsBombHttpService {
  private readonly logger = new Logger(StatsBombHttpService.name);
  private readonly httpWrapper: HttpWrapper;

  constructor() {
    this.httpWrapper = new HttpWrapper(
      {
        baseUrl: STATSBOMB_CONFIG.baseUrl,
        headers: {
          'User-Agent': 'StatsBomb-Adapter/1.0',
          'Accept': 'application/json',
        },
        responseType: 'json'
      },
      true, // throwOnError
      STATSBOMB_CONFIG.retryAttempts // numRetries
    );
  }

  /**
   * Make HTTP request using HttpWrapper
   */
  async request<T>(path: string): Promise<T> {
    try {
      const response = await this.httpWrapper.request<T>({
        method: 'GET',
        path: path
      });
      return response.data;
    } catch (error) {
      this.logger.error(`HTTP request failed for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Fetch competitions data
   */
  async fetchCompetitions(): Promise<any[]> {
    return this.request<any[]>('/competitions.json');
  }

  /**
   * Fetch matches for a specific competition and season
   */
  async fetchMatches(competitionId: number, seasonId: number): Promise<any[]> {
    return this.request<any[]>(`/matches/${competitionId}/${seasonId}.json`);
  }

  /**
   * Fetch lineup for a specific match
   */
  async fetchLineup(matchId: number): Promise<any[]> {
    return this.request<any[]>(`/lineups/${matchId}.json`);
  }

  /**
   * Fetch events for a specific match
   */
  async fetchEvents(matchId: number): Promise<any[]> {
    return this.request<any[]>(`/events/${matchId}.json`);
  }

  /**
   * Get available competitions (for debugging/info)
   */
  async getAvailableCompetitions(): Promise<any[]> {
    try {
      const competitions = await this.fetchCompetitions();
      return competitions.map(comp => ({
        id: comp.competition_id,
        name: comp.competition_name,
        country: comp.country_name,
        season: comp.season_name,
        matchesAvailable: comp.match_available,
        matchesUpdated: comp.match_updated,
      }));
    } catch (error) {
      this.logger.error('Error fetching available competitions:', error);
      return [];
    }
  }
}
