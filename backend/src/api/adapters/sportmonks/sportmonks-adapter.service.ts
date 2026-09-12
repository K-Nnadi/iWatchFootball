import { Injectable, Logger } from '@nestjs/common';
import { SportMonksHttpService } from './sportmonks-http.service';
import {
  SPORTMONKS_EVENT_TYPE,
  SPORTMONKS_LINEUP_DETAIL,
  SPORTMONKS_LINEUP_TYPE,
  SPORTMONKS_FIXTURE_DETAIL_INCLUDES,
  SPORTMONKS_FIXTURE_LIST_INCLUDES,
  SPORTMONKS_STANDING_DETAIL,
  SPORTMONKS_STATE,
} from './sportmonks.config';
import type {
  SportMonksEvent,
  SportMonksFixture,
  SportMonksLeague,
  SportMonksLineup,
  SportMonksParticipant,
  SportMonksSeason,
  SportMonksStanding,
  SportMonksStatistic,
  SportMonksSquadPlayer,
  SportMonksTeam,
} from './sportmonks.types';
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
import { StadiumService } from '../../modules/stadium/stadium.module';
import { FixtureTeamStatService } from '../../modules/fixtureTeamStat/fixtureTeamStat.service';
import { PlayerTeamStintService } from '../../modules/playerTeamStint/playerTeamStint.service';
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
  extractSportMonksEntity,
  extractSportMonksList,
  sportMonksResponseHint,
} from './sportmonks-response.util';

const PROVIDER_KEY = ENTITY_METADATA_PROVIDER.SPORTMONKS;
const FIXTURE_CORRELATION_MAX_MS = 6 * 60 * 60 * 1000;
const PLACEHOLDER_MANAGER_NAME = 'SportMonks lineup (manager TBD)';

export type ImportLeaguesOptions = {
  leagueIds: number[];
  /** Import current season only (default true). */
  currentSeasonOnly?: boolean;
};

export type SyncStandingsOptions = {
  /** Local season id */
  seasonId: number;
};

export type ImportFixturesOptions = {
  from: string;
  to: string;
  /** SportMonks league id filter (optional). */
  leagueId?: number;
  /** SportMonks season id filter (optional). */
  sportmonksSeasonId?: number;
  timezone?: string;
  maxPages?: number;
  maxRequests?: number;
  /** After import, fetch events/lineups per fixture (costs 1 request each). */
  syncDetailsAfter?: boolean;
  syncDetailsMaxRequests?: number;
  createMissingTeams?: boolean;
};

export type SyncFixtureDetailsOptions = {
  /** Local fixture id */
  fixtureId?: number;
  /** SportMonks fixture id */
  sportmonksFixtureId?: number;
};

export type SportMonksPipelineOptions = {
  leagueIds: number[];
  from: string;
  to: string;
  syncStandings?: boolean;
  syncFixtureDetails?: boolean;
  syncSquads?: boolean;
  maxApiRequests: number;
  timezone?: string;
};

@Injectable()
export class SportMonksAdapterService {
  private readonly logger = new Logger(SportMonksAdapterService.name);
  private teamsCache: any[] | null = null;
  private playersCache: any[] | null = null;
  private competitionsCache: any[] | null = null;
  private seasonsCache: any[] | null = null;
  private stadiumsCache: any[] | null = null;
  private placeholderManagerId: number | null = null;
  private readonly teamDetailsCache = new Map<number, SportMonksParticipant>();

  constructor(
    private readonly http: SportMonksHttpService,
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
    private readonly stadiumService: StadiumService,
    private readonly fixtureTeamStatService: FixtureTeamStatService,
    private readonly playerTeamStintService: PlayerTeamStintService,
  ) {}

