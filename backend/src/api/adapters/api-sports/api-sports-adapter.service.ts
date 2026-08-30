import { Injectable, Logger } from '@nestjs/common';
import { ApiSportsHttpService } from './api-sports-http.service';
import { API_SPORTS_CONFIG } from './api-sports.config';
import { CompetitionStandingService } from '../../modules/competitionStanding/competitionStanding.module';
import { CompetitionService } from '../../modules/competition/competition.module';
import { SeasonService } from '../../modules/season/season.module';
import { TeamService } from '../../modules/team/team.module';
import { PlayerService } from '../../modules/player/player.module';
import { TransferService } from '../../modules/transfer/transfer.module';
import { CreateCompetitionStandingDTO } from '../../modules/competitionStanding/competitionStanding.entity';
import { CompetitionType } from '../../enums/competition.enum';
import { TeamType } from '../../enums/team.enum';
import { TeamCompetitionSeasonService } from '../../modules/teamCompetitionSeason/teamCompetitionSeason.module';
import { FixtureService } from '../../modules/fixture/fixture.module';
import { StadiumService } from '../../modules/stadium/stadium.module';
import { TeamStadiumService } from '../../modules/teamStadium/teamStadium.module';
import {
  deepMergeEntityMetadata,
  ENTITY_METADATA_PROVIDER,
} from '@iWatchFootball/base-tools/entity/entityMetadata';
import { FixtureStatus, FixtureStage } from '../../enums/fixture.enum';
import { extractApiSportsFixtureResult } from '../../../shared/fixture-result.util';
import { PlayerTeamStintService } from '../../modules/playerTeamStint/playerTeamStint.service';
import { PlayerTeamStintSource } from '../../enums/playerTeamStint.enum';
import { FixtureTeamStatService } from '../../modules/fixtureTeamStat/fixtureTeamStat.service';
import { FixtureTeamStatSide } from '../../modules/fixtureTeamStat/fixtureTeamStat.entity';
import type { ApiSportsFixtureStatisticsTeam } from './api-sports-fixture-statistics.types';
import type {
  ApiSportsFixtureEvent,
  ApiSportsFixtureEventsSyncResult,
} from './api-sports-fixture-events.types';
import { GoalService } from '../../modules/goal/goal.module';
import { CardService } from '../../modules/card/card.module';
import { SubstitutionService } from '../../modules/substitution/substitution.module';
import { CardType } from '../../enums/card.enum';

const PROVIDER_KEY = ENTITY_METADATA_PROVIDER.APISPORTS;

/** Max |Δkickoff| when matching API-Sports to an existing DB row from another provider */
const FIXTURE_CORRELATION_MAX_MS = 6 * 60 * 60 * 1000;

export type ApiSportsStandingsItem = {
  /** API-Sports league id (e.g. 39 = PL) */
  league: number;
  /** API “season” year (e.g. 2023 for 2023/24) */
  season: number;
  /** Our `competition.id` */
  competitionId: number;
  /** Our `season.id` */
  seasonId: number;
};

/** Options for `importLeaguesFromApiPayload` extended sync (teams + standings via one `/standings` per league). */
export type ImportLeaguesOptions = {
  /**
   * Season year for `/standings?season=` (e.g. 2023).
   * With pasted `/leagues` JSON, each item’s `seasons[]` is still matched by `year`; this overrides when set.
   */
  standingsSeasonYear?: number;
  /** When true (default), after import fetch `/standings` per eligible league (teams + `competitionStanding` in one call). */
  syncTeamsAndStandings?: boolean;
  /** Skip leagues where `seasons[].coverage.standings` is false (default true — saves requests). */
  onlyStandingsCoverage?: boolean;
  /** Skip cups; only sync `CompetitionType.LEAGUE` (default true). */
  onlyLeagueType?: boolean;
  /** Max extra `/standings` calls in this run (default 20). */
  maxStandingsRequests?: number;
};

export type ImportPlayersFromLeagueSeasonOptions = {
  league: number;
  season: number;
  /**
   * When true (default), if multiple local players share the same name with placeholder DOB,
   * we skip instead of creating new rows (prevents dupes and wrong links).
   */
  skipOnAmbiguousName?: boolean;
  /** Max pages to fetch from `/players` (default 2). */
  maxPages?: number;
  /** Hard cap on requests (default 10). */
  maxRequests?: number;
};

export type ImportFixturesFromLeagueWindowOptions = {
  leagueApiId: number;
  seasonYear: number;
  from: string;
  to: string;
  /** Default true — follow `paging` until done or limits hit. */
  allPages?: boolean;
  maxPages?: number;
  /** Cap total `/fixtures` HTTP calls for this import. */
  maxRequests?: number;
  /**
   * When true, after fixture upserts, one `GET /standings` for this league+season and upsert `competitionStanding`
   * (same as `POST …/sync/standings` with one item). Costs +1 API request.
   */
  syncStandingsAfter?: boolean;
  /** When true, recompute league table rows from locally stored fixtures that have numeric scores (+0 API requests). Can run alongside `syncStandingsAfter`; both writers may touch the same `competitionStanding` rows concurrently. */
  recomputeStandingsFromFixturesAfter?: boolean;
  /** Max concurrent fixture upserts against the DB (default 16). */
  fixtureUpsertConcurrency?: number;
  /**
   * When true, after fixture upserts, one or more `GET /teams?league=&season=&page=` calls to link each club’s
   * registered **`venue`** to `teamStadium` as **primary home** (metadata `relationship: primary_home`).
   * Does **not** use match venue (avoids neutral / cup-final grounds). Costs extra API quota.
   */
  syncPrimaryVenuesAfter?: boolean;
  /** Cap `/teams` pages when `syncPrimaryVenuesAfter` (default 5). */
  primaryVenuesMaxPages?: number;
  /** Hard cap on `/teams` requests when `syncPrimaryVenuesAfter` (default 8). */
  primaryVenuesMaxRequests?: number;
  /**
   * When true, after fixture upserts, call `GET /fixtures/statistics?fixture={id}` for each imported fixture
   * and upsert `fixtureTeamStat`. One request per fixture — use `syncStatsMaxRequests` to limit quota spend.
   */
  syncStatsAfter?: boolean;
  /** Max `/fixtures/statistics` requests when `syncStatsAfter` is true (default 20). */
  syncStatsMaxRequests?: number;
};

export type ImportLiveFixturesOptions = {
  /** Max concurrent fixture upserts (default 16). */
  fixtureUpsertConcurrency?: number;
  /** When true (default), persist embedded `events` into goal/card/substitution tables. */
  syncEvents?: boolean;
  /** Max extra `/fixtures/events` calls when live row has no embedded events (default 5). */
  maxEventFetchRequests?: number;
};

export type SyncPrimaryVenuesFromTeamsOptions = {
  league: number;
  season: number;
  /**
   * Ignored for `league`+`season` sync: API-Football returns **all** teams in one response and rejects `page`
   * (`"The Page field do not exist."`). Kept for API compatibility / discover use.
   */
  maxPages?: number;
  /** Reserved (single `/teams` request today). */
  maxRequests?: number;
};

type StadiumImportCache = { rows: any[] | null };

type ApiSportsFixtureImportContext = {
  competitionId: number;
  seasonId: number;
  /** apisports.fixture external id → fixture row */
  fixtureByApisportsExternalId: Map<string, any>;
  /** Preloaded fixtures for correlation search (subset for comp+season) */
  correlationPool: any[];
  stadiumCache: StadiumImportCache;
  /** Chain of exclusive sections (correlation + fixture upsert indexing) — must remain ordered. */
  exclusiveTail: Promise<void>;
};

@Injectable()
export class ApiSportsAdapterService {
  private readonly logger = new Logger(ApiSportsAdapterService.name);
  /** Serialize venue lookups/creates keyed by venue id/name so parallel imports do not duplicate `stadium` rows */
  private readonly stadiumVenueEnsureTailByKey = new Map<string, Promise<void>>();

  constructor(
    private readonly http: ApiSportsHttpService,
    private readonly competitionService: CompetitionService,
    private readonly seasonService: SeasonService,
    private readonly competitionStandingService: CompetitionStandingService,
    private readonly teamService: TeamService,
    private readonly teamCompetitionSeasonService: TeamCompetitionSeasonService,
    private readonly playerService: PlayerService,
    private readonly transferService: TransferService,
    private readonly fixtureService: FixtureService,
    private readonly stadiumService: StadiumService,
    private readonly teamStadiumService: TeamStadiumService,
    private readonly playerTeamStintService: PlayerTeamStintService,
    private readonly fixtureTeamStatService: FixtureTeamStatService,
    private readonly goalService: GoalService,
    private readonly cardService: CardService,
    private readonly substitutionService: SubstitutionService,
  ) {}

  private getProviderExternalId(metadata: any): string | null {
    const v = metadata?.providers?.[PROVIDER_KEY]?.externalId;
    return v != null ? String(v) : null;
  }

  private mergeApisportsFixtureMetadata(prev: Record<string, any>, incoming: Record<string, any>): any {
    return deepMergeEntityMetadata(
      prev && typeof prev === 'object' ? prev : {},
      incoming && typeof incoming === 'object' ? incoming : {},
    );
  }

  private scoresCorrelationCompatible(
    fixtureRow: { homeScore?: number | null; awayScore?: number | null },
    incoming: { homeScore?: number; awayScore?: number },
  ): boolean {
    const eh = fixtureRow.homeScore;
    const ea = fixtureRow.awayScore;
    const ih = incoming.homeScore;
    const ia = incoming.awayScore;
    const existingComplete =
      eh != null && ea != null && Number.isFinite(Number(eh)) && Number.isFinite(Number(ea));
    const incomingComplete =
      ih !== undefined && ia !== undefined && Number.isFinite(Number(ih)) && Number.isFinite(Number(ia));
    if (existingComplete && incomingComplete) {
      return Number(eh) === Number(ih) && Number(ea) === Number(ia);
    }
    return true;
  }

  private conflictingOtherApisportsId(metadata: any, apiFixtureId: number): boolean {
    const cur = this.getProviderExternalId(metadata);
    return cur != null && cur !== '' && cur !== String(apiFixtureId);
  }

  private pickCorrelationCandidateFromPool(
    pool: readonly any[],
    opts: {
      homeTeamId: number;
      awayTeamId: number;
      scheduledAtMs: number;
      incomingScores: { homeScore?: number; awayScore?: number };
      apiFixtureId: number;
    },
  ): any | null {
    const ranked: Array<{ f: any; dt: number }> = [];
    for (const f of pool) {
      if (!f?.id) continue;
      if (f.homeTeamId !== opts.homeTeamId || f.awayTeamId !== opts.awayTeamId) continue;
      if (this.conflictingOtherApisportsId(f.metadata, opts.apiFixtureId)) continue;
      if (!this.scoresCorrelationCompatible(f, opts.incomingScores)) continue;
      const t = f.date instanceof Date ? f.date.getTime() : new Date(f.date as any).getTime();
      if (Number.isNaN(t)) continue;
      const delta = Math.abs(t - opts.scheduledAtMs);
      if (delta <= FIXTURE_CORRELATION_MAX_MS) ranked.push({ f, dt: delta });
    }
    if (!ranked.length) return null;
    ranked.sort((a, b) => a.dt - b.dt);
    return ranked[0].f;
  }

  private enqueueFixtureImportExclusive(
    ctx: ApiSportsFixtureImportContext,
    fn: () => Promise<void>,
  ): Promise<void> {
    const prev = ctx.exclusiveTail;
    const p = prev.then(fn);
    ctx.exclusiveTail = p.then(
      () => undefined,
      () => undefined,
    );
    return p;
  }

