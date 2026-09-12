import { Injectable, Logger } from '@nestjs/common';
import { SportApiHttpService } from './sportapi-http.service';
import { SPORTAPI_CATEGORY, SPORTAPI_CONFIG, SPORTAPI_TO_APISPORTS_LEAGUE, SPORTAPI_TOURNAMENT_CATEGORY } from './sportapi.config';
import type {
  SportApiEvent,
  SportApiIncident,
  SportApiIncidentsResponse,
  SportApiLineups,
  SportApiSeason,
  SportApiStandingRow,
  SportApiStandingsResponse,
  SportApiStatItem,
  SportApiStatisticsResponse,
  SportApiTeam,
  SportApiUniqueTournament,
  SportApiCareerStint,
} from './sportapi.types';
import { CompetitionService } from '../../modules/competition/competition.module';
import { SeasonService } from '../../modules/season/season.module';
import { TeamService } from '../../modules/team/team.module';
import { PlayerService } from '../../modules/player/player.module';
import { FixtureService } from '../../modules/fixture/fixture.module';
import { CompetitionStandingService } from '../../modules/competitionStanding/competitionStanding.module';
import { TeamCompetitionSeasonService } from '../../modules/teamCompetitionSeason/teamCompetitionSeason.module';
import { GoalService } from '../../modules/goal/goal.module';
import { CardService } from '../../modules/card/card.module';
import { SubstitutionService } from '../../modules/substitution/substitution.module';
import { LineupService } from '../../modules/lineUp/lineUp.module';
import { PlayerLineUpService } from '../../modules/playerLineUp/playerLineUp.module';
import { ManagerService } from '../../modules/manager/manager.module';
import { ManagerEmploymentService } from '../../modules/managerEmployment/managerEmployment.module';
import { StadiumService } from '../../modules/stadium/stadium.module';
import { FixtureTeamStatService } from '../../modules/fixtureTeamStat/fixtureTeamStat.service';
import { FixtureTeamStatSide } from '../../modules/fixtureTeamStat/fixtureTeamStat.entity';
import { CreateCompetitionStandingDTO } from '../../modules/competitionStanding/competitionStanding.entity';
import { CompetitionType } from '../../enums/competition.enum';
import { TeamType } from '../../enums/team.enum';
import { FixtureStatus, FixtureStage } from '../../enums/fixture.enum';
import { CardType } from '../../enums/card.enum';
import {
  deepMergeEntityMetadata,
  ENTITY_METADATA_PROVIDER,
} from '@iWatchFootball/base-tools/entity/entityMetadata';
import {
  clubNameKey,
  isSportApiOnly,
  providerExternalId,
  scoreCanonicalTeam,
} from './sportapi-identity';

const PROVIDER_KEY = ENTITY_METADATA_PROVIDER.SPORTAPI;
const FIXTURE_CORRELATION_MAX_MS = 6 * 60 * 60 * 1000;
const PLACEHOLDER_MANAGER_NAME = 'SportAPI lineup (manager TBD)';

export type ImportFixturesOptions = {
  from: string;
  to: string;
  uniqueTournamentIds?: number[];
  /** Country category ids (1 = England). Used by GET /api/v1/category/{id}/scheduled-events/{date}. */
  categoryIds?: number[];
  timezoneOffset?: number;
  maxApiRequests?: number;
  syncDetailsAfter?: boolean;
  syncDetailsMaxRequests?: number;
  createMissingTeams?: boolean;
};

export type SyncFixtureDetailsOptions = {
  fixtureId?: number;
  sportapiEventId?: number;
};

export type SyncStandingsOptions = {
  uniqueTournamentId: number;
  sportapiSeasonId: number;
};

export type SportApiPipelineOptions = {
  uniqueTournamentIds: number[];
  from: string;
  to: string;
  categoryIds?: number[];
  syncStandings?: boolean;
  syncFixtureDetails?: boolean;
  maxApiRequests: number;
  timezoneOffset?: number;
};

@Injectable()
export class SportApiAdapterService {
  private readonly logger = new Logger(SportApiAdapterService.name);
  private teamsCache: any[] | null = null;
  private playersCache: any[] | null = null;
  private competitionsCache: any[] | null = null;
  private seasonsCache: any[] | null = null;
  private stadiumsCache: any[] | null = null;
  private placeholderManagerId: number | null = null;

  constructor(
    private readonly http: SportApiHttpService,
    private readonly competitionService: CompetitionService,
    private readonly seasonService: SeasonService,
    private readonly teamService: TeamService,
    private readonly playerService: PlayerService,
    private readonly fixtureService: FixtureService,
    private readonly competitionStandingService: CompetitionStandingService,
    private readonly teamCompetitionSeasonService: TeamCompetitionSeasonService,
    private readonly goalService: GoalService,
    private readonly cardService: CardService,
    private readonly substitutionService: SubstitutionService,
    private readonly lineupService: LineupService,
    private readonly playerLineUpService: PlayerLineUpService,
    private readonly managerService: ManagerService,
    private readonly managerEmploymentService: ManagerEmploymentService,
    private readonly stadiumService: StadiumService,
    private readonly fixtureTeamStatService: FixtureTeamStatService,
  ) {}

  private invalidateCaches(): void {
    this.teamsCache = null;
    this.playersCache = null;
    this.competitionsCache = null;
    this.seasonsCache = null;
    this.stadiumsCache = null;
  }

  private getProviderExternalId(metadata: unknown): string | null {
    const m = metadata as { providers?: Record<string, { externalId?: string }> } | null;
    const v = m?.providers?.[PROVIDER_KEY]?.externalId;
    return v != null ? String(v) : null;
  }

  private async getTeamsCached(): Promise<any[]> {
    if (!this.teamsCache) this.teamsCache = await this.teamService.getQuery({});
    return this.teamsCache;
  }

  private async getPlayersCached(): Promise<any[]> {
    if (!this.playersCache) this.playersCache = await this.playerService.getQuery({});
    return this.playersCache;
  }

  private async getCompetitionsCached(): Promise<any[]> {
    if (!this.competitionsCache) this.competitionsCache = await this.competitionService.getQuery({});
    return this.competitionsCache;
  }

  private async getSeasonsCached(): Promise<any[]> {
    if (!this.seasonsCache) this.seasonsCache = await this.seasonService.getQuery({});
    return this.seasonsCache;
  }

  private async getStadiumsCached(): Promise<any[]> {
    if (!this.stadiumsCache) this.stadiumsCache = await this.stadiumService.getQuery({});
    return this.stadiumsCache;
  }

  private extractEvents(body: unknown): SportApiEvent[] {
    if (Array.isArray(body)) return body as SportApiEvent[];
    if (body && typeof body === 'object') {
      const o = body as Record<string, unknown>;
      if (Array.isArray(o.events)) return o.events as SportApiEvent[];
      const nested = o.event;
      if (nested && typeof nested === 'object' && typeof (nested as SportApiEvent).id === 'number') {
        return [nested as SportApiEvent];
      }
    }
    return [];
  }

  private uniqueTournamentId(event: SportApiEvent): number | undefined {
    return event.tournament?.uniqueTournament?.id ?? event.uniqueTournament?.id;
  }

  private uniqueTournament(event: SportApiEvent): SportApiUniqueTournament | undefined {
    return event.tournament?.uniqueTournament ?? event.uniqueTournament;
  }