  private invalidateCaches(): void {
    this.teamsCache = null;
    this.playersCache = null;
    this.competitionsCache = null;
    this.seasonsCache = null;
    this.stadiumsCache = null;
    this.teamDetailsCache.clear();
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

  /** Resolve or create a stadium row for fixture import (venue include or fallback). */
  private async ensureStadiumForFixture(
    fixture: SportMonksFixture,
    country: string,
    homeTeamName?: string,
  ): Promise<number> {
    const venue = fixture.venue;
    const venueId = fixture.venue_id ?? venue?.id;
    const venueName =
      venue?.name?.trim() ||
      (venueId != null ? `Venue ${venueId}` : homeTeamName ? `${homeTeamName} (home)` : 'Unknown venue');
    const countryName = country && country !== '' ? country : 'Unknown';

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
        source: 'sportmonks',
        providers: venueId != null ? { [PROVIDER_KEY]: { externalId: String(venueId) } } : {},
        sportmonks: {
          ...(venueId != null ? { venueId } : {}),
          cityName: venue?.city_name,
          lastImportedAt: new Date().toISOString(),
        },
      },
    } as any);
    rows.push(created);
    return created.id;
  }

  private async findLocalTeamBySportMonksId(sportmonksTeamId: number): Promise<any | null> {
    const key = String(sportmonksTeamId);
    const teams = await this.getTeamsCached();
    return teams.find((t) => this.getProviderExternalId(t?.metadata) === key) ?? null;
  }

  private async findLocalPlayerBySportMonksId(sportmonksPlayerId: number): Promise<any | null> {
    const key = String(sportmonksPlayerId);
    const players = await this.getPlayersCached();
    return players.find((p) => this.getProviderExternalId(p?.metadata) === key) ?? null;
  }

  private async findLocalCompetitionBySportMonksLeagueId(leagueId: number): Promise<any | null> {
    const key = String(leagueId);
    const rows = await this.getCompetitionsCached();
    return rows.find((c) => this.getProviderExternalId(c?.metadata) === key) ?? null;
  }

  private async findLocalSeasonBySportMonksId(seasonId: number): Promise<any | null> {
    const key = String(seasonId);
    const rows = await this.getSeasonsCached();
    return rows.find((s) => this.getProviderExternalId(s?.metadata) === key) ?? null;
  }

  private async findLocalFixtureBySportMonksId(fixtureId: number): Promise<any | null> {
    const key = String(fixtureId);
    const rows = await this.fixtureService.getQuery({});
    return rows.find((f) => this.getProviderExternalId(f?.metadata) === key) ?? null;
  }

  private parseSeasonYears(season: SportMonksSeason): { yearStart: number; yearEnd: number } {
    if (season.starting_at && season.ending_at) {
      const ys = new Date(season.starting_at).getFullYear();
      const ye = new Date(season.ending_at).getFullYear();
      if (!Number.isNaN(ys) && !Number.isNaN(ye)) return { yearStart: ys, yearEnd: ye };
    }
    const name = String(season.name ?? '');
    const slash = name.match(/(\d{4})\s*\/\s*(\d{2,4})/);
    if (slash) {
      const yearStart = Number(slash[1]);
      let yearEnd = Number(slash[2]);
      if (yearEnd < 100) yearEnd = Math.floor(yearStart / 100) * 100 + yearEnd;
      if (yearEnd < yearStart) yearEnd = yearStart + 1;
      return { yearStart, yearEnd };
    }
    const single = name.match(/(\d{4})/);
    if (single) {
      const y = Number(single[1]);
      return { yearStart: y, yearEnd: y + 1 };
    }
    const y = new Date().getFullYear();
    return { yearStart: y, yearEnd: y + 1 };
  }

  private mapLeagueType(league: SportMonksLeague): CompetitionType {
    const t = String(league.type ?? '').toLowerCase();
    if (t.includes('cup') || t.includes('friendly')) return CompetitionType.CUP;
    return CompetitionType.LEAGUE;
  }

  private mapFixtureStatus(stateId: number | undefined): FixtureStatus {
    switch (stateId) {
      case SPORTMONKS_STATE.INPLAY_1ST_HALF:
      case SPORTMONKS_STATE.INPLAY_2ND_HALF:
      case SPORTMONKS_STATE.INPLAY_ET:
      case SPORTMONKS_STATE.INPLAY_PENALTIES:
      case SPORTMONKS_STATE.HT:
        return FixtureStatus.LIVE;
      case SPORTMONKS_STATE.FT:
      case SPORTMONKS_STATE.AET:
      case SPORTMONKS_STATE.FT_PEN:
        return FixtureStatus.COMPLETED;
      case SPORTMONKS_STATE.POSTPONED:
        return FixtureStatus.POSTPONED;
      case SPORTMONKS_STATE.SUSPENDED:
        return FixtureStatus.SUSPENDED;
      case SPORTMONKS_STATE.CANCELLED:
        return FixtureStatus.CANCELLED;
      default:
        return FixtureStatus.SCHEDULED;
    }
  }

  private extractScores(
    fixture: SportMonksFixture,
    homeParticipantId: number,
    awayParticipantId: number,
  ): { homeScore?: number; awayScore?: number } {
    const scores = fixture.scores ?? [];
    const current =
      scores.filter((s) => String(s.description ?? '').toUpperCase() === 'CURRENT') ||
      scores;
    let homeScore: number | undefined;
    let awayScore: number | undefined;
    for (const s of current) {
      const goals = s.score?.goals;
      if (goals == null || !Number.isFinite(Number(goals))) continue;
      const part = s.score?.participant;
      const partId = s.score?.participant_id;
      if (part === 'home' || partId === homeParticipantId) homeScore = Number(goals);
      if (part === 'away' || partId === awayParticipantId) awayScore = Number(goals);
    }
    return { homeScore, awayScore };
  }

  private extractScoresByDescription(
    fixture: SportMonksFixture,
    homeParticipantId: number,
    awayParticipantId: number,
    description: string,
  ): { homeScore?: number; awayScore?: number } {
    const scores = (fixture.scores ?? []).filter(
      (s) => String(s.description ?? '').toUpperCase() === description.toUpperCase(),
    );
    let homeScore: number | undefined;
    let awayScore: number | undefined;
    for (const s of scores) {
      const goals = s.score?.goals;
      if (goals == null || !Number.isFinite(Number(goals))) continue;
      const part = s.score?.participant;
      const partId = s.score?.participant_id;
      if (part === 'home' || partId === homeParticipantId) homeScore = Number(goals);
      if (part === 'away' || partId === awayParticipantId) awayScore = Number(goals);
    }
    return { homeScore, awayScore };
  }

  private lineupDetailValue(
    details: SportMonksLineup['details'],
    typeId: number,
  ): number | undefined {
    const row = (details ?? []).find((d) => d.type_id === typeId);
    if (row?.data?.value == null) return undefined;
    const n = Number(row.data.value);
    return Number.isFinite(n) ? n : undefined;
  }

  /** Persist raw + derived SportMonks fixture fields in metadata for max fidelity. */
  private buildSportMonksFixtureMetadataPatch(
    fixture: SportMonksFixture,
    homeParticipantId?: number,
    awayParticipantId?: number,
  ): Record<string, unknown> {
    const ht =
      homeParticipantId != null && awayParticipantId != null
        ? this.extractScoresByDescription(fixture, homeParticipantId, awayParticipantId, 'HT')
        : {};
    const ft =
      homeParticipantId != null && awayParticipantId != null
        ? this.extractScoresByDescription(fixture, homeParticipantId, awayParticipantId, 'FT')
        : {};

    return {
      sportmonks: {
        fixtureId: fixture.id,
        stateId: fixture.state_id,
        roundId: fixture.round_id,
        roundName: fixture.round?.name,
        venueId: fixture.venue_id,
        resultInfo: fixture.result_info,
        length: fixture.length,
        leg: fixture.leg,
        lastImportedAt: new Date().toISOString(),
        scores: fixture.scores,
        halfTime: ht,
        fullTime: ft,
        periods: fixture.periods,
        formations: fixture.formations,
        statistics: fixture.statistics,
        eventsCount: fixture.events?.length ?? 0,
      },
    };
  }

  private teamLevelStatistics(
    statistics: SportMonksStatistic[] | undefined,
    participantId: number,
  ): SportMonksStatistic[] {
    return (statistics ?? []).filter(
      (s) => s.participant_id === participantId && (s.player_id == null || s.player_id === 0),
    );
  }

  private resolveHomeAwayParticipants(
    participants: SportMonksParticipant[] | undefined,
  ): { home: SportMonksParticipant | null; away: SportMonksParticipant | null } {
    const list = participants ?? [];
    let home = list.find((p) => p.meta?.location === 'home') ?? null;
    let away = list.find((p) => p.meta?.location === 'away') ?? null;
    if (!home && list[0]) home = list[0];
    if (!away && list[1]) away = list[1];
    return { home, away };
  }

  private standingDetailValue(details: SportMonksStanding['details'], typeId: number): number {
    const row = (details ?? []).find((d) => d.type_id === typeId);
    return row?.value != null ? Number(row.value) : 0;
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
      nickname: 'SportMonks',
      nationality: 'Unknown',
      teamIds: [],
      metadata: { source: 'sportmonks', placeholderLineupManager: true },
    } as any);
    this.placeholderManagerId = created.id;
    return created.id;
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
      metadata: { source: 'sportmonks', lastSync: new Date().toISOString() },
    } as any);
    return created.id;
  }

  private isPlaceholderTeamName(name: string | undefined | null, apiId: number): boolean {
    if (!name || !String(name).trim()) return true;
    const n = String(name).trim();
    return n === `Team ${apiId}` || n === `Team #${apiId}` || /^Team #?\d+$/.test(n);
  }

  /** Fetch team profile when standings/fixtures omit participant name. */
  private async resolveParticipantFromSportMonks(
    participant: SportMonksParticipant,
  ): Promise<SportMonksParticipant> {
    if (participant.name?.trim()) return participant;
    const cached = this.teamDetailsCache.get(participant.id);
    if (cached?.name?.trim()) return { ...participant, ...cached };

    try {
      const body = await this.http.get<unknown>(`/teams/${participant.id}`);
      const team = extractSportMonksEntity<SportMonksTeam>(body);
      if (team?.id) {
        const resolved: SportMonksParticipant = {
          id: team.id,
          name: team.name,
          short_code: team.short_code,
          image_path: team.image_path,
        };
        this.teamDetailsCache.set(team.id, resolved);
        return { ...participant, ...resolved };
      }
    } catch (e: any) {
      this.logger.warn(`fetch SportMonks team ${participant.id}: ${e?.message ?? e}`);
    }
    return participant;
  }

  private async upsertTeamFromParticipant(
    participant: SportMonksParticipant,
    country: string,
    createIfMissing: boolean,
  ): Promise<any | null> {
    const apiId = participant.id;
    if (!apiId) return null;
    const resolved = await this.resolveParticipantFromSportMonks(participant);
    const displayName = resolved.name?.trim() || `Team ${apiId}`;

    let local = await this.findLocalTeamBySportMonksId(apiId);
    const metaPatch = {
      source: 'sportmonks',
      providers: { [PROVIDER_KEY]: { externalId: String(apiId) } },
      sportmonks: { teamId: apiId, lastImportedAt: new Date().toISOString() },
    };

    if (local) {
      const shouldUpdateName =
        resolved.name?.trim() && this.isPlaceholderTeamName(local.name, apiId);
      if (shouldUpdateName || (!local.logoUrl && resolved.image_path)) {
        await this.teamService.update(local.id, {
          id: local.id,
          ...(shouldUpdateName ? { name: displayName } : {}),
          logoUrl: local.logoUrl ?? resolved.image_path,
          metadata: deepMergeEntityMetadata(
            (local.metadata ?? {}) as Record<string, unknown>,
            metaPatch as Record<string, unknown>,
          ) as any,
        } as any);
        if (shouldUpdateName) local = { ...local, name: displayName };
      }
      return local;
    }
    if (!createIfMissing) return null;

    local = await this.teamService.create({
      name: displayName,
      country,
      type: TeamType.CLUB,
      logoUrl: resolved.image_path ?? undefined,
      metadata: metaPatch as any,
    } as any);
    this.teamsCache = null;
    return local;
  }

  private resolvePlayerNationality(
    player: {
      nationality?: string | { id?: number; name?: string };
      country?: { name?: string };
    },
  ): string {
    const nat = player.nationality;
    if (typeof nat === 'string' && nat.trim()) return nat.trim();
    if (nat && typeof nat === 'object' && nat.name) return String(nat.name);
    if (player.country?.name) return String(player.country.name);
    return 'Unknown';
  }

  private async upsertPlayerFromSportMonks(
    player: {
      id: number;
      name?: string;
      display_name?: string;
      common_name?: string;
      date_of_birth?: string;
      image_path?: string;
      height?: number;
      weight?: number;
      nationality?: string | { id?: number; name?: string };
      country?: { name?: string };
    },
  ): Promise<any | null> {
    if (!player?.id) return null;
    let local = await this.findLocalPlayerBySportMonksId(player.id);
    const displayName =
      player.display_name || player.common_name || player.name || `Player ${player.id}`;
    const nationality = this.resolvePlayerNationality(player);
    const metaPatch = {
      source: 'sportmonks',
      providers: { [PROVIDER_KEY]: { externalId: String(player.id) } },
      sportmonks: { playerId: player.id, lastImportedAt: new Date().toISOString() },
    };
    if (local) {
      await this.playerService.update(local.id, {
        id: local.id,
        name: local.name ?? displayName,
        nationality: local.nationality ?? nationality,
        positionIds: local.positionIds ?? [],
        dateOfBirth: local.dateOfBirth ?? (player.date_of_birth ? new Date(player.date_of_birth) : new Date('1900-01-01')),
        photoUrl: local.photoUrl ?? player.image_path,
        height: local.height ?? player.height,
        weight: local.weight ?? player.weight,
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
      dateOfBirth: player.date_of_birth ? new Date(player.date_of_birth) : new Date('1900-01-01'),
      photoUrl: player.image_path,
      height: player.height,
      weight: player.weight,
      metadata: metaPatch as any,
    } as any);
    this.playersCache = null;
    return local;
  }

  /** Import leagues and seasons from SportMonks league ids. */
  async importLeagues(options: ImportLeaguesOptions): Promise<{
    leaguesProcessed: number;
    seasonsProcessed: number;
    apiRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let apiRequests = 0;
    let leaguesProcessed = 0;
    let seasonsProcessed = 0;
    const currentOnly = options.currentSeasonOnly !== false;

    for (const leagueId of options.leagueIds) {
      try {
        let body = await this.http.get<unknown>(
          `/leagues/${leagueId}`,
          { include: 'country;seasons' },
        );
        apiRequests += 1;
        await this.http.delay();
        let league = extractSportMonksEntity<SportMonksLeague>(body);
        if (!league?.id) {
          body = await this.http.get<unknown>(`/leagues/${leagueId}`);
          apiRequests += 1;
          await this.http.delay();
          league = extractSportMonksEntity<SportMonksLeague>(body);
        }
        if (!league?.id) {
          errors.push(`league ${leagueId}: empty response (${sportMonksResponseHint(body)})`);
          continue;
        }

        const countryName = league.country?.name ?? 'Unknown';
        const type = this.mapLeagueType(league);
        const leagueMeta = {
          source: 'sportmonks',
          providers: { [PROVIDER_KEY]: { externalId: String(league.id) } },
          sportmonks: { leagueId: league.id, shortCode: league.short_code, lastImportedAt: new Date().toISOString() },
        };

        let competition = await this.findLocalCompetitionBySportMonksLeagueId(league.id);
        if (competition) {
          await this.competitionService.update(competition.id, {
            id: competition.id,
            name: league.name ?? competition.name,
            type,
            country: countryName,
            code: league.short_code ?? competition.code,
            metadata: deepMergeEntityMetadata(
              (competition.metadata ?? {}) as Record<string, unknown>,
              leagueMeta as Record<string, unknown>,
            ) as any,
          } as any);
        } else {
          competition = await this.competitionService.create({
            name: String(league.name ?? `League ${league.id}`),
            type,
            country: countryName,
            code: league.short_code,
            metadata: leagueMeta as any,
          } as any);
        }
        this.competitionsCache = null;
        leaguesProcessed += 1;

        const seasons = (league.seasons ?? []).filter((s) =>
          currentOnly ? s.is_current === true : true,
        );
        if (currentOnly && seasons.length === 0 && league.seasons?.length) {
          seasons.push(league.seasons[0]);
        }

        for (const smSeason of seasons) {
          if (!smSeason?.id) continue;
          const { yearStart, yearEnd } = this.parseSeasonYears(smSeason);
          const seasonMeta = {
            source: 'sportmonks',
            providers: { [PROVIDER_KEY]: { externalId: String(smSeason.id) } },
            sportmonks: {
              seasonId: smSeason.id,
              leagueId: league.id,
              name: smSeason.name,
              lastImportedAt: new Date().toISOString(),
            },
          };
          let season = await this.findLocalSeasonBySportMonksId(smSeason.id);
          if (season) {
            await this.seasonService.update(season.id, {
              id: season.id,
              yearStart,
              yearEnd,
              metadata: deepMergeEntityMetadata(
                (season.metadata ?? {}) as Record<string, unknown>,
                seasonMeta as Record<string, unknown>,
              ) as any,
            } as any);
          } else {
            season = await this.seasonService.create({
              yearStart,
              yearEnd,
              metadata: seasonMeta as any,
            } as any);
          }
          this.seasonsCache = null;
          seasonsProcessed += 1;
        }
      } catch (e: any) {
        errors.push(`league ${leagueId}: ${e?.message ?? e}`);
      }
    }

    return { leaguesProcessed, seasonsProcessed, apiRequests, errors };
  }

  /** Sync standings for a local season (resolves SportMonks season id from metadata). */
  async syncStandings(options: SyncStandingsOptions): Promise<{
    processed: number;
    apiRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    const [seasonRow] = await this.seasonService.getQuery({ where: { id: options.seasonId } });
    if (!seasonRow) {
      return { processed: 0, apiRequests: 0, errors: ['season not found'] };
    }
    const smSeasonId = this.getProviderExternalId(seasonRow.metadata);
    if (!smSeasonId) {
      return { processed: 0, apiRequests: 0, errors: ['season has no sportmonks external id'] };
    }

    const body = await this.http.get<unknown>(
      `/standings/seasons/${smSeasonId}`,
      { include: 'participant;details' },
    );
    const standings = extractSportMonksList<SportMonksStanding>(body);
    let processed = 0;

    const competitions = await this.getCompetitionsCached();
    const smLeagueId = (seasonRow.metadata as any)?.sportmonks?.leagueId;
    const competition = smLeagueId
      ? await this.findLocalCompetitionBySportMonksLeagueId(Number(smLeagueId))
      : competitions[0];

    if (!competition?.id) {
      return { processed: 0, apiRequests: 1, errors: ['no local competition for standings'] };
    }

    for (const row of standings) {
      try {
        const participantId = row.participant_id ?? row.participant?.id;
        if (!participantId) continue;
        const localTeam = await this.upsertTeamFromParticipant(
          row.participant ?? { id: participantId },
          competition.country ?? 'Unknown',
          true,
        );
        if (!localTeam?.id) continue;

        const tcsId = await this.ensureTeamCompetitionSeasonId(
          localTeam.id,
          competition.id,
          seasonRow.id,
        );
        const played = this.standingDetailValue(row.details, SPORTMONKS_STANDING_DETAIL.PLAYED);
        const won = this.standingDetailValue(row.details, SPORTMONKS_STANDING_DETAIL.WON);
        const drawn = this.standingDetailValue(row.details, SPORTMONKS_STANDING_DETAIL.DRAW);
        const lost = this.standingDetailValue(row.details, SPORTMONKS_STANDING_DETAIL.LOST);
        const goalsFor = this.standingDetailValue(row.details, SPORTMONKS_STANDING_DETAIL.GOALS_FOR);
        const goalsAgainst = this.standingDetailValue(row.details, SPORTMONKS_STANDING_DETAIL.GOALS_AGAINST);
        let goalDiff = this.standingDetailValue(row.details, SPORTMONKS_STANDING_DETAIL.GOAL_DIFFERENCE);
        if (!goalDiff && (goalsFor || goalsAgainst)) goalDiff = goalsFor - goalsAgainst;

        const standingMeta = {
          source: 'sportmonks',
          provider: PROVIDER_KEY,
          sportmonksSeasonId: smSeasonId,
          lastSync: new Date().toISOString(),
        };
        const payload: CreateCompetitionStandingDTO = {
          teamCompetitionSeasonId: tcsId,
          position: Number(row.position ?? 0),
          played,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          goalDifference: goalDiff,
          points: Number(row.points ?? 0),
          metadata: standingMeta as any,
        } as any;

        const [existing] = await this.competitionStandingService.getQuery({
          where: { teamCompetitionSeasonId: tcsId },
        });
        if (existing) {
          await this.competitionStandingService.upsertByTeamCompetitionSeasonId(tcsId, {
            ...payload,
            metadata: deepMergeEntityMetadata(
              (existing.metadata ?? {}) as Record<string, unknown>,
              standingMeta as Record<string, unknown>,
            ) as any,
          } as CreateCompetitionStandingDTO);
        } else {
          await this.competitionStandingService.create(payload);
        }
        processed += 1;
      } catch (e: any) {
        errors.push(`standing participant ${row.participant_id}: ${e?.message ?? e}`);
      }
    }

    return { processed, apiRequests: 1, errors };
  }

  private pickCorrelationCandidate(
    pool: readonly any[],
    opts: {
      homeTeamId: number;
      awayTeamId: number;
      scheduledAtMs: number;
      homeScore?: number;
      awayScore?: number;
      sportmonksFixtureId: number;
    },
  ): any | null {
    for (const row of pool) {
      if (row.homeTeamId !== opts.homeTeamId || row.awayTeamId !== opts.awayTeamId) continue;
      const rowMs = row.date ? new Date(row.date).getTime() : NaN;
      if (!Number.isFinite(rowMs) || Math.abs(rowMs - opts.scheduledAtMs) > FIXTURE_CORRELATION_MAX_MS) continue;
      const cur = this.getProviderExternalId(row.metadata);
      if (cur != null && cur !== String(opts.sportmonksFixtureId)) continue;
      const eh = row.homeScore;
      const ea = row.awayScore;
      if (
        opts.homeScore != null &&
        opts.awayScore != null &&
        eh != null &&
        ea != null &&
        (Number(eh) !== opts.homeScore || Number(ea) !== opts.awayScore)
      ) {
        continue;
      }
      return row;
    }
    return null;
  }

  /**
   * Resolve league/season ids from fixture root fields or nested includes.
   */
  private resolveFixtureLeagueSeason(fixture: SportMonksFixture): {
    leagueId?: number;
    seasonId?: number;
  } {
    return {
      leagueId: fixture.league_id ?? fixture.league?.id,
      seasonId: fixture.season_id ?? fixture.season?.id,
    };
  }

  /**
   * Ensure local competition + season exist for a fixture row (fetch or minimal stub).
   */
  private async ensureCompetitionAndSeasonForFixture(
    fixture: SportMonksFixture,
  ): Promise<{ competition: any; season: any } | null> {
    const { leagueId, seasonId } = this.resolveFixtureLeagueSeason(fixture);
    if (!leagueId || !seasonId) return null;

    let competition = await this.findLocalCompetitionBySportMonksLeagueId(leagueId);
    if (!competition) {
      const nestedLeague = fixture.league;
      if (nestedLeague?.id) {
        const countryName = nestedLeague.country?.name ?? 'Unknown';
        competition = await this.competitionService.create({
          name: String(nestedLeague.name ?? `League ${nestedLeague.id}`),
          type: this.mapLeagueType(nestedLeague),
          country: countryName,
          code: nestedLeague.short_code,
          metadata: {
            source: 'sportmonks',
            providers: { [PROVIDER_KEY]: { externalId: String(nestedLeague.id) } },
            sportmonks: { leagueId: nestedLeague.id, lastImportedAt: new Date().toISOString() },
          },
        } as any);
      } else {
      try {
        const body = await this.http.get<unknown>(`/leagues/${leagueId}`, { include: 'country' });
        const league = extractSportMonksEntity<SportMonksLeague>(body);
        if (league?.id) {
          const countryName = league.country?.name ?? 'Unknown';
          competition = await this.competitionService.create({
            name: String(league.name ?? `League ${league.id}`),
            type: this.mapLeagueType(league),
            country: countryName,
            code: league.short_code,
            metadata: {
              source: 'sportmonks',
              providers: { [PROVIDER_KEY]: { externalId: String(league.id) } },
              sportmonks: { leagueId: league.id, lastImportedAt: new Date().toISOString() },
            },
          } as any);
        }
      } catch (e: any) {
        this.logger.warn(`ensureCompetition league ${leagueId}: ${e?.message ?? e}`);
      }
      }
      if (!competition) {
        competition = await this.competitionService.create({
          name: `SportMonks League ${leagueId}`,
          type: CompetitionType.LEAGUE,
          country: 'Unknown',
          metadata: {
            source: 'sportmonks',
            providers: { [PROVIDER_KEY]: { externalId: String(leagueId) } },
            sportmonks: { leagueId, stub: true, lastImportedAt: new Date().toISOString() },
          },
        } as any);
      }
      this.competitionsCache = null;
    }

    let season = await this.findLocalSeasonBySportMonksId(seasonId);
    if (!season) {
      const nestedSeason = fixture.season;
      if (nestedSeason?.id) {
        const { yearStart, yearEnd } = this.parseSeasonYears(nestedSeason);
        season = await this.seasonService.create({
          yearStart,
          yearEnd,
          metadata: {
            source: 'sportmonks',
            providers: { [PROVIDER_KEY]: { externalId: String(nestedSeason.id) } },
            sportmonks: {
              seasonId: nestedSeason.id,
              leagueId,
              name: nestedSeason.name,
              lastImportedAt: new Date().toISOString(),
            },
          },
        } as any);
      } else {
      try {
        const body = await this.http.get<unknown>(`/seasons/${seasonId}`);
        const smSeason = extractSportMonksEntity<SportMonksSeason>(body);
        if (smSeason?.id) {
          const { yearStart, yearEnd } = this.parseSeasonYears(smSeason);
          season = await this.seasonService.create({
            yearStart,
            yearEnd,
            metadata: {
              source: 'sportmonks',
              providers: { [PROVIDER_KEY]: { externalId: String(smSeason.id) } },
              sportmonks: {
                seasonId: smSeason.id,
                leagueId,
                name: smSeason.name,
                lastImportedAt: new Date().toISOString(),
              },
            },
          } as any);
        }
      } catch (e: any) {
        this.logger.warn(`ensureSeason ${seasonId}: ${e?.message ?? e}`);
      }
      }
      if (!season) {
        const y = new Date(fixture.starting_at ?? Date.now()).getFullYear();
        season = await this.seasonService.create({
          yearStart: y,
          yearEnd: y + 1,
          metadata: {
            source: 'sportmonks',
            providers: { [PROVIDER_KEY]: { externalId: String(seasonId) } },
            sportmonks: { seasonId, leagueId, stub: true, lastImportedAt: new Date().toISOString() },
          },
        } as any);
      }
      this.seasonsCache = null;
    }

    return competition?.id && season?.id ? { competition, season } : null;
  }

  private async upsertFixtureRow(
    fixture: SportMonksFixture,
    opts: { createMissingTeams: boolean },
  ): Promise<'created' | 'updated' | 'skipped'> {
    const apiId = fixture.id;
    if (!apiId) return 'skipped';

    const { home: homePart, away: awayPart } = this.resolveHomeAwayParticipants(fixture.participants);
    if (!homePart?.id || !awayPart?.id) return 'skipped';

    const { leagueId, seasonId } = this.resolveFixtureLeagueSeason(fixture);
    let competition = leagueId
      ? await this.findLocalCompetitionBySportMonksLeagueId(leagueId)
      : null;
    let season = seasonId ? await this.findLocalSeasonBySportMonksId(seasonId) : null;
    if (!competition?.id || !season?.id) {
      const ensured = await this.ensureCompetitionAndSeasonForFixture(fixture);
      if (!ensured) return 'skipped';
      competition = ensured.competition;
      season = ensured.season;
    }

    const home = await this.upsertTeamFromParticipant(
      homePart,
      competition.country ?? 'Unknown',
      opts.createMissingTeams,
    );
    const away = await this.upsertTeamFromParticipant(
      awayPart,
      competition.country ?? 'Unknown',
      opts.createMissingTeams,
    );
    if (!home?.id || !away?.id) return 'skipped';

    const stadiumId = await this.ensureStadiumForFixture(
      fixture,
      competition.country ?? 'Unknown',
      home.name ?? homePart.name,
    );

    const date = fixture.starting_at ? new Date(fixture.starting_at) : null;
    if (!date || Number.isNaN(date.getTime())) return 'skipped';

    const { homeScore, awayScore } = this.extractScores(fixture, homePart.id, awayPart.id);
    const richMeta = this.buildSportMonksFixtureMetadataPatch(fixture, homePart.id, awayPart.id);
    const meta = {
      source: 'sportmonks',
      providers: { [PROVIDER_KEY]: { externalId: String(apiId) } },
      ...richMeta,
    };

    const payload: any = {
      date,
      homeTeamId: home.id,
      awayTeamId: away.id,
      competitionId: competition.id,
      seasonId: season.id,
      stadiumId,
      status: this.mapFixtureStatus(fixture.state_id),
      stage: FixtureStage.LEAGUE,
      homeScore,
      awayScore,
      metadata: meta,
    };

    let existing = await this.findLocalFixtureBySportMonksId(apiId);
    if (!existing) {
      const pool = await this.fixtureService.getQuery({
        where: { competitionId: competition.id, seasonId: season.id },
      });
      existing = this.pickCorrelationCandidate(pool, {
        homeTeamId: home.id,
        awayTeamId: away.id,
        scheduledAtMs: date.getTime(),
        homeScore,
        awayScore,
        sportmonksFixtureId: apiId,
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

  /** Import fixtures for a date window (optionally filtered by league/season). */
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

    const params: Record<string, string | number | boolean | undefined> = {
      include: SPORTMONKS_FIXTURE_LIST_INCLUDES,
      timezone: options.timezone ?? 'UTC',
      per_page: 50,
    };
    const filters: string[] = [];
    if (options.sportmonksSeasonId) filters.push(`fixtureSeasons:${options.sportmonksSeasonId}`);
    if (options.leagueId) filters.push(`fixtureLeagues:${options.leagueId}`);
    if (filters.length) params.filters = filters.join(';');

    const path = `/fixtures/between/${options.from}/${options.to}`;
    const { items, apiRequests: listRequests } = await this.http.getAllPages<SportMonksFixture>(
      path,
      params,
      { maxPages: options.maxPages ?? 20, maxRequests: options.maxRequests ?? 30 },
    );
    apiRequests += listRequests;

    const createMissingTeams = options.createMissingTeams !== false;
    for (const fx of items) {
      try {
        const outcome = await this.upsertFixtureRow(fx, { createMissingTeams });
        if (outcome === 'created') created += 1;
        else if (outcome === 'updated') updated += 1;
        else skipped += 1;
      } catch (e: any) {
        errors.push(`fixture ${fx.id}: ${e?.message ?? e}`);
        skipped += 1;
      }
    }

    if (options.syncDetailsAfter && items.length) {
      const budget = options.syncDetailsMaxRequests ?? Math.min(items.length, 50);
      const cap = Math.min(items.length, budget);
      for (const fx of items.slice(0, cap)) {
        if (apiRequests >= (options.maxRequests ?? 30) + budget) break;
        try {
          const local = await this.findLocalFixtureBySportMonksId(fx.id);
          if (!local?.id) continue;
          const r = await this.syncFixtureDetails({ fixtureId: local.id, sportmonksFixtureId: fx.id });
          apiRequests += r.apiRequests;
          if (r.ok) detailsSynced += 1;
          else if (r.error) errors.push(`details ${fx.id}: ${r.error}`);
        } catch (e: any) {
          errors.push(`details ${fx.id}: ${e?.message ?? e}`);
        }
      }
    }

    return { created, updated, skipped, detailsSynced, apiRequests, errors };
  }

  /** Sync events, lineups, statistics and rich metadata for one fixture. */
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
    let smFixtureId = options.sportmonksFixtureId;
    let localFixture = options.fixtureId
      ? (await this.fixtureService.getQuery({ where: { id: options.fixtureId } }))?.[0]
      : null;

    if (!smFixtureId && localFixture) {
      smFixtureId = Number(this.getProviderExternalId(localFixture.metadata));
    }
    if (!localFixture && smFixtureId) {
      localFixture = await this.findLocalFixtureBySportMonksId(smFixtureId);
    }
    if (!smFixtureId || !localFixture?.id) {
      return {
        ok: false,
        goals: 0,
        cards: 0,
        substitutions: 0,
        lineupPlayers: 0,
        statsSynced: 0,
        apiRequests: 0,
        error: 'fixture not found locally or sportmonks id missing',
      };
    }

    const body = await this.http.get<unknown>(
      `/fixtures/${smFixtureId}`,
      { include: SPORTMONKS_FIXTURE_DETAIL_INCLUDES },
    );
    const fx = extractSportMonksEntity<SportMonksFixture>(body);
    if (!fx) {
      return {
        ok: false,
        goals: 0,
        cards: 0,
        substitutions: 0,
        lineupPlayers: 0,
        statsSynced: 0,
        apiRequests: 1,
        error: 'empty fixture response',
      };
    }

    const { home: homePart, away: awayPart } = this.resolveHomeAwayParticipants(fx.participants);
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
        apiRequests: 1,
        error: 'fixture missing home or away team id',
      };
    }

    const teamByParticipant = new Map<number, number>();
    for (const p of fx.participants ?? []) {
      if (p.meta?.location === 'home') teamByParticipant.set(p.id, homeTeamId);
      if (p.meta?.location === 'away') teamByParticipant.set(p.id, awayTeamId);
    }

    let goals = 0;
    let cards = 0;
    let substitutions = 0;
    let lineupPlayers = 0;

    for (const ev of fx.events ?? []) {
      try {
        if (
          ev.type_id === SPORTMONKS_EVENT_TYPE.GOAL ||
          ev.type_id === SPORTMONKS_EVENT_TYPE.PENALTY_GOAL
        ) {
          const n = await this.syncGoalEvent(ev, localFixture.id, teamByParticipant);
          if (n) goals += 1;
        } else if (ev.type_id === SPORTMONKS_EVENT_TYPE.OWN_GOAL) {
          const n = await this.syncGoalEvent(ev, localFixture.id, teamByParticipant, { ownGoal: true });
          if (n) goals += 1;
        } else if (
          ev.type_id === SPORTMONKS_EVENT_TYPE.YELLOW ||
          ev.type_id === SPORTMONKS_EVENT_TYPE.YELLOW_RED ||
          ev.type_id === SPORTMONKS_EVENT_TYPE.RED
        ) {
          const n = await this.syncCardEvent(ev, localFixture.id, teamByParticipant);
          if (n) cards += 1;
        } else if (ev.type_id === SPORTMONKS_EVENT_TYPE.SUBSTITUTION) {
          const n = await this.syncSubstitutionEvent(ev, localFixture.id, teamByParticipant);
          if (n) substitutions += 1;
        }
      } catch (e: any) {
        this.logger.warn(`event ${ev.id} on fixture ${smFixtureId}: ${e?.message ?? e}`);
      }
    }

    const formationByTeam = new Map<number, string>();
    for (const f of fx.formations ?? []) {
      const teamId = f.participant_id ? teamByParticipant.get(f.participant_id) : undefined;
      if (teamId && f.formation) formationByTeam.set(teamId, f.formation);
    }

    const lineupsByTeam = new Map<number, SportMonksLineup[]>();
    for (const lu of fx.lineups ?? []) {
      const tid = lu.team_id;
      if (!tid) continue;
      const list = lineupsByTeam.get(tid) ?? [];
      list.push(lu);
      lineupsByTeam.set(tid, list);
    }

    for (const [smTeamId, rows] of lineupsByTeam) {
      const localTeam = await this.findLocalTeamBySportMonksId(smTeamId);
      if (!localTeam?.id) continue;
      const managerId = await this.getOrCreatePlaceholderManager();
      let [lineUp] = await this.lineupService.getQuery({
        where: { fixtureId: localFixture.id, teamId: localTeam.id },
      });
      if (!lineUp) {
        lineUp = await this.lineupService.create({
          fixtureId: localFixture.id,
          teamId: localTeam.id,
          managerId,
          formation: formationByTeam.get(localTeam.id),
          metadata: { source: 'sportmonks', lastSync: new Date().toISOString() },
        } as any);
      } else if (formationByTeam.get(localTeam.id)) {
        await this.lineupService.update(lineUp.id, {
          id: lineUp.id,
          formation: formationByTeam.get(localTeam.id),
        } as any);
      }

      for (const row of rows) {
        const playerSrc = row.player ?? { id: row.player_id ?? 0, name: row.player_name };
        if (!playerSrc.id) continue;
        const player = await this.upsertPlayerFromSportMonks(playerSrc as any);
        if (!player?.id) continue;

        const isStarting = row.type_id === SPORTMONKS_LINEUP_TYPE.STARTER;
        const minutesPlayed = this.lineupDetailValue(row.details, SPORTMONKS_LINEUP_DETAIL.MINUTES_PLAYED);
        const rating = this.lineupDetailValue(row.details, SPORTMONKS_LINEUP_DETAIL.RATING);
        const pluMeta = {
          source: 'sportmonks',
          jerseyNumber: row.jersey_number,
          ...(minutesPlayed != null ? { minutesPlayed } : {}),
          ...(rating != null ? { rating } : {}),
        };
        const [existingPlu] = await this.playerLineUpService.getQuery({
          where: { lineupId: lineUp.id, playerId: player.id },
        });
        if (existingPlu) {
          await this.playerLineUpService.update(existingPlu.id, {
            id: existingPlu.id,
            isStarting,
            isCaptain: !!row.captain,
            positionId: row.position_id ?? existingPlu.positionId,
            metadata: deepMergeEntityMetadata(
              (existingPlu.metadata ?? {}) as Record<string, unknown>,
              pluMeta as Record<string, unknown>,
            ) as any,
          } as any);
        } else {
          await this.playerLineUpService.create({
            lineupId: lineUp.id,
            playerId: player.id,
            isStarting,
            isCaptain: !!row.captain,
            positionId: row.position_id,
            metadata: pluMeta as any,
          } as any);
        }
        lineupPlayers += 1;
      }
    }

    let statsSynced = 0;
    for (const p of fx.participants ?? []) {
      const localTeamId = teamByParticipant.get(p.id);
      if (!localTeamId) continue;
      const teamStats = this.teamLevelStatistics(fx.statistics, p.id);
      if (!teamStats.length) continue;
      const side =
        p.meta?.location === 'home' ? FixtureTeamStatSide.HOME : FixtureTeamStatSide.AWAY;
      await this.fixtureTeamStatService.upsertFromSportMonksStatistics(
        localFixture.id,
        localTeamId,
        side,
        teamStats,
      );
      statsSynced += 1;
    }

    const richMeta = this.buildSportMonksFixtureMetadataPatch(
      fx,
      homePart?.id,
      awayPart?.id,
    );
    await this.fixtureService.update(localFixture.id, {
      id: localFixture.id,
      metadata: deepMergeEntityMetadata(
        (localFixture.metadata ?? {}) as Record<string, unknown>,
        {
          source: 'sportmonks',
          providers: { [PROVIDER_KEY]: { externalId: String(smFixtureId) } },
          ...richMeta,
        } as Record<string, unknown>,
      ) as any,
    } as any);

    return { ok: true, goals, cards, substitutions, lineupPlayers, statsSynced, apiRequests: 1 };
  }

  private resolveTeamId(
    ev: SportMonksEvent,
    teamByParticipant: Map<number, number>,
  ): number | undefined {
    if (ev.participant_id) return teamByParticipant.get(ev.participant_id);
    return undefined;
  }

  private async syncGoalEvent(
    ev: SportMonksEvent,
    fixtureId: number,
    teamByParticipant: Map<number, number>,
    flags?: { ownGoal?: boolean },
  ): Promise<boolean> {
    const teamId = this.resolveTeamId(ev, teamByParticipant);
    if (!teamId || !ev.player_id) return false;
    const scorer = await this.upsertPlayerFromSportMonks({
      id: ev.player_id,
      name: ev.player_name,
    });
    if (!scorer?.id) return false;
    let assistantId: number | undefined;
    if (ev.related_player_id) {
      const assist = await this.upsertPlayerFromSportMonks({ id: ev.related_player_id });
      assistantId = assist?.id;
    }

    const eventKey = String(ev.id);
    const [byMeta] = await this.goalService.getQuery({
      where: { fixtureId, metadata: { sportmonksEventId: eventKey } as any },
    });
    if (byMeta) return false;

    const minute = Number(ev.minute ?? 0) + Number(ev.extra_minute ?? 0);
    const [dup] = await this.goalService.getQuery({
      where: { fixtureId, scorerId: scorer.id, minute, teamId },
    });
    if (dup) return false;

    await this.goalService.create({
      fixtureId,
      teamId,
      scorerId: scorer.id,
      assistantId,
      minute,
      ownGoal: !!flags?.ownGoal,
      penalty: ev.type_id === SPORTMONKS_EVENT_TYPE.PENALTY_GOAL,
      metadata: {
        source: 'sportmonks',
        sportmonksEventId: eventKey,
        providers: { [PROVIDER_KEY]: { externalId: eventKey } },
      },
    } as any);
    return true;
  }

  private async syncCardEvent(
    ev: SportMonksEvent,
    fixtureId: number,
    teamByParticipant: Map<number, number>,
  ): Promise<boolean> {
    const teamId = this.resolveTeamId(ev, teamByParticipant);
    if (!teamId || !ev.player_id) return false;
    const player = await this.upsertPlayerFromSportMonks({ id: ev.player_id, name: ev.player_name });
    if (!player?.id) return false;

    let cardType = CardType.YELLOW;
    if (ev.type_id === SPORTMONKS_EVENT_TYPE.RED || ev.type_id === SPORTMONKS_EVENT_TYPE.YELLOW_RED) {
      cardType = CardType.RED;
    }

    const eventKey = String(ev.id);
    const [byMeta] = await this.cardService.getQuery({
      where: { fixtureId, metadata: { sportmonksEventId: eventKey } as any },
    });
    if (byMeta) return false;

    const minute = Number(ev.minute ?? 0) + Number(ev.extra_minute ?? 0);
    await this.cardService.create({
      fixtureId,
      teamId,
      playerId: player.id,
      minute,
      type: cardType,
      metadata: {
        source: 'sportmonks',
        sportmonksEventId: eventKey,
        providers: { [PROVIDER_KEY]: { externalId: eventKey } },
      },
    } as any);
    return true;
  }

  private async syncSubstitutionEvent(
    ev: SportMonksEvent,
    fixtureId: number,
    teamByParticipant: Map<number, number>,
  ): Promise<boolean> {
    const teamId = this.resolveTeamId(ev, teamByParticipant);
    if (!teamId || !ev.player_id || !ev.related_player_id) return false;
    const playerIn = await this.upsertPlayerFromSportMonks({ id: ev.player_id, name: ev.player_name });
    const playerOut = await this.upsertPlayerFromSportMonks({ id: ev.related_player_id });
    if (!playerIn?.id || !playerOut?.id) return false;

    const eventKey = String(ev.id);
    const [dup] = await this.substitutionService.getQuery({
      where: {
        fixtureId,
        playerInId: playerIn.id,
        playerOutId: playerOut.id,
        metadata: { sportmonksEventId: eventKey } as any,
      },
    });
    if (dup) return false;

    const minute = Number(ev.minute ?? 0) + Number(ev.extra_minute ?? 0);
    await this.substitutionService.create({
      fixtureId,
      teamId,
      playerInId: playerIn.id,
      playerOutId: playerOut.id,
      minute,
      metadata: {
        source: 'sportmonks',
        sportmonksEventId: eventKey,
        providers: { [PROVIDER_KEY]: { externalId: eventKey } },
      },
    } as any);
    return true;
  }

  /**
   * Import season squads into `playerTeamStint`.
   * Uses `GET /squads/seasons/{sportmonksSeasonId}/teams/{sportmonksTeamId}?include=player`.
   */
  async importSquads(options: {
    seasonId: number;
    maxRequests?: number;
    teamIds?: number[];
  }): Promise<{
    teamsProcessed: number;
    playersLinked: number;
    stintsOpened: number;
    stintsClosed: number;
    apiRequests: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let apiRequests = 0;
    let teamsProcessed = 0;
    let playersLinked = 0;
    let stintsOpened = 0;
    let stintsClosed = 0;
    const maxRequests = options.maxRequests ?? 40;

    const [seasonRow] = await this.seasonService.getQuery({ where: { id: options.seasonId } });
    if (!seasonRow) {
      return {
        teamsProcessed: 0,
        playersLinked: 0,
        stintsOpened: 0,
        stintsClosed: 0,
        apiRequests: 0,
        errors: ['season not found'],
      };
    }
    const smSeasonId = this.getProviderExternalId(seasonRow.metadata);
    if (!smSeasonId) {
      return {
        teamsProcessed: 0,
        playersLinked: 0,
        stintsOpened: 0,
        stintsClosed: 0,
        apiRequests: 0,
        errors: ['season has no sportmonks external id'],
      };
    }

    let tcsRows = await this.teamCompetitionSeasonService.getQuery({
      where: { seasonId: options.seasonId },
    });
    if (options.teamIds?.length) {
      const wanted = new Set(options.teamIds);
      tcsRows = tcsRows.filter((r) => wanted.has(r.teamId));
    }

    const teams = await this.getTeamsCached();
    const teamById = new Map(teams.map((t) => [t.id as number, t]));

    const targets: Array<{ localTeamId: number; smTeamId: string }> = [];
    for (const row of tcsRows) {
      const team = teamById.get(row.teamId);
      const smTeamId = this.getProviderExternalId(team?.metadata);
      if (!smTeamId) continue;
      targets.push({ localTeamId: row.teamId, smTeamId });
    }

    if (targets.length === 0 && apiRequests < maxRequests) {
      try {
        const listed = await this.http.getAllPages<SportMonksParticipant>(
          `/teams/seasons/${smSeasonId}`,
          { per_page: 50 },
          { maxPages: 5, maxRequests: Math.min(5, maxRequests) },
        );
        apiRequests += listed.apiRequests;
        await this.http.delay();
        for (const p of listed.items) {
          if (!p?.id) continue;
          const local = await this.findLocalTeamBySportMonksId(p.id);
          if (!local?.id) continue;
          targets.push({ localTeamId: local.id, smTeamId: String(p.id) });
        }
      } catch (e: any) {
        errors.push(`teams/seasons ${smSeasonId}: ${e?.message ?? e}`);
      }
    }

    for (const target of targets) {
      if (apiRequests >= maxRequests) break;
      try {
        const body = await this.http.get<unknown>(
          `/squads/seasons/${smSeasonId}/teams/${target.smTeamId}`,
          { include: 'player' },
        );
        apiRequests += 1;
        await this.http.delay();
        const squad = extractSportMonksList<SportMonksSquadPlayer>(body);
        const playerIds: number[] = [];
        const kitByPlayerId: Record<number, number> = {};
        for (const row of squad) {
          const src = row.player ?? (row.player_id ? { id: row.player_id } : null);
          if (!src?.id) continue;
          const localPlayer = await this.upsertPlayerFromSportMonks(src as any);
          if (!localPlayer?.id) continue;
          playerIds.push(localPlayer.id);
          playersLinked += 1;
          const kit = row.jersey_number != null ? Number(row.jersey_number) : NaN;
          if (Number.isFinite(kit) && kit > 0) kitByPlayerId[localPlayer.id] = kit;
        }
        const stints = await this.playerTeamStintService.syncCurrentRosterFromImport(
          target.localTeamId,
          playerIds,
          options.seasonId,
          kitByPlayerId,
        );
        stintsOpened += stints.opened;
        stintsClosed += stints.closed;
        teamsProcessed += 1;
      } catch (e: any) {
        errors.push(`squad team ${target.smTeamId}: ${e?.message ?? e}`);
      }
    }

    this.logger.log(
      `importSquads season ${options.seasonId}: ${teamsProcessed} teams, ${playersLinked} players, +${stintsOpened} stints (${apiRequests} req)`,
    );
    return {
      teamsProcessed,
      playersLinked,
      stintsOpened,
      stintsClosed,
      apiRequests,
      errors,
    };
  }

  /** Full pipeline: leagues → fixtures → standings → optional details. */
  async runPipeline(options: SportMonksPipelineOptions): Promise<Record<string, unknown>> {
    let remaining = Math.max(0, options.maxApiRequests);
    const summary: Record<string, unknown> = {};

    const leagues = await this.importLeagues({
      leagueIds: options.leagueIds,
      currentSeasonOnly: true,
    });
    summary.leagues = leagues;
    remaining = Math.max(0, remaining - leagues.apiRequests);

    if (remaining > 0) {
      const detailsBudget = options.syncFixtureDetails ? Math.max(0, remaining - 2) : 0;
      const fixtures = await this.importFixtures({
        from: options.from,
        to: options.to,
        timezone: options.timezone,
        maxRequests: remaining,
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
      const leaguesSucceeded = Number((summary.leagues as any)?.leaguesProcessed ?? 0) > 0;
      const localSeasonIds = seasons
        .filter((s) => {
          if (!this.getProviderExternalId(s.metadata)) return false;
          if (!leaguesSucceeded) return true;
          const lid = (s.metadata as any)?.sportmonks?.leagueId;
          return lid != null && options.leagueIds.includes(Number(lid));
        })
        .map((s) => s.id);
      let standingsProcessed = 0;
      const standingErrors: string[] = [];
      for (const seasonId of localSeasonIds) {
        if (remaining < 1) break;
        const r = await this.syncStandings({ seasonId });
        remaining -= r.apiRequests;
        standingsProcessed += r.processed;
        standingErrors.push(...r.errors);
      }
      summary.standings = { processed: standingsProcessed, errors: standingErrors };
    } else if (options.syncStandings === false) {
      summary.standings = { processed: 0, errors: [], skipped: true };
    } else {
      summary.standings = { processed: 0, errors: [] };
    }

    if (options.syncSquads !== false && remaining > 0) {
      this.invalidateCaches();
      const seasons = await this.getSeasonsCached();
      const localSeasonIds = seasons
        .filter((s) => {
          const ext = this.getProviderExternalId(s.metadata);
          if (!ext) return false;
          const lid = (s.metadata as any)?.sportmonks?.leagueId;
          return lid != null && options.leagueIds.includes(Number(lid));
        })
        .map((s) => s.id);
      const squadSummary: Record<string, unknown>[] = [];
      for (const seasonId of localSeasonIds) {
        if (remaining < 1) break;
        const r = await this.importSquads({ seasonId, maxRequests: remaining });
        remaining = Math.max(0, remaining - r.apiRequests);
        squadSummary.push(r);
      }
      summary.squads = squadSummary;
    } else if (options.syncSquads === false) {
      summary.squads = { skipped: true };
    }

    summary.apiRequestsRemaining = remaining;
    this.invalidateCaches();
    return summary;
  }
}