  private async runPool<T>(
    items: readonly T[],
    concurrency: number,
    worker: (item: T, index: number) => Promise<void>,
  ): Promise<void> {
    const n = Math.max(1, Math.min(64, Math.floor(concurrency)));
    let next = 0;
    async function runner() {
      while (true) {
        const idx = next++;
        if (idx >= items.length) break;
        await worker(items[idx], idx);
      }
    }
    await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => runner()));
  }

  private async sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  private async getTeamsCached(): Promise<any[]> {
    return this.teamService.getQuery({});
  }

  private async getPlayersCached(): Promise<any[]> {
    return this.playerService.getQuery({});
  }

  private normalizeTeamName(name: any): string {
    return String(name ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  private normalizePersonName(name: any): string {
    return String(name ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  private buildApiSportsFullName(p: any): { fullName: string; shortName: string } {
    const shortName = String(p?.name ?? '').trim();
    const first = String(p?.firstname ?? '').trim();
    const last = String(p?.lastname ?? '').trim();
    const fullName =
      first && last
        ? `${first} ${last}`.trim()
        : shortName;
    return { fullName: fullName.trim(), shortName };
  }

  private parseApiDate(dateLike: any): Date | null {
    if (!dateLike) return null;
    const d = new Date(String(dateLike));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private isPlaceholderDob(dob: any): boolean {
    if (!dob) return false;
    const d = dob instanceof Date ? dob : new Date(dob);
    if (Number.isNaN(d.getTime())) return false;
    // StatsBomb placeholder in this project
    return d.toISOString().slice(0, 10) === '1900-01-01';
  }

  private async findExistingPlayerByNameWithPlaceholderDob(
    name: any,
  ): Promise<{ match: any | null; ambiguous: boolean }> {
    const targetName = this.normalizePersonName(name);
    if (!targetName) return { match: null, ambiguous: false };
    const players = await this.getPlayersCached();
    const matches = players.filter((p) => {
      const pn = this.normalizePersonName(p?.name);
      if (pn !== targetName) return false;
      return this.isPlaceholderDob(p?.dateOfBirth);
    });
    if (matches.length === 1) return { match: matches[0] ?? null, ambiguous: false };
    if (matches.length > 1) return { match: null, ambiguous: true };
    return { match: null, ambiguous: false };
  }

  private async findExistingPlayerByNameAndDob(name: any, dob: Date): Promise<any | null> {
    const targetName = this.normalizePersonName(name);
    if (!targetName) return null;
    const targetIso = dob.toISOString().slice(0, 10);
    const players = await this.getPlayersCached();
    const matches = players.filter((p) => {
      const pn = this.normalizePersonName(p?.name);
      if (pn !== targetName) return false;
      const pd = p?.dateOfBirth ? new Date(p.dateOfBirth) : null;
      if (!pd || Number.isNaN(pd.getTime())) return false;
      return pd.toISOString().slice(0, 10) === targetIso;
    });
    if (!matches.length) return null;

    const score = (p: any): number => {
      const providers = p?.metadata?.providers ?? {};
      const providerKeys = typeof providers === 'object' && providers ? Object.keys(providers) : [];
      const hasStatsbomb = providers?.statsbomb?.externalId != null;
      const hasApiSports = providers?.[PROVIDER_KEY]?.externalId != null;
      return (hasApiSports ? -100 : 0) + (hasStatsbomb ? 50 : 0) + providerKeys.length;
    };
    return matches.sort((a, b) => score(b) - score(a))[0] ?? null;
  }

  private async resolveLocalSeasonIdFromApiYear(apiSeasonYear: number): Promise<number | undefined> {
    const seasons = await this.seasonService.getQuery({});
    const match = seasons.find(
      (s) => s.yearStart === apiSeasonYear || s.yearEnd === apiSeasonYear,
    );
    return match?.id;
  }

  private trackRosterPlayer(rosterByTeam: Map<number, number[]>, teamId: number, playerId: number): void {
    const list = rosterByTeam.get(teamId) ?? [];
    if (!list.includes(playerId)) list.push(playerId);
    rosterByTeam.set(teamId, list);
  }

  private async linkImportedPlayerStint(
    playerId: number,
    localTeamId: number | undefined,
    seasonId: number | undefined,
    kitNumber?: number,
    rosterByTeam?: Map<number, number[]>,
  ): Promise<void> {
    if (!localTeamId) return;
    await this.playerTeamStintService.openStint({
      playerId,
      teamId: localTeamId,
      source: PlayerTeamStintSource.IMPORT,
      seasonId,
      kitNumber,
    });
    if (rosterByTeam) this.trackRosterPlayer(rosterByTeam, localTeamId, playerId);
  }

  private async attachApiSportsProviderToPlayer(
    player: any,
    apiPlayerId: number,
    patch?: Record<string, any>,
  ): Promise<any> {
    const nextMeta = deepMergeEntityMetadata((player?.metadata ?? {}) as Record<string, unknown>, {
      source: String(player?.metadata?.source ?? 'api-sports'),
      providers: { [PROVIDER_KEY]: { externalId: String(apiPlayerId) } },
      apisports: {
        playerId: apiPlayerId,
        lastImportedAt: new Date().toISOString(),
      },
    } as Record<string, unknown>);
    return this.playerService.update(player.id, {
      id: player.id,
      ...(patch ?? {}),
      metadata: nextMeta as any,
    } as any);
  }

  /**
   * Best-effort match to avoid duplicates when a team already exists (e.g. from StatsBomb)
   * but doesn't yet have API-Sports provider metadata.
   */
  private async findExistingTeamByNameAndCountry(
    name: any,
    country?: string,
  ): Promise<any | null> {
    const target = this.normalizeTeamName(name);
    if (!target) return null;
    const targetCountry = country != null ? String(country).trim().toLowerCase() : null;
    const teams = await this.getTeamsCached();
    const candidates = teams.filter((t) => {
      const n = this.normalizeTeamName(t?.name);
      if (n !== target) return false;
      if (!targetCountry) return true;
      const c = t?.country != null ? String(t.country).trim().toLowerCase() : '';
      return c === targetCountry;
    });
    if (!candidates.length) return null;

    const score = (t: any): number => {
      const providers = t?.metadata?.providers ?? {};
      const providerKeys = typeof providers === 'object' && providers ? Object.keys(providers) : [];
      const hasStatsbomb = providers?.statsbomb?.externalId != null;
      const hasApiSports = providers?.[PROVIDER_KEY]?.externalId != null;
      // Prefer an existing non-apisports team, especially one already linked to StatsBomb.
      return (hasApiSports ? -100 : 0) + (hasStatsbomb ? 50 : 0) + providerKeys.length;
    };

    return candidates.sort((a, b) => score(b) - score(a))[0] ?? null;
  }

  private async attachApiSportsProviderToTeam(team: any, apiTeam: any, teamCountry?: string): Promise<any> {
    const apiId = apiTeam?.id != null ? Number(apiTeam.id) : null;
    const nextMeta = deepMergeEntityMetadata((team?.metadata ?? {}) as Record<string, unknown>, {
      source: String(team?.metadata?.source ?? 'api-sports'),
      providers: {
        [PROVIDER_KEY]: { externalId: apiId != null ? String(apiId) : String(apiTeam?.id ?? '') },
      },
      apisports: {
        ...(apiId != null ? { teamId: apiId } : {}),
        lastImportedAt: new Date().toISOString(),
      },
    } as Record<string, unknown>);

    return this.teamService.update(team.id, {
      id: team.id,
      country: team?.country ?? teamCountry,
      logoUrl: team?.logoUrl ?? apiTeam?.logo ?? undefined,
      metadata: nextMeta as any,
    } as any);
  }

  private async findLocalTeamByApiSportsId(apiTeamId: number): Promise<any | null> {
    if (!apiTeamId) return null;
    const key = String(apiTeamId);
    const teams = await this.getTeamsCached();
    return (
      teams.find((t) => {
        const m = t?.metadata ?? {};
        return this.getProviderExternalId(m) === key;
      }) ?? null
    );
  }

  private async findLocalPlayerByApiSportsId(apiPlayerId: number): Promise<any | null> {
    if (!apiPlayerId) return null;
    const key = String(apiPlayerId);
    const players = await this.getPlayersCached();
    return (
      players.find((p) => {
        const m = p?.metadata ?? {};
        return this.getProviderExternalId(m) === key;
      }) ?? null
    );
  }

  private async findExistingStanding(
    teamCompetitionSeasonId: number,
  ): Promise<any | null> {
    const rows = await this.competitionStandingService.getQuery({
      where: { teamCompetitionSeasonId } as any,
    });
    if (!rows.length) return null;
    return rows.sort((a, b) => {
      const aForm = a.form?.trim() ? 1 : 0;
      const bForm = b.form?.trim() ? 1 : 0;
      if (bForm !== aForm) return bForm - aForm;
      return b.id - a.id;
    })[0];
  }

  /** API-Football returns `standings` under `league` or at the root of `response[0]`. */
  private extractStandingsGroups(first: any): any[] {
    if (!first) return [];
    const nested = first.league?.standings;
    const top = first.standings;
    if (Array.isArray(nested) && nested.length) return nested;
    if (Array.isArray(top) && top.length) return top;
    return [];
  }

  /** Prefer explicit discover/paste `season`; else first API season with standings coverage. */
  private resolveApiSeasonYearForItem(seasons: any[], explicit?: number): number | null {
    if (explicit != null && !Number.isNaN(Number(explicit))) {
      return Number(explicit);
    }
    const withSt = seasons.find((s) => s?.coverage?.standings);
    if (withSt?.year != null) return Number(withSt.year);
    if (seasons[0]?.year != null) return Number(seasons[0].year);
    return null;
  }

  private async ensureTeamCompetitionSeasonId(
    teamId: number,
    competitionId: number,
    seasonId: number,
  ): Promise<number> {
    const existing = await this.teamCompetitionSeasonService.getQuery({
      where: { teamId, competitionId, seasonId },
    });
    if (existing?.[0]?.id) return existing[0].id;
    const created = await this.teamCompetitionSeasonService.create({
      teamId,
      competitionId,
      seasonId,
      metadata: deepMergeEntityMetadata(
        {},
        {
          source: 'api-sports',
          lastSync: new Date().toISOString(),
        } as Record<string, unknown>,
      ) as any,
    } as any);
    return created.id;
  }

  /**
   * Import players for a given league+season.
   * Uses `/players?league=&season=&page=` (paged). Each page is one request.
   *
   * Dedup strategy:
   * - If player exists with metadata.providers.apisports.externalId => update profile + open stint.
   * - Else strict match on (normalized name + DOB) => attach API-Sports provider id.
   * - Else create new player.
   */
  async importPlayersFromLeagueSeason(
    options: ImportPlayersFromLeagueSeasonOptions,
  ): Promise<{
    requests: number;
    pagesFetched: number;
    playersCreated: number;
    playersLinked: number;
    playersUpdated: number;
    skipped: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    const maxPages = options.maxPages ?? 2;
    const maxRequests = options.maxRequests ?? 10;
    const skipOnAmbiguousName = options.skipOnAmbiguousName !== false;
    let requests = 0;
    let pagesFetched = 0;
    let playersCreated = 0;
    let playersLinked = 0;
    let playersUpdated = 0;
    let skipped = 0;
    const rosterByTeam = new Map<number, number[]>();
    const seasonId = await this.resolveLocalSeasonIdFromApiYear(options.season);

    for (let page = 1; page <= maxPages; page += 1) {
      if (requests >= maxRequests) break;
      let data: any;
      try {
        data = await this.http.get('/players', {
          league: options.league,
          season: options.season,
          page,
        });
        requests += 1;
        pagesFetched += 1;
      } catch (e: any) {
        errors.push(
          `players league ${options.league} season ${options.season} page ${page}: ${e?.message ?? e}`,
        );
        break;
      }

      if (data?.errors?.length) {
        errors.push(
          `players league ${options.league} season ${options.season} page ${page}: ${JSON.stringify(
            data.errors,
          )}`,
        );
        break;
      }

      const response = Array.isArray(data?.response) ? data.response : [];
      if (!response.length) break;

      for (const row of response) {
        try {
          const p = row?.player ?? row;
          const apiPlayerId = p?.id != null ? Number(p.id) : null;
          if (!apiPlayerId) {
            skipped += 1;
            continue;
          }

          const { fullName, shortName } = this.buildApiSportsFullName(p);
          const name = fullName;
          const birth = this.parseApiDate(p?.birth?.date ?? p?.birthdate);
          const nationality = p?.nationality;
          if (!name || !birth || !nationality) {
            skipped += 1;
            continue;
          }

          const heightStr = p?.height;
          let heightCm: number | undefined;
          if (heightStr != null) {
            const m = String(heightStr).match(/(\d+)/);
            if (m) heightCm = parseInt(m[1], 10);
          }
          const weightStr = p?.weight;
          let weightKg: number | undefined;
          if (weightStr != null) {
            const m = String(weightStr).match(/(\d+)/);
            if (m) weightKg = parseInt(m[1], 10);
          }

          // Try map a team id (optional)
          const apiTeamId = row?.statistics?.[0]?.team?.id;
          const localTeam = apiTeamId
            ? await this.findLocalTeamByApiSportsId(Number(apiTeamId))
            : null;
          const localTeamId = localTeam?.id;

          const existingByApi = await this.findLocalPlayerByApiSportsId(apiPlayerId);
          if (existingByApi) {
            await this.playerService.update(existingByApi.id, {
              id: existingByApi.id,
              dateOfBirth: this.isPlaceholderDob(existingByApi.dateOfBirth) ? birth : existingByApi.dateOfBirth,
              nationality: existingByApi.nationality ?? String(nationality),
              height: existingByApi.height ?? heightCm,
              weight: existingByApi.weight ?? weightKg,
              photoUrl: existingByApi.photoUrl ?? p?.photo ?? undefined,
              nickname: existingByApi.nickname ?? (shortName && shortName !== existingByApi.name ? shortName : undefined),
              metadata: deepMergeEntityMetadata((existingByApi.metadata ?? {}) as Record<string, unknown>, {
                source: String(existingByApi.metadata?.source ?? 'api-sports'),
                providers: { [PROVIDER_KEY]: { externalId: String(apiPlayerId) } },
                apisports: {
                  playerId: apiPlayerId,
                  lastImportedAt: new Date().toISOString(),
                },
              } as Record<string, unknown>) as any,
            } as any);
            await this.linkImportedPlayerStint(
              existingByApi.id,
              localTeamId,
              seasonId,
              undefined,
              rosterByTeam,
            );
            playersUpdated += 1;
            continue;
          }

          const existingByNameDob = await this.findExistingPlayerByNameAndDob(name, birth);
          if (existingByNameDob) {
            await this.attachApiSportsProviderToPlayer(existingByNameDob, apiPlayerId, {
              nationality: existingByNameDob.nationality ?? String(nationality),
              height: existingByNameDob.height ?? heightCm,
              weight: existingByNameDob.weight ?? weightKg,
              photoUrl: existingByNameDob.photoUrl ?? p?.photo ?? undefined,
              nickname: existingByNameDob.nickname ?? (shortName && shortName !== existingByNameDob.name ? shortName : undefined),
            });
            await this.linkImportedPlayerStint(
              existingByNameDob.id,
              localTeamId,
              seasonId,
              undefined,
              rosterByTeam,
            );
            playersLinked += 1;
            continue;
          }

          // Fallback: if local players have placeholder DOBs (StatsBomb), link by unique name match with placeholder DOB.
          const placeholder = await this.findExistingPlayerByNameWithPlaceholderDob(name);
          if (placeholder.ambiguous) {
            if (skipOnAmbiguousName) {
              skipped += 1;
              continue;
            }
          }
          if (placeholder.match) {
            await this.attachApiSportsProviderToPlayer(placeholder.match, apiPlayerId, {
              dateOfBirth: birth,
              nationality: placeholder.match.nationality ?? String(nationality),
              height: placeholder.match.height ?? heightCm,
              weight: placeholder.match.weight ?? weightKg,
              photoUrl: placeholder.match.photoUrl ?? p?.photo ?? undefined,
              nickname: placeholder.match.nickname ?? (shortName && shortName !== placeholder.match.name ? shortName : undefined),
            });
            await this.linkImportedPlayerStint(
              placeholder.match.id,
              localTeamId,
              seasonId,
              undefined,
              rosterByTeam,
            );
            playersLinked += 1;
            continue;
          }

          const created = await this.playerService.create({
            name,
            nickname: (shortName && shortName !== name ? shortName : (p?.nickname ?? undefined)),
            dateOfBirth: birth,
            nationality: String(nationality),
            positionIds: [], // required (NOT NULL in DB)
            bio: undefined,
            kitNumber: undefined,
            height: heightCm,
            weight: weightKg,
            photoUrl: p?.photo ?? undefined,
            metadata: {
              source: 'api-sports',
              apisports: { playerId: apiPlayerId, lastImportedAt: new Date().toISOString() },
              providers: { [PROVIDER_KEY]: { externalId: String(apiPlayerId) } },
            } as any,
          } as any);
          await this.linkImportedPlayerStint(
            created.id,
            localTeamId,
            seasonId,
            undefined,
            rosterByTeam,
          );
          playersCreated += 1;
        } catch (e: any) {
          errors.push(`player row: ${e?.message ?? e}`);
        }
      }

      await this.sleep(API_SPORTS_CONFIG.requestDelayMs);

      const paging = data?.paging;
      if (
        paging?.current != null &&
        paging?.total != null &&
        Number(paging.current) >= Number(paging.total)
      ) {
        break;
      }
    }

    for (const [teamId, playerIds] of rosterByTeam) {
      await this.playerTeamStintService.syncCurrentRosterFromImport(teamId, playerIds, seasonId);
    }

    this.logger.log(
      `importPlayersFromLeagueSeason: league ${options.league} season ${options.season} — ${requests} req, pages ${pagesFetched}, +${playersCreated} created, ~${playersUpdated} updated, ~${playersLinked} linked, ${skipped} skipped, ${errors.length} error(s)`,
    );
    return {
      requests,
      pagesFetched,
      playersCreated,
      playersLinked,
      playersUpdated,
      skipped,
      errors,
    };
  }

  /**
   * Map `/standings` JSON to local `competitionStanding` (+ optional team create + `teamCompetitionSeason`).
   */
  private async processStandingsApiResponse(
    data: any,
    item: ApiSportsStandingsItem,
    opts: { createMissingTeams: boolean; teamCountry?: string },
  ): Promise<{ processed: number; teamsCreated: number; error?: string }> {
    if (data?.errors?.length) {
      return {
        processed: 0,
        teamsCreated: 0,
        error: JSON.stringify(data.errors),
      };
    }
    const response = data?.response;
    if (!Array.isArray(response) || !response[0]) {
      return { processed: 0, teamsCreated: 0, error: 'empty response' };
    }
    const groups = this.extractStandingsGroups(response[0]);
    let processed = 0;
    let teamsCreated = 0;

    for (const group of groups) {
      const rows: any[] = Array.isArray(group) ? group : [group];
      for (const row of rows) {
        if (!row?.team?.id) continue;
        let localTeam = await this.findLocalTeamByApiSportsId(Number(row.team.id));
        if (!localTeam && opts.createMissingTeams) {
          const existingByName = await this.findExistingTeamByNameAndCountry(
            row?.team?.name,
            opts.teamCountry,
          );
          if (existingByName) {
            localTeam = await this.attachApiSportsProviderToTeam(
              existingByName,
              row.team,
              opts.teamCountry,
            );
          } else {
          const baseMeta = {
            source: 'api-sports',
            apisports: { teamId: Number(row.team.id), lastImportedAt: new Date().toISOString() },
            providers: {
              [PROVIDER_KEY]: { externalId: String(row.team.id) },
            },
          };
          localTeam = await this.teamService.create({
            name: String(row.team.name ?? `Team ${row.team.id}`),
            country: opts.teamCountry,
            type: TeamType.CLUB,
            logoUrl: row.team.logo ?? undefined,
            metadata: baseMeta as any,
          } as any);
          teamsCreated += 1;
          }
        }
        if (!localTeam) {
          if (!opts.createMissingTeams) {
            this.logger.warn(
              `No local team for API-Sports team id ${row.team.id} (${row.team.name}) — set metadata.providers.apisports.externalId`,
            );
          }
          continue;
        }
        const all = row.all ?? row;
        const goals = all.goals ?? { for: 0, against: 0 };
        const played = all.played ?? 0;
        const won = all.win ?? 0;
        const draw = all.draw ?? 0;
        const lost = all.lose ?? 0;
        const goalsFor = goals.for ?? 0;
        const goalsAgainst = goals.against ?? 0;
        const goalDiff =
          row.goalsDiff != null ? Number(row.goalsDiff) : goalsFor - goalsAgainst;
        const teamCompetitionSeasonId = await this.ensureTeamCompetitionSeasonId(
          localTeam.id,
          item.competitionId,
          item.seasonId,
        );
        const standingMeta = {
          source: 'api-sports',
          league: item.league,
          season: item.season,
          lastSync: new Date().toISOString(),
          provider: PROVIDER_KEY,
        };
        const payload: CreateCompetitionStandingDTO = {
          teamCompetitionSeasonId,
          position: Number(row.rank ?? row.position ?? 0) || 0,
          played: Number(played) || 0,
          won: Number(won) || 0,
          drawn: Number(draw) || 0,
          lost: Number(lost) || 0,
          goalsFor: Number(goalsFor) || 0,
          goalsAgainst: Number(goalsAgainst) || 0,
          goalDifference: goalDiff,
          points: Number(row.points) || 0,
          form: row.form != null ? String(row.form) : undefined,
          metadata: standingMeta as any,
        } as any;

        const existing = await this.findExistingStanding(
          teamCompetitionSeasonId,
        );
        if (existing) {
          await this.competitionStandingService.upsertByTeamCompetitionSeasonId(
            teamCompetitionSeasonId,
            {
              ...payload,
              metadata: deepMergeEntityMetadata(
                (existing.metadata ?? {}) as Record<string, unknown>,
                standingMeta as Record<string, unknown>,
              ) as any,
            } as CreateCompetitionStandingDTO,
          );
        } else {
          await this.competitionStandingService.create(payload);
        }
        processed += 1;
      }
    }

    return { processed, teamsCreated };
  }

  /**
   * 1) Standings — map each API table row to `competitionStanding` (idempotent upsert).
   */
  async syncStandings(items: ApiSportsStandingsItem[]): Promise<{
    processed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;

    for (const item of items) {
      try {
        const data: any = await this.http.get('/standings', {
          league: item.league,
          season: item.season,
        });
        const r = await this.processStandingsApiResponse(data, item, {
          createMissingTeams: false,
        });
        if (r.error) {
          errors.push(`league ${item.league} season ${item.season}: ${r.error}`);
          continue;
        }
        processed += r.processed;
      } catch (e: any) {
        errors.push(
          `league ${item.league} season ${item.season}: ${e?.message ?? e}`,
        );
      }
    }

    this.logger.log(`syncStandings: updated/created ${processed} rows; ${errors.length} error(s)`);
    return { processed, errors };
  }

  /**
   * 2) Enrich players (DOB, nationality, height) for rows that already have
   * `metadata.providers.apisports.externalId` (or legacy `metadata.apisportsPlayerId`).
   */
  async enrichPlayers(options?: {
    limit?: number;
    season?: number;
    /** Stop after this many API calls (profiles + fallback /players). */
    maxRequests?: number;
  }): Promise<{
    updated: number;
    skipped: number;
    apiRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let updated = 0;
    let skipped = 0;
    let apiRequests = 0;
    const all = await this.getPlayersCached();
    const withId = all.filter((p) => {
      const m = p?.metadata ?? {};
      const id = this.getProviderExternalId(m) ?? (m.apisportsPlayerId != null ? String(m.apisportsPlayerId) : null);
      return !!id;
    });
    const limit = options?.limit ?? withId.length;
    const slice = withId.slice(0, limit);
    const season = options?.season ?? new Date().getFullYear() - 1;

    for (const player of slice) {
      if (options?.maxRequests != null && apiRequests >= options.maxRequests) {
        break;
      }
      const m = player?.metadata ?? {};
      const apiId = this.getProviderExternalId(m) ?? String(m.apisportsPlayerId);
      if (!apiId) {
        skipped += 1;
        continue;
      }
      try {
        let p: any;
        const prof: any = await this.http.get('/players/profiles', { player: apiId });
        apiRequests += 1;
        if (prof?.response?.[0]) {
          const raw = prof.response[0];
          p = raw.player ?? raw;
        } else {
          const pl: any = await this.http.get('/players', { id: apiId, season });
          apiRequests += 1;
          p = pl?.response?.[0]?.player;
        }
        if (!p) {
          errors.push(`player id ${player.id} API id ${apiId}: no profile`);
          skipped += 1;
          await this.sleep(API_SPORTS_CONFIG.requestDelayMs);
          continue;
        }
        const birth = p.birth?.date ?? p.birthdate;
        const nationality = p.nationality ?? p.birth?.place;
        const heightStr = p.height;
        let heightCm: number | undefined;
        if (heightStr != null) {
          const m2 = String(heightStr).match(/(\d+)/);
          if (m2) heightCm = parseInt(m2[1], 10);
        }
        const next: any = {
          id: player.id,
          nationality: nationality != null ? String(nationality) : player.nationality,
          height: heightCm != null && !Number.isNaN(heightCm) ? heightCm : player.height,
          metadata: deepMergeEntityMetadata(m as Record<string, unknown>, {
            lastApiSportsEnrichAt: new Date().toISOString(),
            providers: {
              [PROVIDER_KEY]: { externalId: String(apiId) },
            },
          } as Record<string, unknown>),
        };
        if (birth) {
          next.dateOfBirth = new Date(birth);
        }
        await this.playerService.update(player.id, next);
        updated += 1;
      } catch (e: any) {
        errors.push(`player id ${player.id}: ${e?.message ?? e}`);
      }
      await this.sleep(API_SPORTS_CONFIG.requestDelayMs);
    }

    this.logger.log(`enrichPlayers: ${updated} updated, ${skipped} skipped, ${apiRequests} API req`);
    return { updated, skipped, apiRequests, errors };
  }

  /**
   * 3) Transfers for one API team id (must match a local team with `metadata.providers.apisports.externalId`
   * for team resolution, or pass pre-mapped local team ids in a follow-up).
   */
  async syncTransfersForApiTeam(options: {
    teamApiId: number;
    season?: number;
  }): Promise<{ created: number; skipped: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;
    let skipped = 0;
    const { teamApiId, season } = options;
    const data: any = await this.http.get('/transfers', {
      team: teamApiId,
      ...(season != null ? { season } : {}),
    });
    if (data?.errors?.length) {
      return { created: 0, skipped: 0, errors: [JSON.stringify(data.errors)] };
    }
    const list = data?.response;
    if (!Array.isArray(list)) {
      return { created: 0, skipped: 0, errors: ['No transfer response'] };
    }

    for (const block of list) {
      const playerApi = block?.player;
      const transfers: any[] = Array.isArray(block?.transfers) ? block.transfers : [];
      if (!playerApi?.id) continue;
      const localPlayer = await this.findLocalPlayerByApiSportsId(Number(playerApi.id));
      if (!localPlayer) {
        skipped += 1;
        continue;
      }
      for (const t of transfers) {
        const date = t?.date;
        const teams = t?.teams;
        const outId = teams?.out?.id;
        const inId = teams?.in?.id;
        if (!outId || !inId) {
          skipped += 1;
          continue;
        }
        const source = await this.findLocalTeamByApiSportsId(Number(outId));
        const dest = await this.findLocalTeamByApiSportsId(Number(inId));
        if (!source || !dest) {
          skipped += 1;
          continue;
        }
        const type = String(t?.type ?? '');
        const isLoan = type.toLowerCase().includes('loan');
        const [dup] = await this.transferService.getQuery({
          where: {
            playerId: localPlayer.id,
            sourceTeamId: source.id,
            destinationTeamId: dest.id,
          } as any,
        });
        if (dup) {
          skipped += 1;
          continue;
        }
        const transferFee = 0;
        const transferRow = await this.transferService.create({
          playerId: localPlayer.id,
          sourceTeamId: source.id,
          destinationTeamId: dest.id,
          transferFee,
          date: date ? new Date(date) : undefined,
          isLoan,
          metadata: {
            source: 'api-sports',
            apisportsPlayerId: String(playerApi.id),
            lastSync: new Date().toISOString(),
          } as any,
        } as any);
        await this.playerTeamStintService.applyTransfer({
          playerId: localPlayer.id,
          sourceTeamId: source.id,
          destinationTeamId: dest.id,
          date: transferRow.date,
          isLoan,
        });
        created += 1;
      }
    }

    this.logger.log(`syncTransfers: ${created} created, ${skipped} skipped`);
    return { created, skipped, errors };
  }

  /**
   * API-Sports uses integer `season` (e.g. 2023) on standings/fixtures; each league’s
   * `GET /leagues?id=…` payload includes `seasons` with `year`, `start`, `end`.
   */
  private cleanLeagueQuery(query: Record<string, string | undefined>): Record<string, string | number> {
    const numericKeys = new Set([
      'id',
      'league',
      'season',
      'country',
      'type',
      'team',
      'venue',
      'division',
      'current',
      'last',
    ]);
    const out: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === '') continue;
      if (numericKeys.has(k) && /^\d+$/.test(v)) {
        out[k] = parseInt(v, 10);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  /** Pass-through to GET /leagues — find league ids, names, countries. */
  async discoverLeagues(query: Record<string, string | undefined>): Promise<any> {
    return this.http.get('/leagues', this.cleanLeagueQuery(query) as any);
  }

  /** Pass-through to GET /countries — optional `search`, `code`. */
  async discoverCountries(query: Record<string, string | undefined>): Promise<any> {
    const out: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === '') continue;
      out[k] = v;
    }
    return this.http.get('/countries', out as any);
  }

  /** Coerce known numeric GET /fixtures params; leave `date`, `from`, `to`, `timezone`, `status`, etc. as strings. */
  private cleanFixturesQuery(query: Record<string, string | undefined>): Record<string, string | number> {
    const numericKeys = new Set([
      'id',
      'league',
      'season',
      'team',
      'last',
      'next',
      'venue',
      'page',
    ]);
    const out: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === '') continue;
      if (numericKeys.has(k) && /^\d+$/.test(v)) {
        out[k] = parseInt(v, 10);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  /** Coerce numeric GET /teams params; leave `name`, `country`, `code`, `search` as strings. */
  private cleanTeamsDiscoverQuery(query: Record<string, string | undefined>): Record<string, string | number> {
    const numericKeys = new Set(['id', 'league', 'season', 'team', 'venue', 'page']);
    const out: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === '') continue;
      if (numericKeys.has(k) && /^\d+$/.test(v)) {
        out[k] = parseInt(v, 10);
      } else {
        out[k] = v;
      }
    }
    return out;
  }

  private hasApiSportsErrorsPayload(data: any): boolean {
    const e = data?.errors;
    if (e == null) return false;
    if (Array.isArray(e)) return e.length > 0;
    if (typeof e === 'object') return Object.keys(e).length > 0;
    if (typeof e === 'string') return String(e).trim().length > 0;
    return false;
  }

  /** `/teams` returns `response: [{ team, venue }, ...]`; single-id calls may return one `{ team, venue }` object. */
  private normalizeTeamsResponseArray(responseField: unknown): any[] {
    if (Array.isArray(responseField)) return responseField;
    if (responseField && typeof responseField === 'object' && (responseField as any).team != null) {
      return [responseField as any];
    }
    return [];
  }

  /** Proxies GET /teams — club `venue` is the registered home ground (see `syncPrimaryVenuesFromTeamsLeagueSeason`). */
  async discoverTeams(query: Record<string, string | undefined>): Promise<any> {
    return this.http.get('/teams', this.cleanTeamsDiscoverQuery(query) as any);
  }

  /**
   * Links each local team (matched by `metadata.providers.apisports.externalId`) to its **primary** stadium
   * using API-Football **`GET /teams?league=&season=`** (no `page` — upstream rejects `page` with this filter).
   * Each row’s **`venue`** is the registered home ground, not match venue.
   */
  async syncPrimaryVenuesFromTeamsLeagueSeason(options: SyncPrimaryVenuesFromTeamsOptions): Promise<{
    requests: number;
    pagesFetched: number;
    linked: number;
    skipped: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let requests = 0;
    let pagesFetched = 0;
    let linked = 0;
    let skipped = 0;
    const stadiumCache: StadiumImportCache = { rows: null };

    let data: any;
    try {
      // API-Football: `page` is not allowed with `league` + `season` on /teams — returns errors.page "do not exist".
      data = await this.http.get('/teams', {
        league: options.league,
        season: options.season,
      });
      requests = 1;
      pagesFetched = 1;
    } catch (e: any) {
      errors.push(`/teams: ${e?.message ?? e}`);
      this.logger.log(
        `syncPrimaryVenuesFromTeamsLeagueSeason: league ${options.league} season ${options.season} — ${linked} linked, ${skipped} skipped, ${requests} /teams req` +
          (errors.length ? `; see errors (${errors.length}) in response body` : ''),
      );
      return { requests, pagesFetched, linked, skipped, errors };
    }

    if (this.hasApiSportsErrorsPayload(data)) {
      errors.push(`/teams: ${JSON.stringify(data.errors)}`);
      this.logger.log(
        `syncPrimaryVenuesFromTeamsLeagueSeason: league ${options.league} season ${options.season} — ${linked} linked, ${skipped} skipped, ${requests} /teams req` +
          (errors.length ? `; see errors (${errors.length}) in response body` : ''),
      );
      return { requests, pagesFetched, linked, skipped, errors };
    }

    const response = this.normalizeTeamsResponseArray(data?.response);
    if (!response.length) {
      errors.push(
        `/teams: empty response for league=${options.league} season=${options.season} ` +
          `(upstream results=${data?.results ?? 'n/a'}, parameters=${JSON.stringify(data?.parameters ?? data?.get ?? null)}). ` +
          `Confirm this league+season exists on your API-Football plan. To link venues, local teams need ` +
          `metadata.providers.apisports.externalId (run league import with standings sync, or POST /sync/standings first).`,
      );
      this.logger.log(
        `syncPrimaryVenuesFromTeamsLeagueSeason: league ${options.league} season ${options.season} — ${linked} linked, ${skipped} skipped, ${requests} /teams req` +
          (errors.length ? `; see errors (${errors.length}) in response body` : ''),
      );
      return { requests, pagesFetched, linked, skipped, errors };
    }

    for (const entry of response) {
      const apiTeam = entry?.team;
      const venue = entry?.venue;
      const apiTeamId = apiTeam?.id != null ? Number(apiTeam.id) : null;
      if (!apiTeamId) {
        skipped += 1;
        continue;
      }
      const venueId = venue?.id != null ? Number(venue.id) : null;
      if (!venueId || !Number.isFinite(venueId)) {
        skipped += 1;
        continue;
      }

      const localTeam = await this.findLocalTeamByApiSportsId(apiTeamId);
      if (!localTeam?.id) {
        skipped += 1;
        continue;
      }

      const country =
        apiTeam?.country != null && String(apiTeam.country).trim() !== ''
          ? String(apiTeam.country).trim()
          : venue?.city != null && String(venue.city).trim() !== ''
            ? String(venue.city).trim()
            : 'Unknown';

      try {
        const stadiumId = await this.ensureStadiumFromApiVenueForImport(stadiumCache, venue, country);
        await this.teamStadiumService.ensurePrimaryHomeFromApiSportsTeams(localTeam.id, stadiumId);
        linked += 1;
      } catch (e: any) {
        errors.push(`team api id ${apiTeamId} venue ${venueId}: ${e?.message ?? e}`);
      }
    }

    this.logger.log(
      `syncPrimaryVenuesFromTeamsLeagueSeason: league ${options.league} season ${options.season} — ${linked} linked, ${skipped} skipped, ${requests} /teams req` +
        (errors.length ? `; see errors (${errors.length}) in response body` : ''),
    );
    return { requests, pagesFetched, linked, skipped, errors };
  }

  /**
   * GET /fixtures — see https://www.api-football.com/documentation-v3
   *
   * Efficient patterns:
   * - **Day schedule:** `date=YYYY-MM-DD` (+ optional `timezone` so “today” matches local kickoff day).
   * - **League slice:** add `league` + `season` to shrink payload vs all competitions.
   * - **Many fixture IDs, one call:** `ids=id1-id2-id3` (hyphen-separated).
   * - **Live:** use {@link discoverLiveFixtures} (`live=all`) instead of polling each fixture’s events.
   *
   * **Pagination:** upstream rejects `page` when using **`from` + `to` (date-range) together with league context** —
   * the API returns the full slice in one response; do not send `page`.
   *
   * Query params `allPages` / `maxPages` are **local only**: when `allPages=true`, fetches `page=1..n`
   * until `paging` ends or `maxPages` is hit (counts as multiple API requests), **unless** `from`+`to` forbid `page`.
   */
  async discoverFixtures(query: Record<string, string | undefined>): Promise<any> {
    const allPages =
      query.allPages === 'true' || query.allPages === '1' || query.allPages === 'yes';
    let maxPages = 20;
    if (query.maxPages != null && /^\d+$/.test(String(query.maxPages))) {
      maxPages = Math.min(50, Math.max(1, parseInt(String(query.maxPages), 10)));
    }

    const sanitized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(query)) {
      if (k === 'allPages' || k === 'maxPages') continue;
      sanitized[k] = v;
    }

    if (!allPages) {
      return this.http.get('/fixtures', this.cleanFixturesQuery(sanitized) as any);
    }

    let page = 1;
    const combined: any[] = [];
    let last: any = null;
    /** API-Football: `page` is invalid alongside `from` + `to` → empty response + errors.page */
    const omitPage = Boolean(sanitized.from && sanitized.to);

    while (page <= maxPages) {
      const params = this.cleanFixturesQuery(
        omitPage ? sanitized : { ...sanitized, page: String(page) },
      );
      const data = await this.http.get('/fixtures', params as any);
      last = data;
      const chunk = Array.isArray(data?.response) ? data.response : [];
      combined.push(...chunk);

      if (omitPage) {
        break;
      }

      const paging = data?.paging;
      if (paging?.current != null && paging?.total != null) {
        if (Number(paging.current) >= Number(paging.total)) {
          break;
        }
      } else {
        // Without paging, only first page is defined behaviour.
        break;
      }

      page += 1;
      await this.sleep(API_SPORTS_CONFIG.requestDelayMs);
    }

    return {
      get: last?.get,
      parameters: {
        ...(typeof last?.parameters === 'object' && last.parameters ? last.parameters : {}),
        allPagesMerged: true,
        ...(omitPage ? { note: 'date-range query: single request without page param' } : {}),
      },
      errors: last?.errors ?? [],
      results: combined.length,
      paging: { current: 1, total: 1 },
      response: combined,
      meta: { allPages: true, pagesFetched: page, maxPagesCap: maxPages },
    };
  }

  /** Live fixtures in one call (`GET /fixtures?live=all`) — includes events per API-Football v3 behaviour. */
  async discoverLiveFixtures(): Promise<any> {
    return this.http.get('/fixtures', { live: 'all' } as any);
  }

  /**
   * Persist all globally live fixtures from `GET /fixtures?live=all` (one API request).
   * Skips rows when local competition/season/teams are not imported yet.
   */
  async importLiveFixtures(
    options?: ImportLiveFixturesOptions,
  ): Promise<{
    created: number;
    updated: number;
    skipped: number;
    apiRequests: number;
    liveCount: number;
    errors: string[];
    events: ApiSportsFixtureEventsSyncResult & { eventApiRequests: number };
  }> {
    const errors: string[] = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let apiRequests = 0;
    let eventApiRequests = 0;
    const events: ApiSportsFixtureEventsSyncResult = {
      goals: 0,
      cards: 0,
      substitutions: 0,
      skipped: 0,
    };
    const syncEvents = options?.syncEvents !== false;
    const maxEventFetchRequests = Math.max(0, Number(options?.maxEventFetchRequests ?? 5) || 5);
    let eventFetchBudget = maxEventFetchRequests;

    const emptyResult = () => ({
      created,
      updated,
      skipped,
      apiRequests,
      liveCount: 0,
      errors,
      events: { ...events, eventApiRequests },
    });

    let payload: any;
    try {
      payload = await this.discoverLiveFixtures();
      apiRequests = 1;
    } catch (e: any) {
      errors.push(`live fixtures: ${e?.message ?? e}`);
      return emptyResult();
    }

    const rows = Array.isArray(payload?.response) ? payload.response : [];
    if (rows.length === 0) {
      return emptyResult();
    }

    const groups = new Map<string, any[]>();
    for (const row of rows) {
      const leagueId = row?.league?.id;
      const seasonYear = row?.league?.season;
      if (leagueId == null || seasonYear == null) {
        skipped += 1;
        continue;
      }
      const key = `${Number(leagueId)}:${Number(seasonYear)}`;
      const bucket = groups.get(key) ?? [];
      bucket.push(row);
      groups.set(key, bucket);
    }

    const concurrency = Math.max(
      1,
      Math.min(64, Math.floor(Number(options?.fixtureUpsertConcurrency ?? 16) || 16)),
    );

    for (const [key, groupRows] of groups) {
      const [leagueApiIdStr, seasonYearStr] = key.split(':');
      const leagueApiId = Number(leagueApiIdStr);
      const seasonYear = Number(seasonYearStr);

      const competition = await this.findCompetitionByApiSportsLeagueId(leagueApiId);
      if (!competition?.id) {
        skipped += groupRows.length;
        continue;
      }

      const seasonRow = await this.findSeasonByYearBounds(seasonYear, seasonYear + 1);
      if (!seasonRow?.id) {
        skipped += groupRows.length;
        continue;
      }

      const fixturesForSeason = await this.fixtureService.getQuery({
        where: { competitionId: competition.id, seasonId: seasonRow.id } as any,
      });
      const fixtureByApisportsExternalId = new Map<string, any>();
      for (const f of fixturesForSeason ?? []) {
        const ext = this.getProviderExternalId(f?.metadata);
        if (!ext) continue;
        fixtureByApisportsExternalId.set(ext, f);
      }

      const ctx: ApiSportsFixtureImportContext = {
        competitionId: competition.id,
        seasonId: seasonRow.id,
        fixtureByApisportsExternalId,
        correlationPool: [...(fixturesForSeason ?? [])],
        stadiumCache: { rows: null },
        exclusiveTail: Promise.resolve(),
      };

      const rowOutcomes = new Array<'created' | 'updated' | 'skipped'>(groupRows.length).fill('skipped');
      const eventOutcomes: ApiSportsFixtureEventsSyncResult[] = [];
      await this.runPool(groupRows, concurrency, async (row, ix) => {
        try {
          rowOutcomes[ix] = await this.upsertFixtureFromApiSportsRow(row, ctx);
          if (!syncEvents) return;

          const apiFixtureId = row?.fixture?.id != null ? Number(row.fixture.id) : null;
          if (!apiFixtureId) return;

          const localFixture = ctx.fixtureByApisportsExternalId.get(String(apiFixtureId));
          if (!localFixture?.id) return;

          let eventRows: ApiSportsFixtureEvent[] = Array.isArray(row.events) ? row.events : [];
          if (eventRows.length === 0 && eventFetchBudget > 0) {
            const statusShort = String(row?.fixture?.status?.short ?? '').toUpperCase();
            const liveLike = ['LIVE', '1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT'].includes(statusShort);
            if (liveLike) {
              try {
                const fetched = await this.discoverFixtureEvents(apiFixtureId);
                eventApiRequests += 1;
                eventFetchBudget -= 1;
                eventRows = Array.isArray(fetched?.response) ? fetched.response : [];
              } catch (e: any) {
                errors.push(`fixture ${apiFixtureId} events: ${e?.message ?? e}`);
              }
            }
          }

          if (eventRows.length === 0) return;

          eventOutcomes[ix] = await this.syncApiSportsEventsForFixture(
            localFixture.id,
            apiFixtureId,
            eventRows,
          );
        } catch (e: any) {
          errors.push(`live fixture row: ${e?.message ?? e}`);
          rowOutcomes[ix] = 'skipped';
        }
      });

      for (const outcome of rowOutcomes) {
        if (outcome === 'created') created += 1;
        else if (outcome === 'updated') updated += 1;
        else skipped += 1;
      }

      for (const ev of eventOutcomes) {
        if (!ev) continue;
        events.goals += ev.goals;
        events.cards += ev.cards;
        events.substitutions += ev.substitutions;
        events.skipped += ev.skipped;
      }
    }

    apiRequests += eventApiRequests;

    this.logger.log(
      `importLiveFixtures: ${rows.length} live upstream — +${created} ~${updated} skipped ${skipped} (${apiRequests} req); events +${events.goals}g +${events.cards}c +${events.substitutions}s`,
    );

    return {
      created,
      updated,
      skipped,
      apiRequests,
      liveCount: rows.length,
      errors,
      events: { ...events, eventApiRequests },
    };
  }

  /** Proxies `GET /fixtures/events?fixture=` for a single match. */
  async discoverFixtureEvents(fixtureApiId: number): Promise<any> {
    return this.http.get('/fixtures/events', { fixture: String(fixtureApiId) } as any);
  }

  /** Persist API-Sports timeline incidents into local goal/card/substitution tables. */
  async syncApiSportsEventsForFixture(
    localFixtureId: number,
    fixtureApiId: number,
    rawEvents: ApiSportsFixtureEvent[],
  ): Promise<ApiSportsFixtureEventsSyncResult> {
    const result: ApiSportsFixtureEventsSyncResult = {
      goals: 0,
      cards: 0,
      substitutions: 0,
      skipped: 0,
    };

    for (const event of rawEvents) {
      const type = String(event.type ?? '').toLowerCase();
      try {
        if (type === 'goal') {
          const ok = await this.syncApiSportsGoal(localFixtureId, fixtureApiId, event);
          if (ok) result.goals += 1;
          else result.skipped += 1;
        } else if (type === 'card') {
          const ok = await this.syncApiSportsCard(localFixtureId, fixtureApiId, event);
          if (ok) result.cards += 1;
          else result.skipped += 1;
        } else if (type === 'subst') {
          const ok = await this.syncApiSportsSubstitution(localFixtureId, fixtureApiId, event);
          if (ok) result.substitutions += 1;
          else result.skipped += 1;
        }
      } catch (e: any) {
        result.skipped += 1;
        this.logger.debug(
          `Skipped API-Sports event for fixture ${localFixtureId}: ${e?.message ?? e}`,
        );
      }
    }

    const [fixture] = await this.fixtureService.getQuery({ where: { id: localFixtureId } as any });
    if (fixture?.id) {
      await this.fixtureService.update(localFixtureId, {
        id: localFixtureId,
        metadata: deepMergeEntityMetadata((fixture.metadata ?? {}) as Record<string, unknown>, {
          apisports: {
            eventsLastSyncedAt: new Date().toISOString(),
            eventsCount: rawEvents.length,
          },
        }) as any,
      } as any);
    }

    return result;
  }

  private apiSportsEventExternalId(
    fixtureApiId: number,
    event: ApiSportsFixtureEvent,
  ): string {
    const elapsed = event.time?.elapsed ?? 0;
    const extra = event.time?.extra ?? 0;
    const type = event.type ?? 'unknown';
    const playerId = event.player?.id ?? 0;
    const detail = event.detail ?? '';
    return `${fixtureApiId}:${elapsed}:${extra}:${type}:${playerId}:${detail}`;
  }

  private async findIncidentByApiSportsExternalId(
    kind: 'goal' | 'card' | 'substitution',
    externalId: string,
    fixtureId: number,
  ): Promise<any | null> {
    let rows: any[] = [];
    if (kind === 'goal') {
      rows = await this.goalService.getQuery({ where: { fixtureId } as any });
    } else if (kind === 'card') {
      rows = await this.cardService.getQuery({ where: { fixtureId } as any });
    } else {
      rows = await this.substitutionService.getQuery({ where: { fixtureId } as any });
    }
    return (
      rows.find((row: any) => {
        const ext = row?.metadata?.providers?.[PROVIDER_KEY]?.externalId;
        return ext != null && String(ext) === externalId;
      }) ?? null
    );
  }

  private eventMinute(event: ApiSportsFixtureEvent): number {
    const elapsed = Number(event.time?.elapsed ?? 0);
    const extra = Number(event.time?.extra ?? 0);
    if (!Number.isFinite(elapsed)) return 0;
    if (extra > 0) return elapsed + extra;
    return elapsed;
  }

  private mapApiSportsCardType(detail: string | undefined): CardType | null {
    const d = String(detail ?? '').toLowerCase();
    if (!d) return null;
    if (d.includes('red')) return CardType.RED;
    if (d.includes('yellow')) return CardType.YELLOW;
    return null;
  }

  private async syncApiSportsGoal(
    localFixtureId: number,
    fixtureApiId: number,
    event: ApiSportsFixtureEvent,
  ): Promise<boolean> {
    const externalId = this.apiSportsEventExternalId(fixtureApiId, event);
    if (await this.findIncidentByApiSportsExternalId('goal', externalId, localFixtureId)) {
      return true;
    }

    const scorerApiId = event.player?.id != null ? Number(event.player.id) : null;
    if (!scorerApiId) return false;

    const scorer = await this.findLocalPlayerByApiSportsId(scorerApiId);
    const teamApiId = event.team?.id != null ? Number(event.team.id) : null;
    const team = teamApiId ? await this.findLocalTeamByApiSportsId(teamApiId) : null;
    if (!scorer?.id || !team?.id) return false;

    let assistantId: number | undefined;
    const assistApiId = event.assist?.id != null ? Number(event.assist.id) : null;
    if (assistApiId) {
      const assistant = await this.findLocalPlayerByApiSportsId(assistApiId);
      assistantId = assistant?.id;
    }

    const detail = String(event.detail ?? '');
    await this.goalService.create({
      fixtureId: localFixtureId,
      scorerId: scorer.id,
      assistantId,
      teamId: team.id,
      minute: this.eventMinute(event),
      penalty: detail.toLowerCase().includes('penalty'),
      ownGoal: detail.toLowerCase().includes('own goal'),
      metadata: {
        source: 'api-sports',
        detail,
        providers: { [PROVIDER_KEY]: { externalId } },
        lastSync: new Date().toISOString(),
      },
    } as any);

    return true;
  }

  private async syncApiSportsCard(
    localFixtureId: number,
    fixtureApiId: number,
    event: ApiSportsFixtureEvent,
  ): Promise<boolean> {
    const externalId = this.apiSportsEventExternalId(fixtureApiId, event);
    if (await this.findIncidentByApiSportsExternalId('card', externalId, localFixtureId)) {
      return true;
    }

    const playerApiId = event.player?.id != null ? Number(event.player.id) : null;
    if (!playerApiId) return false;

    const player = await this.findLocalPlayerByApiSportsId(playerApiId);
    const teamApiId = event.team?.id != null ? Number(event.team.id) : null;
    const team = teamApiId ? await this.findLocalTeamByApiSportsId(teamApiId) : null;
    const cardType = this.mapApiSportsCardType(event.detail);
    if (!player?.id || !team?.id || !cardType) return false;

    await this.cardService.create({
      fixtureId: localFixtureId,
      playerId: player.id,
      teamId: team.id,
      type: cardType,
      minute: this.eventMinute(event),
      metadata: {
        source: 'api-sports',
        detail: event.detail,
        providers: { [PROVIDER_KEY]: { externalId } },
        lastSync: new Date().toISOString(),
      },
    } as any);

    return true;
  }

  private async syncApiSportsSubstitution(
    localFixtureId: number,
    fixtureApiId: number,
    event: ApiSportsFixtureEvent,
  ): Promise<boolean> {
    const externalId = this.apiSportsEventExternalId(fixtureApiId, event);
    if (await this.findIncidentByApiSportsExternalId('substitution', externalId, localFixtureId)) {
      return true;
    }

    const playerOutApiId = event.player?.id != null ? Number(event.player.id) : null;
    const playerInApiId = event.assist?.id != null ? Number(event.assist.id) : null;
    if (!playerOutApiId || !playerInApiId) return false;

    const playerOut = await this.findLocalPlayerByApiSportsId(playerOutApiId);
    const playerIn = await this.findLocalPlayerByApiSportsId(playerInApiId);
    const teamApiId = event.team?.id != null ? Number(event.team.id) : null;
    const team = teamApiId ? await this.findLocalTeamByApiSportsId(teamApiId) : null;
    if (!playerOut?.id || !playerIn?.id || !team?.id) return false;

    await this.substitutionService.create({
      fixtureId: localFixtureId,
      playerOutId: playerOut.id,
      playerInId: playerIn.id,
      teamId: team.id,
      minute: this.eventMinute(event),
      metadata: {
        source: 'api-sports',
        detail: event.detail,
        providers: { [PROVIDER_KEY]: { externalId } },
        lastSync: new Date().toISOString(),
      },
    } as any);

    return true;
  }


  /** One stadium load shared per import batch; creates are keyed and serialized across parallel worker tasks. */
  private parseVenueCapacity(venue: any): number | undefined {
    const raw = venue?.capacity;
    if (raw == null || raw === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
  }

  private buildVenueMetadata(
    venue: any,
    vid: number | null,
    existing?: Record<string, unknown>,
  ): Record<string, unknown> {
    const prevApisports = (existing?.apisports as Record<string, unknown> | undefined) ?? {};
    const apisports: Record<string, unknown> = {
      ...prevApisports,
      ...(vid != null ? { venueId: vid } : {}),
    };
    if (venue?.image != null && String(venue.image).trim() !== '') {
      apisports.image = String(venue.image).trim();
    }
    if (venue?.address != null && String(venue.address).trim() !== '') {
      apisports.address = String(venue.address).trim();
    }
    if (venue?.city != null && String(venue.city).trim() !== '') {
      apisports.city = String(venue.city).trim();
    }
    if (venue?.capacity != null && venue.capacity !== '') {
      apisports.capacity = venue.capacity;
    }

    const prevProviders = (existing?.providers as Record<string, unknown> | undefined) ?? {};
    return {
      ...(existing ?? {}),
      source: existing?.source ?? 'api-sports',
      apisports,
      ...(vid != null
        ? {
            providers: {
              ...prevProviders,
              [PROVIDER_KEY]: { externalId: String(vid) },
            },
          }
        : { providers: prevProviders }),
    };
  }

  private async patchStadiumVenueFacts(stadiumId: number, venue: any, existingRow?: any): Promise<void> {
    const capacity = this.parseVenueCapacity(venue);
    const vid = venue?.id != null ? Number(venue.id) : null;
    const mergedMetadata = this.buildVenueMetadata(venue, vid, existingRow?.metadata);
    const patch: Record<string, unknown> = { id: stadiumId, metadata: mergedMetadata };
    if (capacity != null) patch.capacity = capacity;
    await this.stadiumService.update(stadiumId, patch as any);
    if (existingRow) Object.assign(existingRow, patch);
  }

  private async ensureStadiumFromApiVenueForImport(
    cache: StadiumImportCache,
    venue: any,
    countryFallback: string,
  ): Promise<number> {
    const country = countryFallback && countryFallback !== '' ? countryFallback : 'Unknown';
    const vid = venue?.id != null ? Number(venue.id) : null;
    const vname = venue?.name != null ? String(venue.name).trim() : '';
    const venueKey =
      vid != null && Number.isFinite(vid) ? `id:${vid}` : `name:${country}:${vname || '_'}`;

    const previousLock = this.stadiumVenueEnsureTailByKey.get(venueKey) ?? Promise.resolve();

    let stadiumId = NaN;

    const currentLock = previousLock.then(async () => {
      if (!cache.rows) {
        cache.rows = await this.stadiumService.getQuery({});
      }
      const rows = cache.rows!;
      if (vid) {
        const byProv = rows.find(
          (s) => String(s?.metadata?.providers?.[PROVIDER_KEY]?.externalId ?? '') === String(vid),
        );
        if (byProv?.id != null) {
          stadiumId = byProv.id;
          await this.patchStadiumVenueFacts(stadiumId, venue, byProv);
          return;
        }
      }
      if (vname) {
        const byName = rows.find((s) => String(s?.name ?? '').trim() === vname);
        if (byName?.id != null) {
          stadiumId = byName.id;
          await this.patchStadiumVenueFacts(stadiumId, venue, byName);
          return;
        }
      }
      const name = vname || 'Unknown venue';
      const vidForCreate = vid != null && Number.isFinite(vid) ? vid : null;
      const capacity = this.parseVenueCapacity(venue);
      const created = await this.stadiumService.create({
        name,
        country,
        ...(capacity != null ? { capacity } : {}),
        metadata: this.buildVenueMetadata(venue, vidForCreate),
      } as any);
      rows.push(created);
      stadiumId = created.id;
    });

    this.stadiumVenueEnsureTailByKey.set(venueKey, currentLock);
    try {
      await currentLock;
      return stadiumId;
    } finally {
      if (this.stadiumVenueEnsureTailByKey.get(venueKey) === currentLock) {
        this.stadiumVenueEnsureTailByKey.delete(venueKey);
      }
    }
  }

  private mapApiFixtureStatus(short: string | undefined): FixtureStatus {
    const s = (short ?? 'NS').toUpperCase();
    if (['FT', 'AET', 'PEN', 'AWD'].includes(s)) return FixtureStatus.COMPLETED;
    if (['NS', 'TBD'].includes(s)) return FixtureStatus.SCHEDULED;
    if (['LIVE', '1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT'].includes(s)) return FixtureStatus.LIVE;
    if (s === 'PST') return FixtureStatus.POSTPONED;
    if (['CANC', 'ABD'].includes(s)) return FixtureStatus.CANCELLED;
    if (s === 'SUSP') return FixtureStatus.SUSPENDED;
    return FixtureStatus.SCHEDULED;
  }

  private mapApiFixtureStage(round: string | undefined): FixtureStage {
    const r = (round ?? '').toLowerCase();
    if (r.includes('final') && !r.includes('semi') && !r.includes('quarter')) return FixtureStage.FINAL;
    if (r.includes('semi')) return FixtureStage.SEMI_FINAL;
    if (r.includes('quarter')) return FixtureStage.QUARTER_FINAL;
    if (r.includes('round of 16') || r === '16') return FixtureStage.LAST_16;
    if (r.includes('round of 32') || r === '32') return FixtureStage.LAST_32;
    if (r.includes('group')) return FixtureStage.GROUP_STAGE;
    if (r.includes('3rd') || r.includes('third')) return FixtureStage.THIRD_PLACE;
    if (r.includes('play-off') || r.includes('playoff')) return FixtureStage.PLAY_OFF;
    return FixtureStage.LEAGUE;
  }

  /**
   * Build `competitionStanding` positions from persisted fixtures (+0 HTTP). Cups / multi-groups are flattened into one ladder.
   */
  private async recomputeCompetitionStandingFromFixtures(
    competitionId: number,
    seasonId: number,
  ): Promise<number> {
    const fixtures = await this.fixtureService.getQuery({
      where: { competitionId, seasonId } as any,
    });
    type Acc = {
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    };
    const statsByTeamId = new Map<number, Acc>();
    const ensureBucket = (teamId: number): Acc => {
      const ex = statsByTeamId.get(teamId);
      if (ex) return ex;
      const init: Acc = {
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      };
      statsByTeamId.set(teamId, init);
      return init;
    };

    for (const fixture of fixtures ?? []) {
      let homeScore: number;
      let awayScore: number;
      const fh = fixture.homeScore;
      const fa = fixture.awayScore;
      if (
        fh !== undefined &&
        fh !== null &&
        fa !== undefined &&
        fa !== null &&
        Number.isFinite(Number(fh)) &&
        Number.isFinite(Number(fa))
      ) {
        homeScore = Number(fh);
        awayScore = Number(fa);
      } else {
        const meta: any = fixture?.metadata ?? {};
        homeScore =
          typeof meta.homeScore === 'number' ? meta.homeScore : Number(meta.homeScore);
        awayScore =
          typeof meta.awayScore === 'number' ? meta.awayScore : Number(meta.awayScore);
      }
      const hasScores = Number.isFinite(homeScore) && Number.isFinite(awayScore);
      if (!fixture?.homeTeamId || !fixture?.awayTeamId || !hasScores) continue;

      const home = ensureBucket(fixture.homeTeamId);
      const away = ensureBucket(fixture.awayTeamId);

      home.played += 1;
      away.played += 1;
      home.goalsFor += homeScore;
      home.goalsAgainst += awayScore;
      away.goalsFor += awayScore;
      away.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        home.wins += 1;
        away.losses += 1;
        home.points += 3;
      } else if (homeScore < awayScore) {
        away.wins += 1;
        home.losses += 1;
        away.points += 3;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    }

    const joins = await this.teamCompetitionSeasonService.getQuery({
      where: { competitionId, seasonId } as any,
    });

    type Row = { teamCompetitionSeasonId: number; teamId: number; stats: Acc };
    const table: Row[] = (joins ?? []).map((j: any) => ({
      teamCompetitionSeasonId: j.id,
      teamId: j.teamId,
      stats:
        statsByTeamId.get(j.teamId) ?? {
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        },
    }));

    table.sort((a, b) => {
      if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
      const gda = a.stats.goalsFor - a.stats.goalsAgainst;
      const gdb = b.stats.goalsFor - b.stats.goalsAgainst;
      if (gdb !== gda) return gdb - gda;
      if (b.stats.goalsFor !== a.stats.goalsFor) return b.stats.goalsFor - a.stats.goalsFor;
      return Number(a.teamId) - Number(b.teamId);
    });

    let processed = 0;
    for (let idx = 0; idx < table.length; idx += 1) {
      const { teamCompetitionSeasonId, stats } = table[idx];
      const position = idx + 1;
      const goalDifference = stats.goalsFor - stats.goalsAgainst;
      const payload: CreateCompetitionStandingDTO = {
        teamCompetitionSeasonId,
        position,
        played: stats.played,
        won: stats.wins,
        drawn: stats.draws,
        lost: stats.losses,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalDifference,
        points: stats.points,
        metadata: {
          source: 'computed-from-fixtures',
          lastComputedAt: new Date().toISOString(),
          provider: PROVIDER_KEY,
        } as any,
      } as any;

      const existing = await this.findExistingStanding(teamCompetitionSeasonId);
      if (existing) {
        await this.competitionStandingService.upsertByTeamCompetitionSeasonId(
          teamCompetitionSeasonId,
          {
            ...payload,
            form: existing.form?.trim() || payload.form,
            metadata: deepMergeEntityMetadata(
              (existing.metadata ?? {}) as Record<string, unknown>,
              (payload.metadata ?? {}) as Record<string, unknown>,
            ) as any,
          } as CreateCompetitionStandingDTO,
        );
      } else {
        await this.competitionStandingService.create(payload);
      }
      processed += 1;
    }

    return processed;
  }

  /** Prefer `goals`, then full-time `score`, when API returns numeric finals (nullable before kickoff). */
  private extractApiSportsFixtureScores(row: any): { homeScore?: number; awayScore?: number } {
    const g = row?.goals;
    if (g && typeof g === 'object') {
      const h = g.home != null ? Number(g.home) : NaN;
      const a = g.away != null ? Number(g.away) : NaN;
      if (Number.isFinite(h) && Number.isFinite(a)) {
        return { homeScore: h, awayScore: a };
      }
    }
    const ft = row?.score?.fulltime;
    if (ft && typeof ft === 'object') {
      const h = ft.home != null ? Number(ft.home) : NaN;
      const a = ft.away != null ? Number(ft.away) : NaN;
      if (Number.isFinite(h) && Number.isFinite(a)) {
        return { homeScore: h, awayScore: a };
      }
    }
    return {};
  }

  private async upsertFixtureFromApiSportsRow(
    row: any,
    ctx: ApiSportsFixtureImportContext,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const competitionId = ctx.competitionId;
    const seasonId = ctx.seasonId;

    const fx = row?.fixture;
    const league = row?.league;
    const teams = row?.teams;
    const apiId = fx?.id != null ? Number(fx.id) : null;
    if (!apiId) return 'skipped';

    const homeApi = teams?.home?.id != null ? Number(teams.home.id) : null;
    const awayApi = teams?.away?.id != null ? Number(teams.away.id) : null;
    if (!homeApi || !awayApi) return 'skipped';

    const home = await this.findLocalTeamByApiSportsId(homeApi);
    const away = await this.findLocalTeamByApiSportsId(awayApi);
    if (!home?.id || !away?.id) return 'skipped';

    const leagueCountry = league?.country != null ? String(league.country) : 'Unknown';
    const stadiumId = await this.ensureStadiumFromApiVenueForImport(ctx.stadiumCache, fx?.venue, leagueCountry);

    const date = fx?.date ? new Date(fx.date) : null;
    if (!date || Number.isNaN(date.getTime())) return 'skipped';

    const status = this.mapApiFixtureStatus(fx?.status?.short);
    const stage = this.mapApiFixtureStage(league?.round);
    const attendanceRaw = fx?.attendance ?? row?.attendance;
    const attendance =
      attendanceRaw != null && !Number.isNaN(Number(attendanceRaw)) ? Number(attendanceRaw) : undefined;

    const scorePair = this.extractApiSportsFixtureScores(row);
    const resultFields = extractApiSportsFixtureResult(row, home.id, away.id);

    const meta = {
      source: 'api-sports',
      apisports: {
        fixtureId: apiId,
        lastImportedAt: new Date().toISOString(),
      },
      providers: { [PROVIDER_KEY]: { externalId: String(apiId) } },
      leagueSnapshot: league ? { id: league.id, name: league.name, round: league.round } : undefined,
      goals: row?.goals,
      score: row?.score,
      homeScore: scorePair.homeScore,
      awayScore: scorePair.awayScore,
      ...resultFields,
    };

    const payload: any = {
      date,
      homeTeamId: home.id,
      awayTeamId: away.id,
      competitionId,
      seasonId,
      stadiumId,
      status,
      stage,
      attendance,
      ...scorePair,
      metadata: meta,
    };

    let outcome!: 'created' | 'updated';
    await this.enqueueFixtureImportExclusive(ctx, async () => {
      const apiKey = String(apiId);
      let existing = ctx.fixtureByApisportsExternalId.get(apiKey) ?? null;
      if (!existing) {
        existing = this.pickCorrelationCandidateFromPool(ctx.correlationPool, {
          homeTeamId: home.id,
          awayTeamId: away.id,
          scheduledAtMs: date.getTime(),
          incomingScores: scorePair,
          apiFixtureId: apiId,
        });
        if (existing) {
          this.logger.debug(
            `Cross-provider correlate: API-Sports fixture ${apiId} → fixture ${existing.id} (±${FIXTURE_CORRELATION_MAX_MS / 3_600_000}h kickoff window)`,
          );
        }
      }

      if (existing) {
        const prevMeta =
          existing.metadata && typeof existing.metadata === 'object'
            ? { ...(existing.metadata as object) }
            : {};
        const mergedMeta = this.mergeApisportsFixtureMetadata(prevMeta as Record<string, any>, meta);
        await this.fixtureService.update(existing.id, {
          ...payload,
          id: existing.id,
          metadata: mergedMeta,
        } as any);
        ctx.fixtureByApisportsExternalId.set(apiKey, {
          ...existing,
          ...payload,
          id: existing.id,
          metadata: mergedMeta,
        });
        outcome = 'updated';
        return;
      }

      const created = await this.fixtureService.create(payload);
      ctx.fixtureByApisportsExternalId.set(apiKey, created);
      outcome = 'created';
    });

    await Promise.all([
      this.ensureTeamCompetitionSeasonId(home.id, competitionId, seasonId),
      this.ensureTeamCompetitionSeasonId(away.id, competitionId, seasonId),
    ]);

    return outcome;
  }

  /**
   * Idempotent import of fixtures for `GET /fixtures?league=&season=&from=&to=` into `fixture` rows.
   * **Pagination:** API-Football does not allow `page` with `from`+`to`; the provider returns the full window in **one request**
   * (options `allPages` / `maxPages` are ignored — kept on the DTO for backward compatibility only).
   * Primary key: `metadata.providers.apisports.externalId`. When missing locally, merges into another row that matches
   * competition + season + home + away within a 6-hour kickoff window and (when known) agreeing full-time scores.
   * Requires local `competition` (API league id) and `season` (yearStart=seasonYear, yearEnd=seasonYear+1), and teams with provider ids.
   *
   * **Performance:** fixture upserts use bounded parallelism (`fixtureUpsertConcurrency`). One preload of season fixtures avoids N full-table scans;
   * stadium rows are cached and venue creates are keyed. **Standings:** set `syncStandingsAfter` for `GET /standings` (+1 request), `recomputeStandingsFromFixturesAfter` for a pure local ladder (+0 request).
   * If both flags are true, those two steps run concurrently; both write `competitionStanding` rows (ordering is not deterministic).
   * **Primary venues:** set `syncPrimaryVenuesAfter` for `GET /teams` (club `venue` → `teamStadium`, not match venue).
   */
  async importFixturesFromLeagueWindow(
    options: ImportFixturesFromLeagueWindowOptions,
  ): Promise<{
    created: number;
    updated: number;
    skipped: number;
    apiRequests: number;
    standingsApiRequests: number;
    standingsProcessed: number;
    standingsRecomputed: number;
    primaryVenuesLinked: number;
    primaryVenuesSkipped: number;
    primaryVenuesApiRequests: number;
    fixtureStatsOk: number;
    fixtureStatsSkipped: number;
    fixtureStatsRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let apiRequests = 0;
    const maxReq = Math.max(1, options.maxRequests ?? 50);

    const competition = await this.findCompetitionByApiSportsLeagueId(options.leagueApiId);
    if (!competition?.id) {
      return {
        created: 0,
        updated: 0,
        skipped: 0,
        apiRequests: 0,
        standingsApiRequests: 0,
        standingsProcessed: 0,
        standingsRecomputed: 0,
        primaryVenuesLinked: 0,
        primaryVenuesSkipped: 0,
        primaryVenuesApiRequests: 0,
        fixtureStatsOk: 0,
        fixtureStatsSkipped: 0,
        fixtureStatsRequests: 0,
        errors: [`No local competition for API league ${options.leagueApiId}`],
      };
    }

    const seasonRow = await this.findSeasonByYearBounds(options.seasonYear, options.seasonYear + 1);
    if (!seasonRow?.id) {
      return {
        created: 0,
        updated: 0,
        skipped: 0,
        apiRequests: 0,
        standingsApiRequests: 0,
        standingsProcessed: 0,
        standingsRecomputed: 0,
        primaryVenuesLinked: 0,
        primaryVenuesSkipped: 0,
        primaryVenuesApiRequests: 0,
        fixtureStatsOk: 0,
        fixtureStatsSkipped: 0,
        fixtureStatsRequests: 0,
        errors: [
          `No local season for ${options.seasonYear}-${options.seasonYear + 1}; import leagues/seasons first`,
        ],
      };
    }

    const fixturesForSeason = await this.fixtureService.getQuery({
      where: { competitionId: competition.id, seasonId: seasonRow.id } as any,
    });
    const fixtureByApisportsExternalId = new Map<string, any>();
    for (const f of fixturesForSeason ?? []) {
      const ext = this.getProviderExternalId(f?.metadata);
      if (!ext) continue;
      fixtureByApisportsExternalId.set(ext, f);
    }
    const ctx: ApiSportsFixtureImportContext = {
      competitionId: competition.id,
      seasonId: seasonRow.id,
      fixtureByApisportsExternalId,
      correlationPool: [...(fixturesForSeason ?? [])],
      stadiumCache: { rows: null },
      exclusiveTail: Promise.resolve(),
    };

    const baseQuery: Record<string, string | undefined> = {
      league: String(options.leagueApiId),
      season: String(options.seasonYear),
      from: options.from,
      to: options.to,
    };

    const rows: any[] = [];
    let lastFixturesPayload: any = null;

    /** API-Football rejects `page` with `from` + `to` (+ league/season): one unpaginated request only. */
    if (apiRequests < maxReq) {
      const params = this.cleanFixturesQuery({ ...baseQuery });
      let data: any;
      try {
        data = await this.http.get('/fixtures', params as any);
        apiRequests += 1;
        lastFixturesPayload = data;
      } catch (e: any) {
        errors.push(`fixtures: ${e?.message ?? e}`);
      }

      if (data !== undefined) {
        const apiErr = data.errors;
        if (
          apiErr != null &&
          (Array.isArray(apiErr)
            ? apiErr.length > 0
            : typeof apiErr === 'object' &&
              Object.keys(apiErr).length > 0 &&
              (!Array.isArray(data.response) || data.response.length === 0))
        ) {
          errors.push(`API-Sports fixtures: ${JSON.stringify(apiErr)}`);
        } else {
          const chunk = Array.isArray(data?.response) ? data.response : [];
          rows.push(...chunk);
        }
      }
    }

    if (rows.length === 0 && errors.length === 0) {
      errors.push(
        `API-Sports returned 0 fixtures for league=${options.leagueApiId} season=${options.seasonYear} ` +
          `${options.from}–${options.to}. Typical causes: wrong season integer (must be campaign start year), ` +
          `date range outside that season on your plan, or no schedule in the provider yet. ` +
          `Compare GET /api-sports/discover/fixtures with the same league/season/from/to; ` +
          `GET /api-sports/discover/league/${options.leagueApiId} to see which seasons have coverage.`,
      );
      try {
        const up = lastFixturesPayload ?? {};
        const echo = JSON.stringify({
          upstreamResults: up.results,
          upstreamParameters: up.parameters ?? up.get ?? null,
          upstreamErrors: up.errors ?? null,
          responseIsArray: Array.isArray(up.response),
          responseLength: Array.isArray(up.response) ? up.response.length : null,
          topLevelKeys:
            up && typeof up === 'object' && !Array.isArray(up)
              ? Object.keys(up as object).slice(0, 24).join(',')
              : typeof up,
        });
        errors.push(`Upstream echo (first page): ${echo}`);
      } catch {
        errors.push(`Upstream echo: (could not stringify raw /fixtures payload)`);
      }
    }

    const concurrency = Math.max(
      1,
      Math.min(64, Math.floor(Number(options.fixtureUpsertConcurrency ?? 16) || 16)),
    );
    const rowOutcomes = new Array<'created' | 'updated' | 'skipped'>(rows.length).fill('skipped');
    await this.runPool(rows, concurrency, async (row, ix) => {
      try {
        rowOutcomes[ix] = await this.upsertFixtureFromApiSportsRow(row, ctx);
      } catch (e: any) {
        errors.push(`fixture row: ${e?.message ?? e}`);
        rowOutcomes[ix] = 'skipped';
      }
    });
    for (const r of rowOutcomes) {
      if (r === 'created') created += 1;
      else if (r === 'updated') updated += 1;
      else skipped += 1;
    }

    let standingsApiRequests = 0;
    let standingsProcessed = 0;
    let standingsRecomputed = 0;
    const wantApi = options.syncStandingsAfter === true && competition?.id && seasonRow?.id;
    const wantLocal =
      options.recomputeStandingsFromFixturesAfter === true && competition?.id && seasonRow?.id;

    if (wantApi || wantLocal) {
      await Promise.all([
        (async () => {
          if (!wantApi) return;
          standingsApiRequests = 1;
          const st = await this.syncStandings([
            {
              league: options.leagueApiId,
              season: options.seasonYear,
              competitionId: competition!.id,
              seasonId: seasonRow!.id,
            },
          ]);
          standingsProcessed = st.processed;
          for (const e of st.errors) {
            errors.push(`standings: ${e}`);
          }
        })(),
        (async () => {
          if (!wantLocal) return;
          try {
            standingsRecomputed = await this.recomputeCompetitionStandingFromFixtures(
              competition!.id,
              seasonRow!.id,
            );
          } catch (e: any) {
            errors.push(`standingsLocal: ${e?.message ?? e}`);
          }
        })(),
      ]);
    }

    let primaryVenuesLinked = 0;
    let primaryVenuesSkipped = 0;
    let primaryVenuesApiRequests = 0;
    if (options.syncPrimaryVenuesAfter === true) {
      const pv = await this.syncPrimaryVenuesFromTeamsLeagueSeason({
        league: options.leagueApiId,
        season: options.seasonYear,
        maxPages: options.primaryVenuesMaxPages,
        maxRequests: options.primaryVenuesMaxRequests,
      });
      primaryVenuesLinked = pv.linked;
      primaryVenuesSkipped = pv.skipped;
      primaryVenuesApiRequests = pv.requests;
      for (const e of pv.errors) {
        errors.push(`primaryVenues: ${e}`);
      }
    }

    let fixtureStatsOk = 0;
    let fixtureStatsSkipped = 0;
    let fixtureStatsRequests = 0;
    if (options.syncStatsAfter === true) {
      const maxStatsReq = options.syncStatsMaxRequests ?? 20;
      const allUpsertedIds = Array.from(ctx.fixtureByApisportsExternalId.values()).map((f) => f.id as number);
      for (const localFixtureId of allUpsertedIds) {
        if (fixtureStatsRequests >= maxStatsReq) break;
        fixtureStatsRequests++;
        try {
          const result = await this.syncFixtureStats(localFixtureId);
          if (result === 'ok') fixtureStatsOk++;
          else fixtureStatsSkipped++;
        } catch (e) {
          errors.push(`fixtureStats ${localFixtureId}: ${String(e)}`);
        }
      }
    }

    this.logger.log(
      `importFixturesFromLeagueWindow: league ${options.leagueApiId} ${options.from}–${options.to} — +${created} ~${updated} skipped ${skipped} (${apiRequests} fixture req, concurrency ${concurrency})` +
        (wantApi ? `, standings ${standingsProcessed} (${standingsApiRequests} req)` : '') +
        (wantLocal ? `, standingsRecomputed=${standingsRecomputed}` : '') +
        (options.syncPrimaryVenuesAfter === true
          ? `, primaryVenues ${primaryVenuesLinked} linked (${primaryVenuesApiRequests} /teams req)`
          : '') +
        (options.syncStatsAfter === true
          ? `, fixtureStats ok=${fixtureStatsOk} skipped=${fixtureStatsSkipped} (${fixtureStatsRequests} req)`
          : ''),
    );
    return {
      created,
      updated,
      skipped,
      apiRequests,
      standingsApiRequests,
      standingsProcessed,
      standingsRecomputed,
      primaryVenuesLinked,
      primaryVenuesSkipped,
      primaryVenuesApiRequests,
      fixtureStatsOk,
      fixtureStatsSkipped,
      fixtureStatsRequests,
      errors,
    };
  }

  /**
   * Fetch `GET /fixtures/statistics?fixture={apiId}` and upsert one `fixtureTeamStat` row per team.
   * The API-Sports fixture id is read from `metadata.providers.apisports.externalId`.
   * Returns `'ok'`, `'skipped'` (no api id), or `'no_data'` (api returned nothing).
   */
  async syncFixtureStats(localFixtureId: number): Promise<'ok' | 'skipped' | 'no_data'> {
    const [fixture] = await this.fixtureService.getQuery({ where: { id: localFixtureId } as any });
    if (!fixture) return 'skipped';

    const meta = fixture.metadata as Record<string, any> | null;
    const apiId: number | undefined =
      meta?.providers?.[PROVIDER_KEY]?.externalId != null
        ? Number(meta.providers[PROVIDER_KEY].externalId)
        : meta?.apisports?.fixtureId != null
          ? Number(meta.apisports.fixtureId)
          : undefined;

    if (!apiId) {
      this.logger.debug(`syncFixtureStats: fixture ${localFixtureId} has no API-Sports id`);
      return 'skipped';
    }

    let raw: { response?: any[] };
    try {
      raw = await this.http.get('/fixtures/statistics', { fixture: apiId });
    } catch (e) {
      this.logger.warn(
        `syncFixtureStats: GET /fixtures/statistics?fixture=${apiId} failed — ${String(e)}`,
      );
      return 'no_data';
    }

    const rows: ApiSportsFixtureStatisticsTeam[] = (raw?.response ?? []) as ApiSportsFixtureStatisticsTeam[];
    if (rows.length === 0) {
      this.logger.debug(`syncFixtureStats: no statistics for API-Sports fixture ${apiId}`);
      return 'no_data';
    }

    const allTeams = await this.teamService.getQuery({});
    const teamByExtId = new Map<string, any>();
    for (const t of allTeams) {
      const extId = (t.metadata as any)?.providers?.[PROVIDER_KEY]?.externalId;
      if (extId != null) teamByExtId.set(String(extId), t);
    }

    const ops: Promise<void>[] = [];
    for (const row of rows) {
      const localTeam = teamByExtId.get(String(row.team.id));
      if (!localTeam) {
        this.logger.debug(
          `syncFixtureStats: no local team for API-Sports team ${row.team.id} (${row.team.name})`,
        );
        continue;
      }
      const side =
        fixture.homeTeamId === localTeam.id
          ? FixtureTeamStatSide.HOME
          : FixtureTeamStatSide.AWAY;
      ops.push(
        this.fixtureTeamStatService.upsertFromApiSportsStatistics(
          localFixtureId,
          localTeam.id,
          side,
          row.statistics,
        ),
      );
    }

    await Promise.all(ops);
    return 'ok';
  }

  async discoverLeagueByApiId(leagueId: number): Promise<any> {
    return this.http.get('/leagues', { id: leagueId });
  }

  private mapApiLeagueType(apiType: string | undefined): CompetitionType {
    const t = (apiType ?? '').toLowerCase();
    if (t === 'cup') return CompetitionType.CUP;
    if (t === 'league') return CompetitionType.LEAGUE;
    return CompetitionType.LEAGUE;
  }

  private async getCompetitionsCached(): Promise<any[]> {
    return this.competitionService.getQuery({});
  }

  private async findCompetitionByApiSportsLeagueId(leagueId: number): Promise<any | null> {
    const key = String(leagueId);
    const comps = await this.getCompetitionsCached();
    return (
      comps.find((c) => {
        const m = c?.metadata ?? {};
        return this.getProviderExternalId(m) === key;
      }) ?? null
    );
  }

  private async findSeasonByYearBounds(yearStart: number, yearEnd: number): Promise<any | null> {
    const [row] = await this.seasonService.getQuery({
      where: { yearStart, yearEnd } as any,
    });
    return row ?? null;
  }

  /**
   * Upsert `competition` + `season` rows from API-Sports `GET /leagues` payload (`response` array).
   * Idempotent on `metadata.providers.apisports.externalId` (league) and `yearStart`+`yearEnd` (season).
   *
   * Optional: one `/standings` request per eligible league creates/updates teams, `competitionStanding`,
   * and `teamCompetitionSeason` (no extra `/teams` calls).
   */
  async importLeaguesFromApiPayload(
    data: { response?: any[] },
    options?: ImportLeaguesOptions,
  ): Promise<{
    competitionsCreated: number;
    competitionsUpdated: number;
    seasonsCreated: number;
    seasonsExisting: number;
    leagueSeasonPairs: number;
    standingsApiRequests: number;
    standingsRowsProcessed: number;
    teamsCreatedFromStandings: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let competitionsCreated = 0;
    let competitionsUpdated = 0;
    let seasonsCreated = 0;
    let seasonsExisting = 0;
    let leagueSeasonPairs = 0;
    let standingsApiRequests = 0;
    let standingsRowsProcessed = 0;
    let teamsCreatedFromStandings = 0;

    const syncStandings =
      options?.syncTeamsAndStandings !== false &&
      (options?.maxStandingsRequests ?? 20) > 0;
    const maxStandings = options?.maxStandingsRequests ?? 20;
    const onlyCoverage = options?.onlyStandingsCoverage !== false;
    const onlyLeague = options?.onlyLeagueType !== false;
    const yearHint = options?.standingsSeasonYear;

    const items = data?.response;
    if (!Array.isArray(items)) {
      return {
        competitionsCreated: 0,
        competitionsUpdated: 0,
        seasonsCreated: 0,
        seasonsExisting: 0,
        leagueSeasonPairs: 0,
        standingsApiRequests: 0,
        standingsRowsProcessed: 0,
        teamsCreatedFromStandings: 0,
        errors: ['Missing or invalid `response` array'],
      };
    }

    for (const item of items) {
      try {
        const leagueObj = item?.league;
        const countryObj = item?.country;
        const seasons = Array.isArray(item?.seasons) ? item.seasons : [];
        if (!leagueObj?.id || !leagueObj?.name) {
          continue;
        }

        const apiLeagueId = Number(leagueObj.id);
        const countryName = countryObj?.name ?? 'Unknown';
        const type = this.mapApiLeagueType(leagueObj.type);

        let competition = await this.findCompetitionByApiSportsLeagueId(apiLeagueId);
        const baseMeta = {
          source: 'api-sports',
          apisports: {
            leagueId: apiLeagueId,
            logo: leagueObj.logo ?? null,
            lastImportedAt: new Date().toISOString(),
          },
          providers: {
            [PROVIDER_KEY]: { externalId: String(apiLeagueId) },
          },
        };

        if (competition) {
          await this.competitionService.update(competition.id, {
            id: competition.id,
            name: leagueObj.name,
            type,
            country: countryName,
            metadata: deepMergeEntityMetadata(
              (competition.metadata ?? {}) as Record<string, unknown>,
              baseMeta as Record<string, unknown>,
            ) as any,
          } as any);
          competitionsUpdated += 1;
        } else {
          competition = await this.competitionService.create({
            name: leagueObj.name,
            type,
            country: countryName,
            metadata: baseMeta as any,
          } as any);
          competitionsCreated += 1;
        }

        if (!competition?.id) {
          errors.push(`No competition id after upsert for API league ${apiLeagueId}`);
          continue;
        }

        for (const s of seasons) {
          if (!s?.start || !s?.end) continue;
          const start = new Date(s.start);
          const end = new Date(s.end);
          const yearStart = start.getFullYear();
          const yearEnd = end.getFullYear();

          let seasonRow = await this.findSeasonByYearBounds(yearStart, yearEnd);
          const seasonMeta = {
            source: 'api-sports',
            apisportsSeasonYear: s.year ?? yearStart,
            apisportsCoverage: s.coverage ?? undefined,
            lastImportedAt: new Date().toISOString(),
          };

          if (seasonRow) {
            await this.seasonService.update(seasonRow.id, {
              id: seasonRow.id,
              metadata: deepMergeEntityMetadata(
                (seasonRow.metadata ?? {}) as Record<string, unknown>,
                seasonMeta as Record<string, unknown>,
              ) as any,
            } as any);
            seasonsExisting += 1;
          } else {
            seasonRow = await this.seasonService.create({
              yearStart,
              yearEnd,
              metadata: seasonMeta as any,
            } as any);
            seasonsCreated += 1;
          }
          leagueSeasonPairs += 1;
        }

        if (
          syncStandings &&
          standingsApiRequests < maxStandings &&
          (onlyLeague ? type === CompetitionType.LEAGUE : true)
        ) {
          const apiSeasonYear = this.resolveApiSeasonYearForItem(seasons, yearHint);
          if (apiSeasonYear == null) {
            errors.push(
              `league ${apiLeagueId}: cannot resolve API season year (set standingsSeasonYear on body or use country+season fetch)`,
            );
          } else {
            const seasonObj =
              seasons.find((s: any) => Number(s?.year) === apiSeasonYear) ??
              seasons.find((s: any) => {
                if (!s?.start) return false;
                return new Date(s.start).getFullYear() === apiSeasonYear;
              }) ??
              seasons[0];
            if (onlyCoverage && seasonObj && !seasonObj?.coverage?.standings) {
              /* skip — saves quota */
            } else if (!seasonObj?.start || !seasonObj?.end) {
              errors.push(
                `league ${apiLeagueId} season ${apiSeasonYear}: missing start/end in /leagues payload`,
              );
            } else {
              const start = new Date(seasonObj.start);
              const end = new Date(seasonObj.end);
              const localSeason = await this.findSeasonByYearBounds(
                start.getFullYear(),
                end.getFullYear(),
              );
              if (!localSeason?.id) {
                errors.push(
                  `league ${apiLeagueId}: no local season row for ${start.getFullYear()}-${end.getFullYear()}`,
                );
              } else {
                try {
                  const stData = await this.http.get('/standings', {
                    league: apiLeagueId,
                    season: apiSeasonYear,
                  });
                  standingsApiRequests += 1;
                  const r = await this.processStandingsApiResponse(
                    stData,
                    {
                      league: apiLeagueId,
                      season: apiSeasonYear,
                      competitionId: competition.id,
                      seasonId: localSeason.id,
                    },
                    { createMissingTeams: true, teamCountry: countryName },
                  );
                  if (r.error) {
                    errors.push(
                      `standings league ${apiLeagueId} season ${apiSeasonYear}: ${r.error}`,
                    );
                  } else {
                    standingsRowsProcessed += r.processed;
                    teamsCreatedFromStandings += r.teamsCreated;
                  }
                } catch (e: any) {
                  errors.push(
                    `standings league ${apiLeagueId} season ${apiSeasonYear}: ${e?.message ?? e}`,
                  );
                }
              }
            }
          }
        }
      } catch (e: any) {
        errors.push(e?.message ?? String(e));
      }
    }

    this.logger.log(
      `importLeagues: +${competitionsCreated} comps, ~${competitionsUpdated} updated, +${seasonsCreated} seasons, ${seasonsExisting} seasons touched; standings ${standingsApiRequests} req, ${standingsRowsProcessed} rows, +${teamsCreatedFromStandings} teams`,
    );

    return {
      competitionsCreated,
      competitionsUpdated,
      seasonsCreated,
      seasonsExisting,
      leagueSeasonPairs,
      standingsApiRequests,
      standingsRowsProcessed,
      teamsCreatedFromStandings,
      errors,
    };
  }

  /** Fetch `/leagues` then import (same filters as discover). */
  async importLeaguesFromDiscover(
    params: { country: string; season: number } & Partial<ImportLeaguesOptions>,
  ) {
    const { country, season, ...rest } = params;
    const data = await this.http.get('/leagues', {
      country,
      season,
    });
    const r = await this.importLeaguesFromApiPayload(data, {
      ...rest,
      standingsSeasonYear: season,
    });
    return {
      ...r,
      /** One call for `/leagues` plus standing requests already in `standingsApiRequests`. */
      apiRequestsUsed: 1 + (r.standingsApiRequests ?? 0),
    };
  }
}
