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

const PROVIDER_KEY = 'apisports';

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

@Injectable()
export class ApiSportsAdapterService {
  private readonly logger = new Logger(ApiSportsAdapterService.name);

  constructor(
    private readonly http: ApiSportsHttpService,
    private readonly competitionService: CompetitionService,
    private readonly seasonService: SeasonService,
    private readonly competitionStandingService: CompetitionStandingService,
    private readonly teamService: TeamService,
    private readonly teamCompetitionSeasonService: TeamCompetitionSeasonService,
    private readonly playerService: PlayerService,
    private readonly transferService: TransferService,
  ) {}

  private getProviderExternalId(metadata: any): string | null {
    const v = metadata?.providers?.[PROVIDER_KEY]?.externalId;
    return v != null ? String(v) : null;
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

  private async attachApiSportsProviderToPlayer(
    player: any,
    apiPlayerId: number,
    patch?: Record<string, any>,
  ): Promise<any> {
    const nextProviders = {
      ...(player?.metadata?.providers ?? {}),
      [PROVIDER_KEY]: { externalId: String(apiPlayerId) },
    };
    const nextMeta = {
      ...(player?.metadata ?? {}),
      source: player?.metadata?.source ?? 'api-sports',
      providers: nextProviders,
      apisports: {
        ...(player?.metadata?.apisports ?? {}),
        playerId: apiPlayerId,
        lastImportedAt: new Date().toISOString(),
      },
    };
    return this.playerService.update(player.id, {
      id: player.id,
      metadata: nextMeta as any,
      ...(patch ?? {}),
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
    const nextProviders = {
      ...(team?.metadata?.providers ?? {}),
      [PROVIDER_KEY]: { externalId: apiId != null ? String(apiId) : String(apiTeam?.id ?? '') },
    };
    const nextMeta = {
      ...(team?.metadata ?? {}),
      source: team?.metadata?.source ?? 'api-sports',
      apisports: {
        ...(team?.metadata?.apisports ?? {}),
        ...(apiId != null ? { teamId: apiId } : {}),
        lastImportedAt: new Date().toISOString(),
      },
      providers: nextProviders,
    };

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
    const [row] = await this.competitionStandingService.getQuery({
      where: { teamCompetitionSeasonId } as any,
    });
    return row ?? null;
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
      metadata: { source: 'api-sports', lastSync: new Date().toISOString() },
    } as any);
    return created.id;
  }

  /**
   * Import players for a given league+season.
   * Uses `/players?league=&season=&page=` (paged). Each page is one request.
   *
   * Dedup strategy:
   * - If player exists with metadata.providers.apisports.externalId => update/link teamIds & profile fields.
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
          const teamIds = localTeam?.id ? [localTeam.id] : undefined;

          const existingByApi = await this.findLocalPlayerByApiSportsId(apiPlayerId);
          if (existingByApi) {
            await this.playerService.update(existingByApi.id, {
              id: existingByApi.id,
              dateOfBirth: this.isPlaceholderDob(existingByApi.dateOfBirth) ? birth : existingByApi.dateOfBirth,
              nationality: existingByApi.nationality ?? String(nationality),
              height: existingByApi.height ?? heightCm,
              weight: existingByApi.weight ?? weightKg,
              photoUrl: existingByApi.photoUrl ?? p?.photo ?? undefined,
              teamIds: existingByApi.teamIds ?? teamIds,
              nickname: existingByApi.nickname ?? (shortName && shortName !== existingByApi.name ? shortName : undefined),
            } as any);
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
              teamIds: existingByNameDob.teamIds ?? teamIds,
              nickname: existingByNameDob.nickname ?? (shortName && shortName !== existingByNameDob.name ? shortName : undefined),
            });
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
              teamIds: placeholder.match.teamIds ?? teamIds,
              nickname: placeholder.match.nickname ?? (shortName && shortName !== placeholder.match.name ? shortName : undefined),
            });
            playersLinked += 1;
            continue;
          }

          await this.playerService.create({
            name,
            nickname: (shortName && shortName !== name ? shortName : (p?.nickname ?? undefined)),
            dateOfBirth: birth,
            nationality: String(nationality),
            positionIds: [], // required (NOT NULL in DB)
            bio: undefined,
            teamIds,
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
          metadata: {
            source: 'api-sports',
            league: item.league,
            season: item.season,
            lastSync: new Date().toISOString(),
            provider: PROVIDER_KEY,
          } as any,
        } as any;

        const existing = await this.findExistingStanding(
          teamCompetitionSeasonId,
        );
        if (existing) {
          await this.competitionStandingService.update(existing.id, {
            ...payload,
            id: existing.id,
          } as any);
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
  async enrichPlayers(options?: { limit?: number; season?: number }): Promise<{
    updated: number;
    skipped: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let updated = 0;
    let skipped = 0;
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
      const m = player?.metadata ?? {};
      const apiId = this.getProviderExternalId(m) ?? String(m.apisportsPlayerId);
      if (!apiId) {
        skipped += 1;
        continue;
      }
      try {
        let p: any;
        const prof: any = await this.http.get('/players/profiles', { player: apiId });
        if (prof?.response?.[0]) {
          const raw = prof.response[0];
          p = raw.player ?? raw;
        } else {
          const pl: any = await this.http.get('/players', { id: apiId, season });
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
          metadata: {
            ...m,
            lastApiSportsEnrichAt: new Date().toISOString(),
            providers: {
              ...m.providers,
              [PROVIDER_KEY]: { externalId: String(apiId) },
            },
          },
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

    this.logger.log(`enrichPlayers: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped, errors };
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
        await this.transferService.create({
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

  /** One league with `seasons[]` (year coverage for standings). */
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
            ...(competition?.metadata?.providers ?? {}),
            [PROVIDER_KEY]: { externalId: String(apiLeagueId) },
          },
        };

        if (competition) {
          await this.competitionService.update(competition.id, {
            id: competition.id,
            name: leagueObj.name,
            type,
            country: countryName,
            metadata: { ...(competition.metadata ?? {}), ...baseMeta },
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
              metadata: { ...(seasonRow.metadata ?? {}), ...seasonMeta },
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
    return this.importLeaguesFromApiPayload(data, {
      ...rest,
      standingsSeasonYear: season,
    });
  }
}