  private mapFixtureStatus(status: SportApiEvent['status']): FixtureStatus {
    const type = String(status?.type ?? '').toLowerCase();
    if (type === 'inprogress' || type === 'halftime' || type === 'interrupted') return FixtureStatus.LIVE;
    if (type === 'finished') return FixtureStatus.COMPLETED;
    if (type === 'postponed') return FixtureStatus.POSTPONED;
    if (type === 'canceled' || type === 'cancelled') return FixtureStatus.CANCELLED;
    const code = Number(status?.code);
    if (code === 1 || code === 2 || code === 3 || code === 4 || code === 5) return FixtureStatus.LIVE;
    if (code === 100 || code === 110 || code === 120) return FixtureStatus.COMPLETED;
    if (code === 60) return FixtureStatus.POSTPONED;
    if (code === 70) return FixtureStatus.CANCELLED;
    if (code === 31 || code === 90) return FixtureStatus.SUSPENDED;
    return FixtureStatus.SCHEDULED;
  }

  private mapCompetitionType(name?: string): CompetitionType {
    const n = String(name ?? '').toLowerCase();
    if (n.includes('cup') || n.includes('champions') || n.includes('europa') || n.includes('knockout')) {
      return CompetitionType.CUP;
    }
    if (n.includes('friendly')) return CompetitionType.FRIENDLY;
    return CompetitionType.LEAGUE;
  }

  private parseSeasonYears(season?: SportApiSeason, kickoff?: Date): { yearStart: number; yearEnd: number } {
    const year = String(season?.year ?? season?.name ?? '');
    const slash = year.match(/(\d{2,4})\s*\/\s*(\d{2,4})/);
    if (slash) {
      let yearStart = Number(slash[1]);
      let yearEnd = Number(slash[2]);
      if (yearStart < 100) yearStart += 2000;
      if (yearEnd < 100) yearEnd += Math.floor(yearStart / 100) * 100;
      if (yearEnd < yearStart) yearEnd = yearStart + 1;
      return { yearStart, yearEnd };
    }
    const single = year.match(/(\d{4})/);
    if (single) {
      const y = Number(single[1]);
      return { yearStart: y, yearEnd: y + 1 };
    }
    const y = kickoff?.getUTCFullYear() ?? new Date().getFullYear();
    return { yearStart: y, yearEnd: y + 1 };
  }

  private eachDateInclusive(from: string, to: string): string[] {
    const dates: string[] = [];
    const start = Date.parse(`${from}T00:00:00Z`);
    const end = Date.parse(`${to}T00:00:00Z`);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return dates;
    for (let t = start; t <= end; t += 86_400_000) {
      dates.push(new Date(t).toISOString().slice(0, 10));
    }
    return dates;
  }

  private async findLocalTeamBySportApiId(id: number): Promise<any | null> {
    const key = String(id);
    const teams = await this.getTeamsCached();
    const hits = teams.filter((t) => this.getProviderExternalId(t?.metadata) === key);
    if (!hits.length) return null;
    hits.sort((a, b) => Number(isSportApiOnly(a?.metadata)) - Number(isSportApiOnly(b?.metadata)));
    return hits[0];
  }

  private async findCanonicalTeam(team: SportApiTeam): Promise<any | null> {
    const sourceName = team.name?.trim() || team.shortName?.trim() || '';
    const teams = await this.getTeamsCached();
    const byName = teams
      .map((row) => ({ row, score: scoreCanonicalTeam(row, sourceName) }))
      .filter((x) => Number.isFinite(x.score) && x.score > 0)
      .sort((a, b) => b.score - a.score);
    if (byName[0] && !isSportApiOnly(byName[0].row?.metadata)) return byName[0].row;
    const byId = await this.findLocalTeamBySportApiId(team.id);
    if (byId && isSportApiOnly(byId.metadata) && byName[0] && byName[0].row.id !== byId.id) {
      return byName[0].row;
    }
    return byName[0]?.row ?? byId ?? null;
  }

  private async findCanonicalCompetition(opts: {
    uniqueTournamentId: number;
    name?: string;
    country?: string;
  }): Promise<any | null> {
    const rows = await this.getCompetitionsCached();
    const apiSportsId = SPORTAPI_TO_APISPORTS_LEAGUE[opts.uniqueTournamentId];
    if (apiSportsId != null) {
      const byApi = rows.find((c) => providerExternalId(c?.metadata, 'apisports') === String(apiSportsId));
      if (byApi) return byApi;
    }
    const nameKey = clubNameKey(opts.name);
    const country = String(opts.country ?? '').trim().toLowerCase();
    const byName = rows.filter((c) => {
      if (clubNameKey(c?.name) !== nameKey) return false;
      if (country && String(c?.country ?? '').trim().toLowerCase() !== country) return false;
      return true;
    });
    byName.sort((a, b) => Number(isSportApiOnly(a?.metadata)) - Number(isSportApiOnly(b?.metadata)));
    if (byName[0] && !isSportApiOnly(byName[0].metadata)) return byName[0];
    const bySportApi = rows.find((c) => this.getProviderExternalId(c?.metadata) === String(opts.uniqueTournamentId));
    if (bySportApi && isSportApiOnly(bySportApi.metadata) && byName[0] && byName[0].id !== bySportApi.id) {
      return byName[0];
    }
    return byName[0] ?? bySportApi ?? null;
  }

  private async findCanonicalSeason(opts: {
    sportapiSeasonId: number;
    yearStart: number;
    yearEnd: number;
    competitionId?: number;
  }): Promise<any | null> {
    const rows = await this.getSeasonsCached();
    if (opts.competitionId != null) {
      const tcs = await this.teamCompetitionSeasonService.getQuery({
        where: { competitionId: opts.competitionId },
      });
      const linkedIds = new Set(tcs.map((r) => r.seasonId).filter((id): id is number => id != null));
      const linked = rows.filter(
        (s) => linkedIds.has(s.id) && s.yearStart === opts.yearStart && s.yearEnd === opts.yearEnd,
      );
      if (linked[0]) return linked[0];
    }
    const sameYears = rows
      .filter((s) => s.yearStart === opts.yearStart && s.yearEnd === opts.yearEnd)
      .sort((a, b) => a.id - b.id);
    const notSportApiOnly = sameYears.find((s) => !isSportApiOnly(s.metadata));
    if (notSportApiOnly) return notSportApiOnly;
    const byId = rows.find((s) => this.getProviderExternalId(s?.metadata) === String(opts.sportapiSeasonId));
    return notSportApiOnly ?? sameYears[0] ?? byId ?? null;
  }

  private async findLocalPlayerBySportApiId(id: number): Promise<any | null> {
    const key = String(id);
    const players = await this.getPlayersCached();
    return players.find((p) => this.getProviderExternalId(p?.metadata) === key) ?? null;
  }

  private async findLocalCompetitionByUniqueTournamentId(id: number): Promise<any | null> {
    const key = String(id);
    const rows = await this.getCompetitionsCached();
    return rows.find((c) => this.getProviderExternalId(c?.metadata) === key) ?? null;
  }

  private async findLocalSeasonBySportApiId(id: number): Promise<any | null> {
    const key = String(id);
    const rows = await this.getSeasonsCached();
    return rows.find((s) => this.getProviderExternalId(s?.metadata) === key) ?? null;
  }

  private async findLocalFixtureBySportApiId(id: number): Promise<any | null> {
    const key = String(id);
    const rows = await this.fixtureService.getQuery({});
    return rows.find((f) => this.getProviderExternalId(f?.metadata) === key) ?? null;
  }

  private pickCorrelationCandidate(
    pool: readonly any[],
    opts: {
      homeTeamId: number;
      awayTeamId: number;
      scheduledAtMs: number;
      sportapiEventId: number;
    },
  ): any | null {
    for (const row of pool) {
      if (row.homeTeamId !== opts.homeTeamId || row.awayTeamId !== opts.awayTeamId) continue;
      const rowMs = row.date ? new Date(row.date).getTime() : NaN;
      if (!Number.isFinite(rowMs) || Math.abs(rowMs - opts.scheduledAtMs) > FIXTURE_CORRELATION_MAX_MS) continue;
      const cur = this.getProviderExternalId(row.metadata);
      if (cur != null && cur !== String(opts.sportapiEventId)) continue;
      return row;
    }
    return null;
  }

  private async ensureStadiumForEvent(event: SportApiEvent, country: string, homeName?: string): Promise<number> {
    const venue = event.venue;
    const venueId = venue?.id;
    const venueName =
      venue?.name?.trim() ||
      (venueId != null ? `Venue ${venueId}` : homeName ? `${homeName} (home)` : 'Unknown venue');
    const countryName = venue?.country?.name || country || 'Unknown';

    const rows = await this.getStadiumsCached();
    if (venueId != null) {
      const byProv = rows.find(
        (s) => String(s?.metadata?.providers?.[PROVIDER_KEY]?.externalId ?? '') === String(venueId),
      );
      if (byProv?.id != null) return byProv.id;
    }
    const byName = rows.find((s) => String(s?.name ?? '').trim() === venueName);
    if (byName?.id != null) return byName.id;

    const created = await this.stadiumService.create({
      name: venueName,
      country: countryName,
      ...(venue?.capacity != null ? { capacity: Number(venue.capacity) } : {}),
      metadata: {
        source: 'sportapi',
        providers: venueId != null ? { [PROVIDER_KEY]: { externalId: String(venueId) } } : {},
        sportapi: {
          ...(venueId != null ? { venueId } : {}),
          cityName: venue?.city?.name,
          lastImportedAt: new Date().toISOString(),
        },
      },
    } as any);
    rows.push(created);
    return created.id;
  }

  private async upsertTeam(team: SportApiTeam | undefined, country: string, createIfMissing: boolean): Promise<any | null> {
    if (!team?.id) return null;
    const displayName = team.name?.trim() || team.shortName?.trim() || `Team ${team.id}`;
    const countryName = team.country?.name || country || 'Unknown';
    const type = team.national ? TeamType.COUNTRY : TeamType.CLUB;
    const metaPatch = {
      source: 'sportapi',
      providers: { [PROVIDER_KEY]: { externalId: String(team.id) } },
      sportapi: { teamId: team.id, lastImportedAt: new Date().toISOString() },
    };

    let local = await this.findCanonicalTeam(team);
    if (local) {
      await this.teamService.update(local.id, {
        id: local.id,
        name: local.name ?? displayName,
        country: local.country ?? countryName,
        type: local.type ?? type,
        metadata: deepMergeEntityMetadata(
          (local.metadata ?? {}) as Record<string, unknown>,
          metaPatch as Record<string, unknown>,
        ) as any,
      } as any);
      return local;
    }
    if (!createIfMissing) return null;
    local = await this.teamService.create({
      name: displayName,
      country: countryName,
      type,
      metadata: metaPatch as any,
    } as any);
    this.teamsCache = null;
    return local;
  }

  private async upsertPlayer(player: {
    id?: number;
    name?: string;
    shortName?: string;
    dateOfBirthTimestamp?: number;
    country?: { name?: string };
  } | undefined): Promise<any | null> {
    if (!player?.id) return null;
    const displayName = player.name?.trim() || player.shortName?.trim() || `Player ${player.id}`;
    const nationality = player.country?.name?.trim() || 'Unknown';
    const dateOfBirth = player.dateOfBirthTimestamp
      ? new Date(player.dateOfBirthTimestamp * 1000)
      : new Date('1900-01-01');
    const metaPatch = {
      source: 'sportapi',
      providers: { [PROVIDER_KEY]: { externalId: String(player.id) } },
      sportapi: { playerId: player.id, lastImportedAt: new Date().toISOString() },
    };

    let local = await this.findLocalPlayerBySportApiId(player.id);
    if (local) {
      await this.playerService.update(local.id, {
        id: local.id,
        name: local.name ?? displayName,
        nationality: local.nationality ?? nationality,
        positionIds: local.positionIds ?? [],
        dateOfBirth: local.dateOfBirth ?? dateOfBirth,
        metadata: deepMergeEntityMetadata(
          (local.metadata ?? {}) as Record<string, unknown>,
          metaPatch as Record<string, unknown>,
        ) as any,
      } as any);
      return local;
    }
    local = await this.playerService.create({
      name: displayName,
      nationality,
      positionIds: [],
      dateOfBirth,
      metadata: metaPatch as any,
    } as any);
    this.playersCache = null;
    return local;
  }

  private async ensureCompetitionAndSeason(
    event: SportApiEvent,
  ): Promise<{ competition: any; season: any } | null> {
    const ut = this.uniqueTournament(event);
    const season = event.season;
    if (!ut?.id || !season?.id) return null;

    const country =
      ut.category?.name ||
      event.tournament?.category?.name ||
      'Unknown';
    const type = this.mapCompetitionType(ut.name);
    const leagueMeta = {
      source: 'sportapi',
      providers: { [PROVIDER_KEY]: { externalId: String(ut.id) } },
      sportapi: {
        uniqueTournamentId: ut.id,
        slug: ut.slug,
        lastImportedAt: new Date().toISOString(),
      },
    };

    let competition = await this.findCanonicalCompetition({
      uniqueTournamentId: ut.id,
      name: ut.name,
      country,
    });
    if (competition) {
      await this.competitionService.update(competition.id, {
        id: competition.id,
        metadata: deepMergeEntityMetadata(
          (competition.metadata ?? {}) as Record<string, unknown>,
          leagueMeta as Record<string, unknown>,
        ) as any,
      } as any);
    } else {
      competition = await this.competitionService.create({
        name: ut.name ?? `Tournament ${ut.id}`,
        type,
        country,
        metadata: leagueMeta as any,
      } as any);
      this.competitionsCache = null;
    }

    const kickoff = event.startTimestamp ? new Date(event.startTimestamp * 1000) : undefined;
    const years = this.parseSeasonYears(season, kickoff);
    const seasonMeta = {
      source: 'sportapi',
      providers: { [PROVIDER_KEY]: { externalId: String(season.id) } },
      sportapi: {
        seasonId: season.id,
        uniqueTournamentId: ut.id,
        year: season.year ?? season.name,
        lastImportedAt: new Date().toISOString(),
      },
    };

    let localSeason = await this.findCanonicalSeason({
      sportapiSeasonId: season.id,
      yearStart: years.yearStart,
      yearEnd: years.yearEnd,
      competitionId: competition.id,
    });
    if (localSeason) {
      await this.seasonService.update(localSeason.id, {
        id: localSeason.id,
        yearStart: localSeason.yearStart ?? years.yearStart,
        yearEnd: localSeason.yearEnd ?? years.yearEnd,
        metadata: deepMergeEntityMetadata(
          (localSeason.metadata ?? {}) as Record<string, unknown>,
          seasonMeta as Record<string, unknown>,
        ) as any,
      } as any);
    } else {
      localSeason = await this.seasonService.create({
        yearStart: years.yearStart,
        yearEnd: years.yearEnd,
        metadata: seasonMeta as any,
      } as any);
      this.seasonsCache = null;
    }

    return { competition, season: localSeason };
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
      metadata: { source: 'sportapi', lastSync: new Date().toISOString() },
    } as any);
    return created.id;
  }

  private async getOrCreatePlaceholderManager(): Promise<number> {
    if (this.placeholderManagerId) return this.placeholderManagerId;
    const [existing] = await this.managerService.getQuery({ where: { name: PLACEHOLDER_MANAGER_NAME } });
    if (existing?.id) {
      this.placeholderManagerId = existing.id;
      return existing.id;
    }
    const created = await this.managerService.create({
      name: PLACEHOLDER_MANAGER_NAME,
      nickname: 'SportAPI',
      nationality: 'Unknown',
      teamIds: [],
      metadata: { source: 'sportapi', placeholderLineupManager: true },
    } as any);
    this.placeholderManagerId = created.id;
    return created.id;
  }

  private async upsertFixtureRow(
    event: SportApiEvent,
    opts: { createMissingTeams: boolean },
  ): Promise<'created' | 'updated' | 'skipped'> {
    const apiId = event.id;
    if (!apiId || !event.homeTeam?.id || !event.awayTeam?.id) return 'skipped';

    const ensured = await this.ensureCompetitionAndSeason(event);
    if (!ensured) return 'skipped';
    const { competition, season } = ensured;
    const country = competition.country ?? 'Unknown';

    const home = await this.upsertTeam(event.homeTeam, country, opts.createMissingTeams);
    const away = await this.upsertTeam(event.awayTeam, country, opts.createMissingTeams);
    if (!home?.id || !away?.id) return 'skipped';

    const date = event.startTimestamp ? new Date(event.startTimestamp * 1000) : null;
    if (!date || Number.isNaN(date.getTime())) return 'skipped';

    const stadiumId = await this.ensureStadiumForEvent(event, country, home.name ?? event.homeTeam.name);
    const homeScore = event.homeScore?.current ?? event.homeScore?.display;
    const awayScore = event.awayScore?.current ?? event.awayScore?.display;
    const mappedStatus = this.mapFixtureStatus(event.status);
    const meta = {
      source: 'sportapi',
      providers: { [PROVIDER_KEY]: { externalId: String(apiId) } },
      sportapi: {
        eventId: apiId,
        uniqueTournamentId: this.uniqueTournamentId(event),
        seasonId: event.season?.id,
        statusType: event.status?.type,
        statusCode: event.status?.code,
        roundName: event.roundInfo?.name,
        lastImportedAt: new Date().toISOString(),
      },
      liveClock: {
        short: event.status?.type,
        description: event.status?.description,
        code: event.status?.code,
        updatedAt: new Date().toISOString(),
      },
    };

    const payload: any = {
      date,
      homeTeamId: home.id,
      awayTeamId: away.id,
      competitionId: competition.id,
      seasonId: season.id,
      stadiumId,
      status: mappedStatus,
      stage: FixtureStage.LEAGUE,
      homeScore,
      awayScore,
      ...(event.attendance != null ? { attendance: Number(event.attendance) } : {}),
      metadata: meta,
    };

    let existing = await this.findLocalFixtureBySportApiId(apiId);
    if (!existing) {
      const pool = await this.fixtureService.getQuery({
        where: { homeTeamId: home.id, awayTeamId: away.id },
      });
      existing = this.pickCorrelationCandidate(pool, {
        homeTeamId: home.id,
        awayTeamId: away.id,
        scheduledAtMs: date.getTime(),
        sportapiEventId: apiId,
      });
    }

    if (existing) {
      await this.fixtureService.update(existing.id, {
        ...payload,
        id: existing.id,
        metadata: deepMergeEntityMetadata(
          (existing.metadata ?? {}) as Record<string, unknown>,
          meta as Record<string, unknown>,
        ) as any,
      } as any);
      await Promise.all([
        this.ensureTeamCompetitionSeasonId(home.id, competition.id, season.id),
        this.ensureTeamCompetitionSeasonId(away.id, competition.id, season.id),
      ]);
      return 'updated';
    }

    await this.fixtureService.create(payload);
    await Promise.all([
      this.ensureTeamCompetitionSeasonId(home.id, competition.id, season.id),
      this.ensureTeamCompetitionSeasonId(away.id, competition.id, season.id),
    ]);
    return 'created';
  }

  private resolveCategoryIds(options: {
    categoryIds?: number[];
    uniqueTournamentIds?: number[];
  }): number[] {
    const explicit = (options.categoryIds ?? []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
    if (explicit.length) return [...new Set(explicit)];
    const fromTournaments = (options.uniqueTournamentIds ?? [])
      .map((id) => SPORTAPI_TOURNAMENT_CATEGORY[Number(id)])
      .filter((n): n is number => Number.isFinite(n));
    if (fromTournaments.length) return [...new Set(fromTournaments)];
    return [SPORTAPI_CATEGORY.ENGLAND];
  }

  async discoverScheduledEvents(date: string, timezoneOffset = SPORTAPI_CONFIG.defaultTimezoneOffset) {
    const body = await this.http.get<unknown>(
      `/api/v1/category/${SPORTAPI_CATEGORY.ENGLAND}/scheduled-events/${date}`,
    );
    return { date, timezoneOffset, categoryId: SPORTAPI_CATEGORY.ENGLAND, events: this.extractEvents(body) };
  }

  async discoverLiveEvents() {
    const body = await this.http.get<unknown>('/api/v1/sport/football/events/live');
    return { events: this.extractEvents(body) };
  }

  async discoverCategories(date: string, timezoneOffset = SPORTAPI_CONFIG.defaultTimezoneOffset) {
    const body = await this.http.get<unknown>(
      `/api/v1/sport/football/${date}/${timezoneOffset}/categories`,
    );
    return body;
  }

  async importFixtures(options: ImportFixturesOptions): Promise<{
    created: number;
    updated: number;
    skipped: number;
    detailsSynced: number;
    apiRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let detailsSynced = 0;
    let apiRequests = 0;
    const maxRequests = options.maxApiRequests ?? 30;
    const filterIds = new Set((options.uniqueTournamentIds ?? []).map(Number).filter((n) => Number.isFinite(n)));
    const categoryIds = this.resolveCategoryIds(options);
    const createMissingTeams = options.createMissingTeams !== false;
    const imported: SportApiEvent[] = [];

    for (const date of this.eachDateInclusive(options.from, options.to)) {
      for (const categoryId of categoryIds) {
        if (apiRequests >= maxRequests) break;
        try {
          const body = await this.http.get<unknown>(
            `/api/v1/category/${categoryId}/scheduled-events/${date}`,
          );
          apiRequests += 1;
          await this.http.delay();
          const events = this.extractEvents(body).filter((ev) => {
            if (!filterIds.size) return true;
            const utId = this.uniqueTournamentId(ev);
            return utId != null && filterIds.has(utId);
          });
          for (const ev of events) {
            try {
              const outcome = await this.upsertFixtureRow(ev, { createMissingTeams });
              if (outcome === 'created') created += 1;
              else if (outcome === 'updated') updated += 1;
              else skipped += 1;
              if (outcome !== 'skipped') imported.push(ev);
            } catch (e: any) {
              errors.push(`event ${ev.id}: ${e?.message ?? e}`);
              skipped += 1;
            }
          }
        } catch (e: any) {
          errors.push(`category ${categoryId} date ${date}: ${e?.message ?? e}`);
        }
      }
    }

    if (options.syncDetailsAfter && imported.length) {
      const budget = options.syncDetailsMaxRequests ?? Math.min(imported.length, 20);
      const cap = Math.min(imported.length, budget);
      for (const ev of imported.slice(0, cap)) {
        if (apiRequests >= maxRequests) break;
        try {
          const local = await this.findLocalFixtureBySportApiId(ev.id);
          if (!local?.id) continue;
          const r = await this.syncFixtureDetails({ fixtureId: local.id, sportapiEventId: ev.id });
          apiRequests += r.apiRequests;
          if (r.ok) detailsSynced += 1;
          else if (r.error) errors.push(`details ${ev.id}: ${r.error}`);
        } catch (e: any) {
          errors.push(`details ${ev.id}: ${e?.message ?? e}`);
        }
      }
    }

    return { created, updated, skipped, detailsSynced, apiRequests, errors };
  }

  async importLiveFixtures(): Promise<{
    created: number;
    updated: number;
    skipped: number;
    liveCount: number;
    apiRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const body = await this.http.get<unknown>('/api/v1/sport/football/events/live');
    const events = this.extractEvents(body);
    for (const ev of events) {
      try {
        const outcome = await this.upsertFixtureRow(ev, { createMissingTeams: true });
        if (outcome === 'created') created += 1;
        else if (outcome === 'updated') updated += 1;
        else skipped += 1;
      } catch (e: any) {
        errors.push(`live ${ev.id}: ${e?.message ?? e}`);
        skipped += 1;
      }
    }
    return { created, updated, skipped, liveCount: events.length, apiRequests: 1, errors };
  }

  async syncFixtureDetails(options: SyncFixtureDetailsOptions): Promise<{
    ok: boolean;
    goals: number;
    cards: number;
    substitutions: number;
    lineupPlayers: number;
    statsSynced: number;
    apiRequests: number;
    error?: string;
  }> {
    let eventId = options.sportapiEventId;
    let localFixture = options.fixtureId
      ? (await this.fixtureService.getQuery({ where: { id: options.fixtureId } }))?.[0]
      : null;

    if (!eventId && localFixture) {
      eventId = Number(this.getProviderExternalId(localFixture.metadata));
    }
    if (!localFixture && eventId) {
      localFixture = await this.findLocalFixtureBySportApiId(eventId);
    }
    if (!eventId || !localFixture?.id) {
      return {
        ok: false,
        goals: 0,
        cards: 0,
        substitutions: 0,
        lineupPlayers: 0,
        statsSynced: 0,
        apiRequests: 0,
        error: 'fixture not found locally or sportapi event id missing',
      };
    }

    const homeTeamId = localFixture.homeTeamId;
    const awayTeamId = localFixture.awayTeamId;
    if (homeTeamId == null || awayTeamId == null) {
      return {
        ok: false,
        goals: 0,
        cards: 0,
        substitutions: 0,
        lineupPlayers: 0,
        statsSynced: 0,
        apiRequests: 0,
        error: 'fixture missing home or away team id',
      };
    }

    let apiRequests = 0;
    const incidentsBody = await this.http.get<SportApiIncidentsResponse>(`/api/v1/event/${eventId}/incidents`);
    apiRequests += 1;
    await this.http.delay();
    const incidents = incidentsBody?.incidents ?? [];

    let goals = 0;
    let cards = 0;
    let substitutions = 0;

    for (const inc of incidents) {
      try {
        const type = String(inc.incidentType ?? '').toLowerCase();
        if (type === 'goal') {
          if (await this.syncGoalIncident(inc, localFixture.id, homeTeamId, awayTeamId)) goals += 1;
        } else if (type === 'card') {
          if (await this.syncCardIncident(inc, localFixture.id, homeTeamId, awayTeamId)) cards += 1;
        } else if (type === 'substitution') {
          if (await this.syncSubstitutionIncident(inc, localFixture.id, homeTeamId, awayTeamId)) substitutions += 1;
        }
      } catch (e: any) {
        this.logger.warn(`incident ${inc.id} on event ${eventId}: ${e?.message ?? e}`);
      }
    }

    const lineupsBody = await this.http.get<SportApiLineups>(`/api/v1/event/${eventId}/lineups`);
    apiRequests += 1;
    await this.http.delay();
    const lineupPlayers = await this.syncLineups(lineupsBody, localFixture.id, homeTeamId, awayTeamId);

    const statsBody = await this.http.get<SportApiStatisticsResponse>(`/api/v1/event/${eventId}/statistics`);
    apiRequests += 1;
    const statsSynced = await this.syncTeamStatistics(statsBody, localFixture.id, homeTeamId, awayTeamId);

    await this.fixtureService.update(localFixture.id, {
      id: localFixture.id,
      metadata: deepMergeEntityMetadata(
        (localFixture.metadata ?? {}) as Record<string, unknown>,
        {
          source: 'sportapi',
          providers: { [PROVIDER_KEY]: { externalId: String(eventId) } },
          sportapi: {
            eventId,
            incidentsCount: incidents.length,
            lineupsConfirmed: lineupsBody?.confirmed,
            lastDetailsSyncAt: new Date().toISOString(),
          },
        } as Record<string, unknown>,
      ) as any,
    } as any);

    return { ok: true, goals, cards, substitutions, lineupPlayers, statsSynced, apiRequests };
  }

  private incidentTeamId(inc: SportApiIncident, homeTeamId: number, awayTeamId: number): number {
    return inc.isHome ? homeTeamId : awayTeamId;
  }

  private incidentMinute(inc: SportApiIncident): number {
    return Number(inc.time ?? 0) + Number(inc.addedTime ?? 0);
  }

  private async syncGoalIncident(
    inc: SportApiIncident,
    fixtureId: number,
    homeTeamId: number,
    awayTeamId: number,
  ): Promise<boolean> {
    if (!inc.player?.id) return false;
    const scorer = await this.upsertPlayer(inc.player);
    if (!scorer?.id) return false;
    let assistantId: number | undefined;
    if (inc.assist1?.id) {
      const assist = await this.upsertPlayer(inc.assist1);
      assistantId = assist?.id;
    }
    const eventKey = String(inc.id ?? `${inc.time}-${inc.player.id}`);
    const [dup] = await this.goalService.getQuery({
      where: { fixtureId, metadata: { sportapiEventId: eventKey } as any },
    });
    if (dup) return false;
    const cls = String(inc.incidentClass ?? '').toLowerCase();
    await this.goalService.create({
      fixtureId,
      teamId: this.incidentTeamId(inc, homeTeamId, awayTeamId),
      scorerId: scorer.id,
      assistantId,
      minute: this.incidentMinute(inc),
      ownGoal: cls.includes('own'),
      penalty: cls.includes('penalty'),
      metadata: {
        source: 'sportapi',
        sportapiEventId: eventKey,
        providers: { [PROVIDER_KEY]: { externalId: eventKey } },
      },
    } as any);
    return true;
  }

  private async syncCardIncident(
    inc: SportApiIncident,
    fixtureId: number,
    homeTeamId: number,
    awayTeamId: number,
  ): Promise<boolean> {
    if (!inc.player?.id) return false;
    const player = await this.upsertPlayer(inc.player);
    if (!player?.id) return false;
    const eventKey = String(inc.id ?? `${inc.time}-${inc.player.id}-card`);
    const [dup] = await this.cardService.getQuery({
      where: { fixtureId, metadata: { sportapiEventId: eventKey } as any },
    });
    if (dup) return false;
    const cls = String(inc.incidentClass ?? '').toLowerCase();
    const type = cls.includes('red') ? CardType.RED : CardType.YELLOW;
    await this.cardService.create({
      fixtureId,
      playerId: player.id,
      teamId: this.incidentTeamId(inc, homeTeamId, awayTeamId),
      type,
      minute: this.incidentMinute(inc),
      metadata: {
        source: 'sportapi',
        sportapiEventId: eventKey,
        providers: { [PROVIDER_KEY]: { externalId: eventKey } },
      },
    } as any);
    return true;
  }

  private async syncSubstitutionIncident(
    inc: SportApiIncident,
    fixtureId: number,
    homeTeamId: number,
    awayTeamId: number,
  ): Promise<boolean> {
    if (!inc.playerIn?.id || !inc.playerOut?.id) return false;
    const playerIn = await this.upsertPlayer(inc.playerIn);
    const playerOut = await this.upsertPlayer(inc.playerOut);
    if (!playerIn?.id || !playerOut?.id) return false;
    const eventKey = String(inc.id ?? `${inc.time}-${inc.playerIn.id}-${inc.playerOut.id}`);
    const [dup] = await this.substitutionService.getQuery({
      where: { fixtureId, metadata: { sportapiEventId: eventKey } as any },
    });
    if (dup) return false;
    await this.substitutionService.create({
      fixtureId,
      teamId: this.incidentTeamId(inc, homeTeamId, awayTeamId),
      playerInId: playerIn.id,
      playerOutId: playerOut.id,
      minute: this.incidentMinute(inc),
      metadata: {
        source: 'sportapi',
        sportapiEventId: eventKey,
        providers: { [PROVIDER_KEY]: { externalId: eventKey } },
      },
    } as any);
    return true;
  }

  private async syncLineups(
    lineups: SportApiLineups | undefined,
    fixtureId: number,
    homeTeamId: number,
    awayTeamId: number,
  ): Promise<number> {
    if (!lineups) return 0;
    let count = 0;
    const managerId = await this.getOrCreatePlaceholderManager();
    const sides: Array<{ teamId: number; sheet?: { formation?: string; players?: any[] } }> = [
      { teamId: homeTeamId, sheet: lineups.home },
      { teamId: awayTeamId, sheet: lineups.away },
    ];
    for (const { teamId, sheet } of sides) {
      if (!sheet?.players?.length) continue;
      let [lineUp] = await this.lineupService.getQuery({ where: { fixtureId, teamId } });
      if (!lineUp) {
        lineUp = await this.lineupService.create({
          fixtureId,
          teamId,
          managerId,
          formation: sheet.formation,
          metadata: { source: 'sportapi', lastSync: new Date().toISOString() },
        } as any);
      } else if (sheet.formation) {
        await this.lineupService.update(lineUp.id, { id: lineUp.id, formation: sheet.formation } as any);
      }
      for (const row of sheet.players) {
        const player = await this.upsertPlayer(row.player);
        if (!player?.id) continue;
        const [existingPlu] = await this.playerLineUpService.getQuery({
          where: { lineupId: lineUp.id, playerId: player.id },
        });
        const pluMeta = {
          source: 'sportapi',
          jerseyNumber: row.shirtNumber ?? row.jerseyNumber,
          position: row.position,
        };
        if (existingPlu) {
          await this.playerLineUpService.update(existingPlu.id, {
            id: existingPlu.id,
            isStarting: row.substitute !== true,
            isCaptain: !!row.captain,
            metadata: deepMergeEntityMetadata(
              (existingPlu.metadata ?? {}) as Record<string, unknown>,
              pluMeta as Record<string, unknown>,
            ) as any,
          } as any);
        } else {
          await this.playerLineUpService.create({
            lineupId: lineUp.id,
            playerId: player.id,
            isStarting: row.substitute !== true,
            isCaptain: !!row.captain,
            metadata: pluMeta as any,
          } as any);
        }
        count += 1;
      }
    }
    return count;
  }

  private flattenStatItems(body: SportApiStatisticsResponse | undefined): SportApiStatItem[] {
    const all: SportApiStatItem[] = [];
    const periods = body?.statistics ?? [];
    const preferred = periods.find((p) => String(p.period ?? '').toLowerCase() === 'all') ?? periods[0];
    for (const group of preferred?.groups ?? []) {
      all.push(...(group.statisticsItems ?? []));
    }
    return all;
  }

  private async syncTeamStatistics(
    body: SportApiStatisticsResponse | undefined,
    fixtureId: number,
    homeTeamId: number,
    awayTeamId: number,
  ): Promise<number> {
    const items = this.flattenStatItems(body);
    if (!items.length) return 0;
    await this.fixtureTeamStatService.upsertFromSportApiStatistics(
      fixtureId,
      homeTeamId,
      FixtureTeamStatSide.HOME,
      items,
      'home',
    );
    await this.fixtureTeamStatService.upsertFromSportApiStatistics(
      fixtureId,
      awayTeamId,
      FixtureTeamStatSide.AWAY,
      items,
      'away',
    );
    return 2;
  }

  async syncStandings(options: SyncStandingsOptions): Promise<{
    processed: number;
    apiRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    const body = await this.http.get<SportApiStandingsResponse>(
      `/api/v1/unique-tournament/${options.uniqueTournamentId}/season/${options.sportapiSeasonId}/standings/total`,
    );
    const table = (body?.standings ?? []).find((s) => String(s.type ?? '').toLowerCase() === 'total')
      ?? body?.standings?.[0];
    const rows: SportApiStandingRow[] = table?.rows ?? [];
    if (!rows.length) return { processed: 0, apiRequests: 1, errors: ['empty standings'] };

    const competition = await this.findLocalCompetitionByUniqueTournamentId(options.uniqueTournamentId);
    const season = await this.findLocalSeasonBySportApiId(options.sportapiSeasonId);
    if (!competition?.id || !season?.id) {
      return { processed: 0, apiRequests: 1, errors: ['local competition or season missing — import fixtures first'] };
    }

    let processed = 0;
    for (const row of rows) {
      try {
        const team = await this.upsertTeam(row.team, competition.country ?? 'Unknown', true);
        if (!team?.id) continue;
        const tcsId = await this.ensureTeamCompetitionSeasonId(team.id, competition.id, season.id);
        const gf = Number(row.scoresFor ?? 0);
        const ga = Number(row.scoresAgainst ?? 0);
        const payload: CreateCompetitionStandingDTO = {
          teamCompetitionSeasonId: tcsId,
          position: Number(row.position ?? 0),
          played: Number(row.matches ?? 0),
          won: Number(row.wins ?? 0),
          drawn: Number(row.draws ?? 0),
          lost: Number(row.losses ?? 0),
          goalsFor: gf,
          goalsAgainst: ga,
          goalDifference: gf - ga,
          points: Number(row.points ?? 0),
          metadata: {
            source: 'sportapi',
            providers: row.team?.id != null ? { [PROVIDER_KEY]: { externalId: String(row.team.id) } } : {},
            sportapi: {
              uniqueTournamentId: options.uniqueTournamentId,
              seasonId: options.sportapiSeasonId,
              lastImportedAt: new Date().toISOString(),
            },
          },
        } as any;
        const [existing] = await this.competitionStandingService.getQuery({
          where: { teamCompetitionSeasonId: tcsId },
        });
        if (existing?.id) {
          await this.competitionStandingService.update(existing.id, { ...payload, id: existing.id } as any);
        } else {
          await this.competitionStandingService.create(payload);
        }
        processed += 1;
      } catch (e: any) {
        errors.push(`standing team ${row.team?.id}: ${e?.message ?? e}`);
      }
    }
    return { processed, apiRequests: 1, errors };
  }

  /**
   * Fold SportAPI-only duplicate teams/leagues/seasons into rows that already exist
   * from API-Sports / StatsBomb / SportMonks, then soft-delete the duplicates.
   */
  async relinkToExistingRecords(): Promise<{
    teamsMerged: number;
    competitionsMerged: number;
    seasonsMerged: number;
    fixturesRelinked: number;
    standingsMoved: number;
    teamsSoftDeleted: number;
  }> {
    this.invalidateCaches();
    const teamMap = new Map<number, number>();
    const teams = await this.getTeamsCached();
    for (const dupe of teams.filter((t) => isSportApiOnly(t?.metadata))) {
      const sourceName = String(dupe.name ?? '');
      const canon = teams
        .filter((t) => t.id !== dupe.id)
        .map((row) => ({ row, score: scoreCanonicalTeam(row, sourceName) }))
        .filter((x) => Number.isFinite(x.score) && x.score > 0 && !isSportApiOnly(x.row?.metadata))
        .sort((a, b) => b.score - a.score)[0]?.row;
      if (!canon?.id) continue;
      await this.teamService.update(canon.id, {
        id: canon.id,
        metadata: deepMergeEntityMetadata(
          (canon.metadata ?? {}) as Record<string, unknown>,
          {
            providers: { [PROVIDER_KEY]: { externalId: this.getProviderExternalId(dupe.metadata) } },
            sportapi: (dupe.metadata as any)?.sportapi,
          } as Record<string, unknown>,
        ) as any,
      } as any);
      teamMap.set(dupe.id, canon.id);
    }

    const competitionMap = new Map<number, number>();
    const competitions = await this.getCompetitionsCached();
    for (const dupe of competitions.filter((c) => isSportApiOnly(c?.metadata))) {
      const utId = Number(this.getProviderExternalId(dupe.metadata));
      const canon = await this.findCanonicalCompetition({
        uniqueTournamentId: Number.isFinite(utId) ? utId : -1,
        name: dupe.name,
        country: dupe.country,
      });
      if (!canon?.id || canon.id === dupe.id) continue;
      await this.competitionService.update(canon.id, {
        id: canon.id,
        metadata: deepMergeEntityMetadata(
          (canon.metadata ?? {}) as Record<string, unknown>,
          {
            providers: { [PROVIDER_KEY]: { externalId: this.getProviderExternalId(dupe.metadata) } },
            sportapi: (dupe.metadata as any)?.sportapi,
          } as Record<string, unknown>,
        ) as any,
      } as any);
      competitionMap.set(dupe.id, canon.id);
    }

    const seasonMap = new Map<number, number>();
    const seasons = await this.getSeasonsCached();
    for (const dupe of seasons.filter((s) => isSportApiOnly(s?.metadata))) {
      const canon = seasons
        .filter(
          (s) =>
            s.id !== dupe.id &&
            s.yearStart === dupe.yearStart &&
            s.yearEnd === dupe.yearEnd &&
            !isSportApiOnly(s.metadata),
        )
        .sort((a, b) => a.id - b.id)[0];
      if (!canon?.id) continue;
      await this.seasonService.update(canon.id, {
        id: canon.id,
        metadata: deepMergeEntityMetadata(
          (canon.metadata ?? {}) as Record<string, unknown>,
          {
            providers: { [PROVIDER_KEY]: { externalId: this.getProviderExternalId(dupe.metadata) } },
            sportapi: (dupe.metadata as any)?.sportapi,
          } as Record<string, unknown>,
        ) as any,
      } as any);
      seasonMap.set(dupe.id, canon.id);
    }

    const fixtures = await this.fixtureService.getQuery({});
    let fixturesRelinked = 0;
    for (const fx of fixtures) {
      if (fx.homeTeamId == null || fx.awayTeamId == null || fx.competitionId == null || fx.seasonId == null) continue;
      const nextHome = teamMap.get(fx.homeTeamId) ?? fx.homeTeamId;
      const nextAway = teamMap.get(fx.awayTeamId) ?? fx.awayTeamId;
      const nextComp = competitionMap.get(fx.competitionId) ?? fx.competitionId;
      const nextSeason = seasonMap.get(fx.seasonId) ?? fx.seasonId;
      if (
        nextHome === fx.homeTeamId &&
        nextAway === fx.awayTeamId &&
        nextComp === fx.competitionId &&
        nextSeason === fx.seasonId
      ) {
        continue;
      }
      await this.fixtureService.update(fx.id, {
        id: fx.id,
        homeTeamId: nextHome,
        awayTeamId: nextAway,
        competitionId: nextComp,
        seasonId: nextSeason,
      } as any);
      fixturesRelinked += 1;
    }

    const fixturesAfter = await this.fixtureService.getQuery({});
    for (const fx of fixturesAfter) {
      const eventId = this.getProviderExternalId(fx.metadata);
      if (!eventId || !isSportApiOnly(fx.metadata)) continue;
      if (fx.homeTeamId == null || fx.awayTeamId == null) continue;
      const scheduledAtMs = fx.date ? new Date(fx.date).getTime() : NaN;
      if (!Number.isFinite(scheduledAtMs)) continue;
      const canon = this.pickCorrelationCandidate(
        fixturesAfter.filter((row) => row.id !== fx.id),
        {
          homeTeamId: fx.homeTeamId,
          awayTeamId: fx.awayTeamId,
          scheduledAtMs,
          sportapiEventId: Number(eventId),
        },
      );
      if (!canon?.id || isSportApiOnly(canon.metadata)) continue;
      await this.fixtureService.update(canon.id, {
        id: canon.id,
        status: fx.status ?? canon.status,
        homeScore: fx.homeScore ?? canon.homeScore,
        awayScore: fx.awayScore ?? canon.awayScore,
        metadata: deepMergeEntityMetadata(
          (canon.metadata ?? {}) as Record<string, unknown>,
          (fx.metadata ?? {}) as Record<string, unknown>,
        ) as any,
      } as any);
      await this.fixtureService.delete(fx.id);
    }

    const tcsRows = await this.teamCompetitionSeasonService.getQuery({});
    let standingsMoved = 0;
    for (const tcs of tcsRows) {
      const nextTeam = teamMap.get(tcs.teamId) ?? tcs.teamId;
      const nextComp = competitionMap.get(tcs.competitionId) ?? tcs.competitionId;
      const nextSeason = seasonMap.get(tcs.seasonId) ?? tcs.seasonId;
      if (nextTeam === tcs.teamId && nextComp === tcs.competitionId && nextSeason === tcs.seasonId) continue;

      const targetId = await this.ensureTeamCompetitionSeasonId(nextTeam, nextComp, nextSeason);
      const standings = await this.competitionStandingService.getQuery({
        where: { teamCompetitionSeasonId: tcs.id },
      });
      for (const st of standings) {
        const [dup] = await this.competitionStandingService.getQuery({
          where: { teamCompetitionSeasonId: targetId },
        });
        if (dup?.id && dup.id !== st.id) {
          await this.competitionStandingService.update(dup.id, {
            id: dup.id,
            position: st.position,
            played: st.played,
            won: st.won,
            drawn: st.drawn,
            lost: st.lost,
            goalsFor: st.goalsFor,
            goalsAgainst: st.goalsAgainst,
            goalDifference: st.goalDifference,
            points: st.points,
            metadata: deepMergeEntityMetadata(
              (dup.metadata ?? {}) as Record<string, unknown>,
              (st.metadata ?? {}) as Record<string, unknown>,
            ) as any,
          } as any);
          await this.competitionStandingService.delete(st.id);
        } else {
          await this.competitionStandingService.update(st.id, {
            id: st.id,
            teamCompetitionSeasonId: targetId,
          } as any);
        }
        standingsMoved += 1;
      }
      await this.teamCompetitionSeasonService.delete(tcs.id);
    }

    let teamsSoftDeleted = 0;
    for (const dupeId of teamMap.keys()) {
      await this.teamService.delete(dupeId);
      teamsSoftDeleted += 1;
    }
    for (const dupeId of competitionMap.keys()) {
      await this.competitionService.delete(dupeId);
    }
    for (const dupeId of seasonMap.keys()) {
      await this.seasonService.delete(dupeId);
    }

    this.invalidateCaches();
    this.logger.log(
      `relinkToExistingRecords: teams ${teamMap.size}, competitions ${competitionMap.size}, seasons ${seasonMap.size}, fixtures ${fixturesRelinked}`,
    );
    return {
      teamsMerged: teamMap.size,
      competitionsMerged: competitionMap.size,
      seasonsMerged: seasonMap.size,
      fixturesRelinked,
      standingsMoved,
      teamsSoftDeleted,
    };
  }

  async runPipeline(options: SportApiPipelineOptions): Promise<Record<string, unknown>> {
    const relink = await this.relinkToExistingRecords();
    let remaining = Math.max(0, options.maxApiRequests);
    const summary: Record<string, unknown> = { relink };

    if (remaining > 0) {
      const detailsBudget = options.syncFixtureDetails ? Math.max(0, remaining - 2) : 0;
      const fixtures = await this.importFixtures({
        from: options.from,
        to: options.to,
        uniqueTournamentIds: options.uniqueTournamentIds,
        categoryIds: options.categoryIds,
        timezoneOffset: options.timezoneOffset,
        maxApiRequests: remaining,
        syncDetailsAfter: options.syncFixtureDetails === true,
        syncDetailsMaxRequests: detailsBudget,
        createMissingTeams: true,
      });
      summary.fixtures = fixtures;
      remaining = Math.max(0, remaining - fixtures.apiRequests);
    }

    if (options.syncStandings !== false && remaining > 0) {
      this.invalidateCaches();
      const seasons = await this.getSeasonsCached();
      const seasonPairs = seasons
        .map((s) => {
          const sportapi = (s.metadata as any)?.sportapi;
          const utId = Number(sportapi?.uniqueTournamentId);
          const seasonId = Number(this.getProviderExternalId(s.metadata));
          if (!options.uniqueTournamentIds.includes(utId) || !Number.isFinite(seasonId)) return null;
          return { uniqueTournamentId: utId, sportapiSeasonId: seasonId };
        })
        .filter((v): v is { uniqueTournamentId: number; sportapiSeasonId: number } => v != null);

      let standingsProcessed = 0;
      const standingErrors: string[] = [];
      const seen = new Set<string>();
      for (const pair of seasonPairs) {
        const key = `${pair.uniqueTournamentId}:${pair.sportapiSeasonId}`;
        if (seen.has(key) || remaining < 1) continue;
        seen.add(key);
        const r = await this.syncStandings(pair);
        remaining -= r.apiRequests;
        standingsProcessed += r.processed;
        standingErrors.push(...r.errors);
        await this.http.delay();
      }
      summary.standings = { processed: standingsProcessed, errors: standingErrors };
    } else if (options.syncStandings === false) {
      summary.standings = { processed: 0, errors: [], skipped: true };
    }

    summary.apiRequestsRemaining = remaining;
    this.invalidateCaches();
    return summary;
  }

  /**
   * Import SportAPI/Sofascore manager careerHistory into `managerEmployment`.
   * Pass `careerHistory` to skip the HTTP call (e.g. from a saved JSON dump).
   */
  async importManagerCareer(options: {
    managerId?: number;
    sportapiManagerId?: number;
    careerHistory?: SportApiCareerStint[];
    createMissingTeams?: boolean;
  }): Promise<{
    managerId: number;
    employmentsCreated: number;
    employmentsSkipped: number;
    currentTeamId: number | null;
    apiRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let apiRequests = 0;
    const createMissingTeams = options.createMissingTeams !== false;

    let manager: any | null = null;
    if (options.managerId) {
      const [row] = await this.managerService.getQuery({ where: { id: options.managerId } });
      manager = row ?? null;
    }
    if (!manager && options.sportapiManagerId) {
      const all = await this.managerService.getQuery({});
      manager =
        all.find((m) => this.getProviderExternalId(m?.metadata) === String(options.sportapiManagerId)) ??
        null;
    }

    let history = options.careerHistory ?? [];
    let remoteName: string | undefined;
    if ((!history.length || !manager) && options.sportapiManagerId) {
      try {
        const raw = await this.http.get<Record<string, unknown>>(
          `/api/v1/manager/${options.sportapiManagerId}`,
        );
        apiRequests += 1;
        await this.http.delay();
        const data =
          raw?.data && typeof raw.data === 'object'
            ? (raw.data as Record<string, unknown>)
            : raw;
        remoteName = typeof data?.name === 'string' ? data.name : undefined;
        const fromRemote = (data as { careerHistory?: SportApiCareerStint[] })?.careerHistory;
        if (Array.isArray(fromRemote) && fromRemote.length) history = fromRemote;
      } catch (e: any) {
        errors.push(`manager ${options.sportapiManagerId}: ${e?.message ?? e}`);
      }
    }

    if (!manager) {
      const name = remoteName?.trim() || `Manager ${options.sportapiManagerId ?? 'unknown'}`;
      manager = await this.managerService.create({
        name,
        nickname: name,
        nationality: 'Unknown',
        teamIds: [],
        metadata: {
          source: 'sportapi',
          providers: options.sportapiManagerId
            ? { [PROVIDER_KEY]: { externalId: String(options.sportapiManagerId) } }
            : undefined,
        },
      } as any);
    } else if (options.sportapiManagerId) {
      await this.managerService.update(manager.id, {
        id: manager.id,
        metadata: deepMergeEntityMetadata((manager.metadata ?? {}) as Record<string, unknown>, {
          providers: { [PROVIDER_KEY]: { externalId: String(options.sportapiManagerId) } },
        }) as any,
      } as any);
    }

    const existing = await this.managerEmploymentService.getQuery({ where: { managerId: manager.id } });
    const now = Date.now();
    let created = 0;
    let skipped = 0;
    const teamIds: number[] = [];
    let currentTeamId: number | null = null;

    for (const stint of history) {
      const teamSrc = stint.team;
      if (!teamSrc?.id && !teamSrc?.name) continue;
      const team = await this.upsertTeam(
        {
          id: Number(teamSrc.id ?? 0),
          name: teamSrc.name,
          country: teamSrc.countryHint ? { name: teamSrc.countryHint } : undefined,
        },
        teamSrc.countryHint || 'Unknown',
        createMissingTeams,
      );
      if (!team?.id) continue;
      teamIds.push(team.id);
      const startDate =
        stint.startTimestamp != null ? new Date(stint.startTimestamp * 1000) : undefined;
      const endDate =
        stint.endTimestamp != null ? new Date(stint.endTimestamp * 1000) : undefined;
      const isCurrent =
        startDate != null &&
        startDate.getTime() <= now &&
        (endDate == null || endDate.getTime() > now);
      if (isCurrent) currentTeamId = team.id;

      const dup = existing.find((row) => {
        if (row.teamId !== team.id) return false;
        if (!startDate || !row.startDate) return row.teamId === team.id && !startDate;
        return Math.abs(new Date(row.startDate).getTime() - startDate.getTime()) < 86_400_000;
      });
      if (dup) {
        skipped += 1;
        continue;
      }

      const createdRow = await this.managerEmploymentService.create({
        managerId: manager.id,
        teamId: team.id,
        startDate,
        endDate,
        isCurrent,
        metadata: {
          source: 'sportapi',
          sportapi: {
            teamId: teamSrc.id,
            teamName: teamSrc.name,
            performance: stint.performance ?? null,
            startTimestamp: stint.startTimestamp ?? null,
            endTimestamp: stint.endTimestamp ?? null,
          },
        },
      } as any);
      existing.push(createdRow);
      created += 1;
    }

    const uniqueTeamIds = Array.from(new Set(teamIds));
    if (uniqueTeamIds.length) {
      await this.managerService.update(manager.id, {
        id: manager.id,
        teamIds: uniqueTeamIds,
      } as any);
    }
    if (currentTeamId != null) {
      await this.teamService.update(currentTeamId, { id: currentTeamId, managerId: manager.id } as any);
    }

    return {
      managerId: manager.id,
      employmentsCreated: created,
      employmentsSkipped: skipped,
      currentTeamId,
      apiRequests,
      errors,
    };
  }
}
