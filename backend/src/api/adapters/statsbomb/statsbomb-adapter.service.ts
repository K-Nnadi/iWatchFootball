import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Goal} from '../../modules/goal/goal.entity';
import {Card} from '../../modules/card/card.entity';
import {Substitution} from '../../modules/substitution/substitution.entity';
import {Position} from '../../modules/position/position.entity';
import {Stadium} from '../../modules/stadium/stadium.entity';
import {CompetitionType} from '../../enums/competition.enum';
import {FixtureStage, FixtureStatus} from '../../enums/fixture.enum';
import {StatsBombHttpService} from './statsbomb-http.service';
import {PlayerFixtureStatService} from '../../modules/playerFixtureStat/player-fixture-stat.service';
import type {StatsBombEventForRollup} from '../../modules/playerFixtureStat/player-fixture-stat.service';
import {FixtureTeamStatService} from '../../modules/fixtureTeamStat/fixtureTeamStat.service';
import {CompetitionService} from '../../modules/competition/competition.module';
import {SeasonService} from '../../modules/season/season.module';
import {TeamService} from '../../modules/team/team.module';
import {StadiumService} from '../../modules/stadium/stadium.module';
import {PositionService} from '../../modules/position/position.module';
import {FixtureService} from '../../modules/fixture/fixture.module';
import {GoalService} from '../../modules/goal/goal.module';
import {PlayerService} from '../../modules/player/player.module';
import {CardService} from '../../modules/card/card.module';
import {SubstitutionService} from '../../modules/substitution/substitution.module';
import {TeamCompetitionSeasonService} from "../../modules/teamCompetitionSeason/teamCompetitionSeason.module";
import {LineupService} from "../../modules/lineUp/lineUp.module";
import {PlayerLineUpService} from "../../modules/playerLineUp/playerLineUp.module";
import {ManagerService} from "../../modules/manager/manager.module";
import {TeamType} from "../../enums/team.enum";
import {PositionType} from "../../enums/position.enum";
import {CardType} from "../../enums/card.enum";
import {deepMergeEntityMetadata} from '@iWatchFootball/base-tools/entity/entityMetadata';
import { deriveStatsBombPenaltyShootout } from '../../../shared/fixture-result.util';

// StatsBomb API Types
interface StatsBombCompetition {
  competition_id: number;
  season_id: number;
  country_name: string;
  competition_name: string;
  season_name: string;
  match_updated: string;
  match_updated_360: string;
  match_available: string;
  match_available_360: string;
}

interface StatsBombMatch {
  match_id: number;
  match_date: string;
  kick_off: string;
  competition: {
    competition_id: number;
    country_name: string;
    competition_name: string;
  };
  season: {
    season_id: number;
    season_name: string;
  };
  home_team: {
    home_team_id: number;
    home_team_name: string;
    home_team_gender: string;
    home_team_group: string;
    home_team_country: string;
    home_team_manager: {
      id: number;
      name: string;
      nickname: string;
      dob: string;
      country: string;
    };
  };
  away_team: {
    away_team_id: number;
    away_team_name: string;
    away_team_gender: string;
    away_team_group: string;
    away_team_country: string;
    away_team_manager: {
      id: number;
      name: string;
      nickname: string;
      dob: string;
      country: string;
    };
  };
  home_score: number;
  away_score: number;
  match_status: string;
  match_week: number;
  competition_stage: {
    id: number;
    name: string;
  };
  stadium: {
    id: number;
    name: string;
    country: string;
  };
  referee: {
    id: number;
    name: string;
    country: string;
  };
}

/** Max |Δkickoff| when matching a StatsBomb/API-Sports fixture to an existing DB row cross-provider */
const FIXTURE_CORRELATION_MAX_MS = 6 * 60 * 60 * 1000;

interface StatsBombEvent {
  id: string;
  index: number;
  period: number;
  timestamp: string;
  minute: number;
  second: number;
  type: {
    id: number;
    name: string;
  };
  possession: number;
  possession_team: {
    id: number;
    name: string;
  };
  play_pattern: {
    id: number;
    name: string;
  };
  team: {
    id: number;
    name: string;
  };
  player?: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    name: string;
  };
  location: [number, number];
  duration?: number;
  under_pressure?: boolean;
  off_camera?: boolean;
  out?: boolean;
  tactics?: {
    formation: number;
    /** Open-data uses `lineup`; some feeds use `line_up`. */
    lineup?: Array<{
      player: {
        id: number;
        name: string;
      };
      position: {
        id: number;
        name: string;
      };
      jersey_number: number;
    }>;
    line_up?: Array<{
      player: {
        id: number;
        name: string;
      };
      position: {
        id: number;
        name: string;
      };
      jersey_number: number;
    }>;
  };
  shot?: {
    key_pass_id?: string;
    end_location: [number, number];
    aerial_won?: boolean;
    follows_dribble?: boolean;
    first_time?: boolean;
    open_goal?: boolean;
    technique: {
      id: number;
      name: string;
    };
    body_part: {
      id: number;
      name: string;
    };
    type: {
      id: number;
      name: string;
    };
    outcome: {
      id: number;
      name: string;
    };
  };
  pass?: {
    recipient: {
      id: number;
      name: string;
    };
    length: number;
    angle: number;
    height: {
      id: number;
      name: string;
    };
    end_location: [number, number];
    assisted_shot_id?: string;
    backheel?: boolean;
    deflected?: boolean;
    miscommunication?: boolean;
    cross?: boolean;
    cut_back?: boolean;
    switch?: boolean;
    shot_assist?: boolean;
    goal_assist?: boolean;
    through_ball?: boolean;
    technique: {
      id: number;
      name: string;
    };
    body_part: {
      id: number;
      name: string;
    };
    type: {
      id: number;
      name: string;
    };
    outcome: {
      id: number;
      name: string;
    };
  };
  bad_behaviour?: {
    card: {
      id: number;
      name: string;
    };
  };
  foul_committed?: {
    card?: {
      id: number;
      name: string;
    };
  };
  substitution?: {
    outcome: {
      id: number;
      name: string;
    };
    replacement: {
      id: number;
      name: string;
    };
  };
}

interface StatsBombLineup {
  team_id: number;
  team_name: string;
  lineup: Array<{
    player_id: number;
    player_name: string;
    player_nickname: string;
    jersey_number: number;
    country: {
      id: number;
      name: string;
    };
    positions: Array<{
      position_id: number;
      position: string;
      from: string;
      to: string;
      from_period: number;
      to_period: number;
      start_reason: string;
      end_reason: string;
    }>;
  }>;
}

interface SyncEventsFromMatchOptions {
  skipCards?: boolean;
  skipGoals?: boolean;
  skipStartingXi?: boolean;
  skipLineups?: boolean;
  matchData?: StatsBombMatch;
}

@Injectable()
export class StatsBombAdapterService {
  private readonly logger = new Logger(StatsBombAdapterService.name);
  private readonly teamSyncLocks = new Map<string, Promise<void>>();
  private readonly playerSyncLocks = new Map<string, Promise<void>>();
  private readonly teamCompetitionSeasonLocks = new Map<string, Promise<void>>();
  private readonly providerKey = 'statsbomb';

  // Per-run caches to avoid repeatedly loading entire tables.
  private cachedTeams: any[] | null = null;
  private cachedCompetitions: any[] | null = null;
  private cachedSeasons: any[] | null = null;
  private cachedPlayers: any[] | null = null;
  private cachedPositions: Position[] | null = null;
  private readonly positionLocks = new Map<string, Promise<void>>();
  private cachedStadiums: Stadium[] | null = null;
  private readonly stadiumLocks = new Map<string, Promise<void>>();

  constructor(
    private competitionService: CompetitionService,
    private seasonService: SeasonService,
    private teamService: TeamService,
    private playerService: PlayerService,
    private teamCompetitionSeasonService: TeamCompetitionSeasonService,
    private lineupService: LineupService,
    private playerLineUpService: PlayerLineUpService,
    private managerService: ManagerService,
    private fixtureService: FixtureService,
    private goalService: GoalService,
    private positionService: PositionService,
    private stadiumService: StadiumService,
    private cardService: CardService,
    private substitutionService: SubstitutionService,
    private readonly httpService: StatsBombHttpService,
    private readonly playerFixtureStatService: PlayerFixtureStatService,
    private readonly fixtureTeamStatService: FixtureTeamStatService,
    @InjectRepository(Goal) private readonly goalRepository: Repository<Goal>,
    @InjectRepository(Card) private readonly cardRepository: Repository<Card>,
    @InjectRepository(Substitution)
    private readonly substitutionRepository: Repository<Substitution>,
  ) {}

  /**
   * Main method to sync StatsBomb data with local database
   */
  async syncStatsBombData(options?: {
    skipFixtures?: boolean;
    skipCards?: boolean;
    skipPlayers?: boolean;
    skipGoals?: boolean;
    skipStadiums?: boolean;
    skipLineups?: boolean;
    skipStartingXi?: boolean;
    /** When true (default), skip competition-seasons whose upstream match_updated watermark is unchanged. */
    incremental?: boolean;
    /** When true, re-process all competition-seasons regardless of watermarks. */
    forceFull?: boolean;
  }): Promise<void> {
    const incremental = options?.forceFull ? false : options?.incremental !== false;
    try {
      this.logger.log(
        `🚀 Starting StatsBomb data synchronization${incremental ? ' (incremental)' : ' (full)'}...`,
      );

      // Reset caches for this run
      this.cachedTeams = null;
      this.cachedCompetitions = null;
      this.cachedSeasons = null;
      this.cachedPlayers = null;
      this.cachedPositions = null;
      this.cachedStadiums = null;
      
      // Step 1: Fetch and sync competitions
      this.logger.log('📊 Step 1: Syncing competitions...');
      await this.syncCompetitions();
      
      // Step 2: Fetch and sync teams and players
      this.logger.log('👥 Step 2: Syncing teams and players...');
      if (!options?.skipPlayers) {
        await this.syncTeamsAndPlayers({ incremental });
      }
      
      // Step 3: Fetch and sync fixtures
      this.logger.log('⚽ Step 3: Syncing fixtures...');
      if (!options?.skipFixtures) {
        await this.syncFixtures({ ...options, incremental });
      }
      
      // Step 4: Fetch and sync events (goals, etc.)
      this.logger.log('🎯 Step 4: Syncing events...');
      await this.syncEvents({
        skipCards: options?.skipCards,
        skipGoals: options?.skipGoals,
        skipStartingXi: options?.skipStartingXi,
        skipLineups: options?.skipLineups,
        incremental,
      });
      
      this.logger.log('✅ StatsBomb data synchronization completed successfully');
    } catch (error) {
      this.logger.error('❌ Error during StatsBomb data synchronization:', error);
      throw error;
    }
  }

  /**
   * Test method to verify team creation works
   */
  async testTeamCreation(): Promise<any> {
    try {
      this.logger.log('Testing team creation...');
      
      const testTeamData = {
        name: 'Test Team',
        country: 'Test Country',
        type: TeamType.CLUB,
        metadata: {
          source: 'StatsBomb',
          statsbombId: 99999,
          providers: {
            statsbomb: {
              externalId: '99999',
            },
          },
          lastSync: new Date().toISOString()
        }
      };
      
      const createdTeam = await this.teamService.create(testTeamData);
      this.logger.log(`✅ Test team created successfully: ${JSON.stringify(createdTeam)}`);
      
      return createdTeam;
    } catch (error) {
      this.logger.error('❌ Test team creation failed:', error);
      throw error;
    }
  }

  /**
   * Fetch competitions from StatsBomb API
   */
  private async fetchCompetitions(): Promise<StatsBombCompetition[]> {
    try {
      return await this.httpService.fetchCompetitions();
    } catch (error) {
      this.logger.error('Error fetching competitions:', error);
      throw error;
    }
  }

  private getProviderExternalIdFromMetadata(metadata: any): string | null {
    const externalId = metadata?.providers?.[this.providerKey]?.externalId;
    return externalId !== undefined && externalId !== null ? String(externalId) : null;
  }

  private getLegacyStatsBombIdFromMetadata(metadata: any): string | null {
    const legacyId = metadata?.statsbombId;
    return legacyId !== undefined && legacyId !== null ? String(legacyId) : null;
  }

  private getLegacyStatsBombSeasonIdFromMetadata(metadata: any): string | null {
    const legacyId = metadata?.statsbombSeasonId ?? metadata?.seasonId;
    return legacyId !== undefined && legacyId !== null ? String(legacyId) : null;
  }

  private getLegacyStatsBombEventIdFromMetadata(metadata: any): string | null {
    const legacyId = metadata?.statsbombEventId;
    return legacyId !== undefined && legacyId !== null ? String(legacyId) : null;
  }

  private async getTeamsCached(): Promise<any[]> {
    if (!this.cachedTeams) {
      this.cachedTeams = await this.teamService.getQuery({});
    }
    return this.cachedTeams;
  }

  private async getCompetitionsCached(): Promise<any[]> {
    if (!this.cachedCompetitions) {
      this.cachedCompetitions = await this.competitionService.getQuery({});
    }
    return this.cachedCompetitions;
  }

  private async getSeasonsCached(): Promise<any[]> {
    if (!this.cachedSeasons) {
      this.cachedSeasons = await this.seasonService.getQuery({});
    }
    return this.cachedSeasons;
  }

  private async getPlayersCached(): Promise<any[]> {
    if (!this.cachedPlayers) {
      this.cachedPlayers = await this.playerService.getQuery({});
    }
    return this.cachedPlayers;
  }

  private async findTeamByStatsBombTeamId(statsbombTeamId: number): Promise<any | null> {
    if (!statsbombTeamId) return null;
    const teams = await this.getTeamsCached();
    const targetId = String(statsbombTeamId);

    return (
      teams.find((team: any) => {
        const metadata = team?.metadata ?? {};
        const providerExternalId = this.getProviderExternalIdFromMetadata(metadata);
        const legacyStatsBombId = this.getLegacyStatsBombIdFromMetadata(metadata);
        return providerExternalId === targetId || legacyStatsBombId === targetId;
      }) ?? null
    );
  }

  private async findCompetitionByStatsBombCompetitionId(statsbombCompetitionId: number): Promise<any | null> {
    if (!statsbombCompetitionId) return null;
    const competitions = await this.getCompetitionsCached();
    const targetId = String(statsbombCompetitionId);

    return (
      competitions.find((competition: any) => {
        const metadata = competition?.metadata ?? {};
        const providerExternalId = this.getProviderExternalIdFromMetadata(metadata);
        const legacyStatsBombId = this.getLegacyStatsBombIdFromMetadata(metadata);
        return providerExternalId === targetId || legacyStatsBombId === targetId;
      }) ?? null
    );
  }

  private async findSeasonByStatsBombSeasonId(statsbombSeasonId: number): Promise<any | null> {
    if (!statsbombSeasonId) return null;
    const seasons = await this.getSeasonsCached();
    const targetId = String(statsbombSeasonId);

    return (
      seasons.find((season: any) => {
        const metadata = season?.metadata ?? {};
        const providerExternalId = this.getProviderExternalIdFromMetadata(metadata);
        const legacyStatsBombSeasonId = this.getLegacyStatsBombSeasonIdFromMetadata(metadata);
        return providerExternalId === targetId || legacyStatsBombSeasonId === targetId;
      }) ?? null
    );
  }

  private async findPlayerByStatsBombPlayerId(statsbombPlayerId: number): Promise<any | null> {
    if (!statsbombPlayerId) return null;
    const players = await this.getPlayersCached();
    const targetId = String(statsbombPlayerId);

    return (
      players.find((player: any) => {
        const metadata = player?.metadata ?? {};
        const providerExternalId = this.getProviderExternalIdFromMetadata(metadata);
        const legacyStatsBombId = this.getLegacyStatsBombIdFromMetadata(metadata);
        return providerExternalId === targetId || legacyStatsBombId === targetId;
      }) ?? null
    );
  }

  /** Scoped DB lookup — avoids loading every goal/card/substitution row during StatsBomb sync. */
  private statsBombEventMetadataMatchSql(alias: string): string {
    const pk = this.providerKey;
    return `(${alias}.metadata->'providers'->'${pk}'->>'externalId' = :sbEventId OR ${alias}.metadata->>'statsbombEventId' = :sbEventId)`;
  }

  private async findGoalByStatsBombEventId(
    statsbombEventId: string | number,
    fixtureId: number,
  ): Promise<Goal | null> {
    if (statsbombEventId === undefined || statsbombEventId === null || statsbombEventId === '') {
      return null;
    }
    const sbEventId = String(statsbombEventId);
    return this.goalRepository
      .createQueryBuilder('g')
      .where('g.fixtureId = :fixtureId', { fixtureId })
      .andWhere(this.statsBombEventMetadataMatchSql('g'), { sbEventId })
      .getOne();
  }

  private async findCardByStatsBombEventId(
    statsbombEventId: string | number,
    fixtureId: number,
  ): Promise<Card | null> {
    if (statsbombEventId === undefined || statsbombEventId === null || statsbombEventId === '') {
      return null;
    }
    const sbEventId = String(statsbombEventId);
    return this.cardRepository
      .createQueryBuilder('c')
      .where('c.fixtureId = :fixtureId', { fixtureId })
      .andWhere(this.statsBombEventMetadataMatchSql('c'), { sbEventId })
      .getOne();
  }

  private async findSubstitutionByStatsBombEventId(
    statsbombEventId: string | number,
    fixtureId: number,
  ): Promise<Substitution | null> {
    if (statsbombEventId === undefined || statsbombEventId === null || statsbombEventId === '') {
      return null;
    }
    const sbEventId = String(statsbombEventId);
    return this.substitutionRepository
      .createQueryBuilder('s')
      .where('s.fixtureId = :fixtureId', { fixtureId })
      .andWhere(this.statsBombEventMetadataMatchSql('s'), { sbEventId })
      .getOne();
  }

  /**
   * Resolve local Team from StatsBomb event.team (uses batch map when provided).
   */
  private async resolveStatsBombTeam(
    teamBlock: { name: string } | undefined,
    teamMap?: Map<string, any>,
  ): Promise<any | null> {
    if (!teamBlock?.name) return null;
    if (teamMap) {
      const cached = teamMap.get(teamBlock.name);
      if (cached) return cached;
    }
    const [foundTeam] = await this.teamService.getQuery({
      where: { name: teamBlock.name },
    });
    return foundTeam ?? null;
  }

  /** Align stored teamId with StatsBomb when missing or incorrect (re-sync safe). */
  private async upsertIncidentTeamId(
    kind: 'goal' | 'card' | 'substitution',
    row: { id: number; teamId?: number | null },
    team: { id: number } | null | undefined,
  ): Promise<void> {
    if (!team?.id) return;
    if (row.teamId === team.id) return;
    switch (kind) {
      case 'goal':
        await this.goalService.update(row.id, { teamId: team.id });
        break;
      case 'card':
        await this.cardService.update(row.id, { teamId: team.id });
        break;
      case 'substitution':
        await this.substitutionService.update(row.id, { teamId: team.id });
        break;
      default:
        return;
    }
    this.logger.debug(`Upserted ${kind} ${row.id} teamId → ${team.id}`);
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

  private conflictingOtherStatsBombId(metadata: any, matchId: number): boolean {
    const prov = this.getProviderExternalIdFromMetadata(metadata);
    const legacy = this.getLegacyStatsBombIdFromMetadata(metadata);
    const tgt = String(matchId);
    if (prov != null && prov !== '' && prov !== tgt) return true;
    if (legacy != null && legacy !== '' && legacy !== tgt) return true;
    return false;
  }

  private async findExistingFixtureCorrelationForStatsBomb(opts: {
    competitionId: number;
    seasonId: number;
    homeTeamId: number;
    awayTeamId: number;
    scheduledAtMs: number;
    scorePair: { homeScore?: number; awayScore?: number };
    statsBombMatchId: number;
  }): Promise<any | null> {
    const rows = await this.fixtureService.getQuery({
      where: {
        competitionId: opts.competitionId,
        seasonId: opts.seasonId,
        homeTeamId: opts.homeTeamId,
        awayTeamId: opts.awayTeamId,
      } as any,
    });
    if (!rows?.length) return null;

    const ranked: Array<{ f: any; dt: number }> = [];
    for (const f of rows) {
      if (!f?.id) continue;
      if (this.conflictingOtherStatsBombId(f.metadata, opts.statsBombMatchId)) continue;
      if (!this.scoresCorrelationCompatible(f, opts.scorePair)) continue;
      const t = f.date instanceof Date ? f.date.getTime() : new Date(f.date as any).getTime();
      if (Number.isNaN(t)) continue;
      const delta = Math.abs(t - opts.scheduledAtMs);
      if (delta <= FIXTURE_CORRELATION_MAX_MS) ranked.push({ f, dt: delta });
    }
    if (!ranked.length) return null;
    ranked.sort((a, b) => a.dt - b.dt);
    return ranked[0].f;
  }

  private async findFixtureByStatsBombMatchId(statsbombMatchId: number): Promise<any | null> {
    // CrudRepoAdapter currently rejects Raw/Jsonb find operators in getQuery(),
    // so resolve using plain query and metadata filtering in memory.
    const fixtures = await this.fixtureService.getQuery({});
    const targetId = String(statsbombMatchId);

    return (
      fixtures.find((fixture: any) => {
        const metadata = fixture?.metadata ?? {};
        const providerExternalId = this.getProviderExternalIdFromMetadata(metadata);
        const legacyStatsBombId = this.getLegacyStatsBombIdFromMetadata(metadata);
        return providerExternalId === targetId || legacyStatsBombId === targetId;
      }) ?? null
    );
  }

  private async shouldSyncStatsBombCompetitionSeason(
    comp: StatsBombCompetition,
    incremental: boolean,
  ): Promise<boolean> {
    if (!incremental) return true;
    const season = await this.findSeasonByStatsBombSeasonId(comp.season_id);
    if (!season) return true;
    const syncedWatermark = season.metadata?.statsbombSyncedMatchUpdated as string | undefined;
    if (!syncedWatermark || !comp.match_updated) return true;
    return comp.match_updated > syncedWatermark;
  }

  private async markStatsBombCompetitionSeasonSynced(comp: StatsBombCompetition): Promise<void> {
    const season = await this.findSeasonByStatsBombSeasonId(comp.season_id);
    if (!season?.id) return;
    await this.seasonService.update(season.id, {
      id: season.id,
      metadata: deepMergeEntityMetadata((season.metadata ?? {}) as Record<string, unknown>, {
        statsbombMatchUpdated: comp.match_updated,
        statsbombMatchAvailable: comp.match_available,
        statsbombSyncedMatchUpdated: comp.match_updated,
        statsbombLastSyncedAt: new Date().toISOString(),
      }) as any,
    } as any);
    this.cachedSeasons = null;
  }

  /**
   * Sync competitions to database
   */
  private async syncCompetitions(): Promise<void> {
    this.logger.log('Syncing competitions...');
    
    const competitions = await this.fetchCompetitions();

    // Process sequentially to avoid race conditions creating duplicates
    for (const comp of competitions) {
      try {
        // Prefer source ID matching first, then fallback to name
        let competition = await this.findCompetitionByStatsBombCompetitionId(comp.competition_id);

        if (!competition) {
          [competition] = await this.competitionService.getQuery({
            where: { name: comp.competition_name }
          });
        }

        if (!competition) {
          competition = await this.competitionService.create({
            name: comp.competition_name,
            country: comp.country_name,
            type: this.mapCompetitionType(comp.competition_name),
            featured: false,
            metadata: {
              source: 'StatsBomb',
              statsbombId: comp.competition_id,
              providers: {
                statsbomb: {
                  externalId: String(comp.competition_id),
                },
              },
              seasonId: comp.season_id,
              seasonName: comp.season_name,
              matchUpdated: comp.match_updated,
              matchAvailable: comp.match_available,
              lastSync: new Date().toISOString()
            }
          });
          this.logger.log(`Created competition: ${comp.competition_name}`);
        } else {
          await this.competitionService.update(competition.id, {
            id: competition.id,
            metadata: deepMergeEntityMetadata(
              (competition.metadata ?? {}) as Record<string, unknown>,
              {
                matchUpdated: comp.match_updated,
                matchAvailable: comp.match_available,
                lastSync: new Date().toISOString(),
              },
            ) as any,
          } as any);
        }

        // Create season if it doesn't exist
        const seasonYear = parseInt(comp.season_name.split('/')[0]);
        let season = await this.findSeasonByStatsBombSeasonId(comp.season_id);

        if (!season && !Number.isNaN(seasonYear)) {
          [season] = await this.seasonService.getQuery({
            where: { yearStart: seasonYear }
          });
        }

        if (!season) {
          season = await this.seasonService.create({
            yearStart: seasonYear,
            yearEnd: seasonYear + 1,
            metadata: {
              source: 'StatsBomb',
              statsbombSeasonId: comp.season_id,
              providers: {
                statsbomb: {
                  externalId: String(comp.season_id),
                },
              },
              seasonName: comp.season_name,
              lastSync: new Date().toISOString()
            }
          });
          this.logger.log(`Created season: ${seasonYear}/${seasonYear + 1}`);
        } else if (season?.id) {
          await this.seasonService.update(season.id, {
            id: season.id,
            metadata: deepMergeEntityMetadata((season.metadata ?? {}) as Record<string, unknown>, {
              statsbombMatchUpdated: comp.match_updated,
              statsbombMatchAvailable: comp.match_available,
              seasonName: comp.season_name,
              lastSync: new Date().toISOString(),
            }) as any,
          } as any);
          this.cachedSeasons = null;
        }
      } catch (error) {
        this.logger.warn(`Error syncing competition ${comp.competition_name}:`, error);
      }
    }
  }

  /**
   * Sync teams and players from StatsBomb data
   */
  async syncTeamsAndPlayers(options?: { incremental?: boolean }): Promise<void> {
    this.logger.log('Syncing teams and players...');
    
    const competitions = await this.fetchCompetitions();
    const incremental = options?.incremental !== false;
    
    for (const comp of competitions) {
      if (!(await this.shouldSyncStatsBombCompetitionSeason(comp, incremental))) {
        this.logger.debug(
          `Skipping teams/players for ${comp.competition_name} ${comp.season_name} (unchanged watermark)`,
        );
        continue;
      }
      try {
        // Fetch matches for this competition/season
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        
        // Process matches in parallel batches of 50
        const batchSize = 50;
        for (let i = 0; i < matches.length; i += batchSize) {
          const batch = matches.slice(i, i + batchSize);
          
          this.logger.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(matches.length / batchSize)} (${batch.length} matches)`);
          
          // Process all matches in the batch in parallel
          const batchPromises = batch.map(async (match) => {
            try {
              this.logger.debug(`Processing match ${match.match_id}: ${match.home_team.home_team_name} vs ${match.away_team.away_team_name}`);
              
              // Sync home team
              await this.syncTeam(match.home_team);
              
              // Sync away team
              await this.syncTeam(match.away_team);
              
              // Sync players from lineup
              const playersCreated = await this.syncPlayersFromMatch(match.match_id);
              this.logger.debug(`Created ${playersCreated} players for match ${match.match_id}`);
            } catch (error) {
              this.logger.warn(`Error processing match ${match.match_id}:`, error);
              throw error; // Re-throw to be caught by Promise.allSettled
            }
          });
          
          // Wait for all matches in the batch to complete (or fail)
          const results = await Promise.allSettled(batchPromises);
          
          // Log results
          const successful = results.filter(result => result.status === 'fulfilled').length;
          const failed = results.filter(result => result.status === 'rejected').length;
          
          this.logger.log(`Batch completed: ${successful} successful, ${failed} failed`);
          
          // Log any failures for debugging
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              this.logger.warn(`Match ${batch[index].match_id} failed:`, result.reason);
            }
          });
        }
      } catch (error) {
        this.logger.warn(`Error syncing teams for competition ${comp.competition_name}:`, error);
      }
    }
  }

  /**
   * Fetch matches for a specific competition and season
   */
  private async fetchMatches(competitionId: number, seasonId: number): Promise<StatsBombMatch[]> {
    try {
      return await this.httpService.fetchMatches(competitionId, seasonId);
    } catch (error) {
      this.logger.error(`Error fetching matches for competition ${competitionId}, season ${seasonId}:`, error);
      return [];
    }
  }

  /**
   * Get available matches for testing
   */
  async getAvailableMatches(): Promise<any[]> {
    try {
      const competitions = await this.fetchCompetitions();
      const allMatches = [];
      
      for (const comp of competitions) {
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        
        for (const match of matches) {
          allMatches.push({
            matchId: match.match_id,
            homeTeam: match.home_team.home_team_name,
            awayTeam: match.away_team.away_team_name,
            competition: comp.competition_name,
            season: comp.season_name,
            date: match.match_date
          });
        }
      }
      
      this.logger.log(`Found ${allMatches.length} available matches`);
      return allMatches;
    } catch (error) {
      this.logger.error(`Error getting available matches:`, error);
      return [];
    }
  }

  /**
   * Get match details by ID
   */
  async getMatchDetails(matchId: number): Promise<any> {
    try {
      const competitions = await this.fetchCompetitions();
      
      for (const comp of competitions) {
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        const match = matches.find(m => m.match_id === matchId);
        
        if (match) {
          this.logger.log(`Found match ${matchId}: ${match.home_team.home_team_name} vs ${match.away_team.away_team_name}`);
          return match;
        }
      }
      
      this.logger.warn(`Match ${matchId} not found in any competition`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting match details for ${matchId}:`, error);
      return null;
    }
  }

  /**
   * Sync a team to database
   */
  async syncTeam(teamData: any): Promise<void> {
    const teamName = teamData.home_team_name || teamData.away_team_name;
    const teamCountry = teamData.home_team_country || teamData.away_team_country || teamData.country?.name;
    const teamId = teamData.home_team_id || teamData.away_team_id;
    const lockKey = String(teamId ?? `${teamName}:${teamCountry}`);

    const previousLock = this.teamSyncLocks.get(lockKey) ?? Promise.resolve();
    const currentLock = previousLock.then(async () => {
      await this.syncTeamUnsafe(teamData);
    });

    this.teamSyncLocks.set(lockKey, currentLock);

    try {
      await currentLock;
    } finally {
      if (this.teamSyncLocks.get(lockKey) === currentLock) {
        this.teamSyncLocks.delete(lockKey);
      }
    }
  }

  private async syncTeamUnsafe(teamData: any): Promise<void> {
    try {
      // Extract team information from the team data object
      const teamName = teamData.home_team_name || teamData.away_team_name;
      const teamCountry = teamData.home_team_country || teamData.away_team_country || teamData.country?.name;
      const teamId = teamData.home_team_id || teamData.away_team_id;
      const teamGender = teamData.home_team_gender || teamData.away_team_gender;
      const teamGroup = teamData.home_team_group || teamData.away_team_group;
      const teamManager = teamData.home_team_manager || teamData.away_team_manager || teamData.managers?.[0];

      if (!teamName || !teamCountry) {
        this.logger.warn(`Skipping team sync - missing name or country: ${JSON.stringify(teamData)}`);
        return;
      }

      this.logger.debug(`Syncing team: ${teamName} from ${teamCountry}`);

      let team;
      if (teamId) {
        team = await this.findTeamByStatsBombTeamId(teamId);
      }

      if (!team) {
        const existingTeams = await this.teamService.getQuery({
          where: { name: teamName, country: teamCountry }
        });
        team = existingTeams[0];
      }

      if (!team) {
        // Determine team type based on StatsBomb data patterns
        const teamType = this.determineTeamType(teamName, teamCountry);

        const teamCreateData = {
          name: teamName,
          country: teamCountry,
          type: teamType,
          metadata: {
            source: 'StatsBomb',
            statsbombId: teamId,
            providers: {
              statsbomb: {
                externalId: String(teamId),
              },
            },
            gender: teamGender,
            group: teamGroup,
            manager: teamManager,
            lastSync: new Date().toISOString()
          }
        };

        this.logger.debug(`Creating team with data: ${JSON.stringify(teamCreateData)}`);

        team = await this.teamService.create(teamCreateData);
        // Keep cache warm
        if (this.cachedTeams) {
          this.cachedTeams.push(team);
        }
        this.logger.log(`✅ Created team: ${teamName} (${teamType})`);
      } else {
        this.logger.debug(`Team already exists: ${teamName}`);
      }

      if (team?.id && teamManager?.name) {
        const mgrRow = await this.getOrCreateManagerFromMatch(teamManager, team.id);
        if (mgrRow?.id && team.managerId !== mgrRow.id) {
          await this.teamService.update(team.id, { id: team.id, managerId: mgrRow.id } as any);
        }
      }
    } catch (error) {
      this.logger.error(`Error syncing team ${teamData.home_team_name || teamData.away_team_name}:`, error);
      throw error;
    }
  }

  /**
   * Determine team type based on StatsBomb data patterns
   */
  private determineTeamType(teamName: string, teamCountry: string): TeamType {
    const nameLower = teamName.toLowerCase();
    const countryLower = teamCountry.toLowerCase();

    // Check if team name matches country name exactly
    if (teamName === teamCountry) {
      return TeamType.COUNTRY;
    }

    // Check for common club team indicators first (more specific)
    const clubIndicators = [
      'fc', 'football club', 'united', 'city', 'town', 'athletic', 'sporting',
      'real', 'cf', 'ac', 'as', 'sc', 'rc', 'ud', 'cd', 'sd', 'se',
      'club', 'team', 'soccer', 'football', 'munich', 'madrid', 'barcelona',
      'juventus', 'milan', 'saint-germain', 'saint germain', 'psg'
    ];

    for (const indicator of clubIndicators) {
      if (nameLower.includes(indicator)) {
        return TeamType.CLUB;
      }
    }

    // Check for national team patterns (less specific, so check after club indicators)
    const nationalTeamPatterns = [
      // FIFA country names
      'argentina', 'brazil', 'germany', 'spain', 'france', 'italy', 'england', 'netherlands',
      'portugal', 'belgium', 'croatia', 'denmark', 'switzerland', 'poland', 'austria',
      'sweden', 'norway', 'finland', 'iceland', 'wales', 'scotland', 'ireland', 'northern ireland',
      'czech republic', 'slovakia', 'slovenia', 'hungary', 'romania', 'bulgaria', 'greece',
      'turkey', 'russia', 'ukraine', 'belarus', 'estonia', 'latvia', 'lithuania',
      'mexico', 'united states', 'canada', 'costa rica', 'jamaica', 'honduras', 'panama',
      'colombia', 'chile', 'peru', 'ecuador', 'venezuela', 'bolivia', 'paraguay', 'uruguay',
      'japan', 'south korea', 'china', 'australia', 'new zealand', 'saudi arabia', 'iran',
      'iraq', 'united arab emirates', 'qatar', 'kuwait', 'oman', 'bahrain', 'jordan',
      'lebanon', 'syria', 'palestine', 'israel', 'egypt', 'morocco', 'tunisia', 'algeria',
      'libya', 'sudan', 'ethiopia', 'kenya', 'uganda', 'tanzania', 'ghana', 'nigeria',
      'cameroon', 'senegal', 'mali', 'burkina faso', 'ivory coast', 'guinea', 'sierra leone',
      'liberia', 'gambia', 'guinea-bissau', 'cape verde', 'são tomé and príncipe',
      'south africa', 'zimbabwe', 'zambia', 'malawi', 'mozambique', 'madagascar',
      'mauritius', 'seychelles', 'comoros', 'djibouti', 'somalia', 'eritrea',
      // Common national team suffixes
      'national team', 'nt', 'national', 'selection', 'squad'
    ];

    // Check against known national team patterns
    for (const pattern of nationalTeamPatterns) {
      if (nameLower.includes(pattern)) {
        return TeamType.COUNTRY;
      }
    }

    // If team name contains country name, it's likely a national team
    if (nameLower.includes(countryLower) || countryLower.includes(nameLower)) {
      return TeamType.COUNTRY;
    }

    // Default to club if no clear indicators
    return TeamType.CLUB;
  }

  /**
   * Sync players from match lineup
   */
  async syncPlayersFromMatch(matchId: number): Promise<number> {
    try {
      const lineup = await this.fetchLineup(matchId);
      
      if (!lineup || !Array.isArray(lineup)) {
        this.logger.warn(`No lineup data found for match ${matchId}`);
        return 0;
      }
      
      // Collect all player sync promises
      const playerPromises: Promise<void>[] = [];
      
      for (const teamLineup of lineup) {
        if (!teamLineup) {
          this.logger.warn(`Empty team lineup for match ${matchId}`);
          continue;
        }
        
        // Check if lineup exists and is an array
        if (!teamLineup.lineup || !Array.isArray(teamLineup.lineup)) {
          this.logger.warn(`No lineup array found for team ${teamLineup.team_id} in match ${matchId}. Data structure:`, JSON.stringify(teamLineup, null, 2));
          continue;
        }
        
        this.logger.debug(`Processing ${teamLineup.lineup.length} players for team ${teamLineup.team_id}`);
        
        // Add all player sync operations to the promises array
        for (const playerData of teamLineup.lineup) {
          if (playerData && playerData.player_name) {
            playerPromises.push(this.syncPlayer(playerData, teamLineup.team_id));
          } else {
            this.logger.warn(`Invalid player data in lineup:`, JSON.stringify(playerData));
          }
        }
      }
      
      // Process all players in parallel
      const results = await Promise.allSettled(playerPromises);
      const playersCreated = results.filter(result => result.status === 'fulfilled').length;
      
      this.logger.debug(`✅ Created ${playersCreated} players for match ${matchId}`);
      return playersCreated;
    } catch (error) {
      this.logger.error(`Error syncing players for match ${matchId}:`, error);
      return 0;
    }
  }

  /**
   * Fetch lineup for a specific match
   */
  private async fetchLineup(matchId: number): Promise<StatsBombLineup[]> {
    try {
      return await this.httpService.fetchLineup(matchId);
    } catch (error) {
      this.logger.error(`Error fetching lineup for match ${matchId}:`, error);
      return [];
    }
  }

  /**
   * Sync a player to database
   */
  private async syncPlayer(playerData: any, teamId: number): Promise<void> {
    const playerName = playerData?.player_name;
    const playerStatsBombId = playerData?.player_id;
    const lockKey = String(playerStatsBombId ?? playerName ?? 'unknown-player');
    const previousLock = this.playerSyncLocks.get(lockKey) ?? Promise.resolve();
    const currentLock = previousLock.then(async () => {
      await this.syncPlayerUnsafe(playerData, teamId);
    });

    this.playerSyncLocks.set(lockKey, currentLock);

    try {
      await currentLock;
    } finally {
      if (this.playerSyncLocks.get(lockKey) === currentLock) {
        this.playerSyncLocks.delete(lockKey);
      }
    }
  }

  private async syncPlayerUnsafe(playerData: any, teamId: number): Promise<void> {
    try {
      if (!playerData || !playerData.player_name) {
        this.logger.warn(`Invalid player data:`, JSON.stringify(playerData));
        return;
      }

      this.logger.debug(`Syncing player: ${playerData.player_name}`);
      
      let player;
      if (playerData.player_id) {
        player = await this.findPlayerByStatsBombPlayerId(playerData.player_id);
      }

      if (!player) {
        [player] = await this.playerService.getQuery({
          where: { name: playerData.player_name }
        });
      }

      const localTeamId = await this.getLocalTeamId(teamId);
      const parsedDob = this.parsePlayerDob(playerData?.dob);

      if (!player) {
        // Get position ID (you might need to create positions first)
        const positionIds: number[] = []
        
        // Check if positions exists and is an array
        if (playerData.positions && Array.isArray(playerData.positions)) {
          for (const position of playerData.positions) {
            if (position && position.position) {
              const playerPosition = await this.getOrCreatePosition(position.position);
              positionIds.push(playerPosition.id);
            }
          }
        } else {
          this.logger.warn(`No positions array found for player ${playerData.player_name}`);
        }

        const playerCreateData = {
          name: playerData.player_name,
          nickname: playerData.player_nickname || null,
          nationality: playerData.country?.name || 'Unknown',
          dateOfBirth: parsedDob ?? new Date('1900-01-01'),
          positionIds,
          kitNumber: playerData.jersey_number || null,
          metadata: {
            source: 'StatsBomb',
            statsbombId: playerData.player_id,
            providers: {
              statsbomb: {
                externalId: String(playerData.player_id),
              },
            },
            positions: playerData.positions && Array.isArray(playerData.positions) 
              ? playerData.positions.map((p: any) => ({
                  position: p.position,
                  from: p.from,
                  to: p.to,
                  fromPeriod: p.from_period,
                  toPeriod: p.to_period,
                  startReason: p.start_reason,
                  endReason: p.end_reason
                }))
              : [],
            country: playerData.country,
            jerseyNumber: playerData.jersey_number,
            lastSync: new Date().toISOString()
          }
        };
        
        this.logger.debug(`Creating player with data: ${JSON.stringify(playerCreateData)}`);
        
        player = await this.playerService.create(playerCreateData);
        // Keep cache warm
        if (this.cachedPlayers) {
          this.cachedPlayers.push(player);
        }
        this.logger.log(`✅ Created player: ${playerData.player_name}`);
      } else {
        const updateData: any = {
          id: player.id,
        };

        // Only update DOB when we have a valid real value.
        if (parsedDob) {
          updateData.dateOfBirth = parsedDob;
        }

        // Keep nationality fresh if source provides a better value.
        if (playerData.country?.name) {
          updateData.nationality = playerData.country.name;
        }

        const playerMetaPatch: Record<string, unknown> = {
          source: 'StatsBomb',
          statsbombId: playerData.player_id,
          providers: {
            statsbomb: {
              externalId: String(playerData.player_id),
            },
          },
          country: playerData.country,
          jerseyNumber: playerData.jersey_number,
          lastSync: new Date().toISOString(),
        };
        if (playerData.positions && Array.isArray(playerData.positions)) {
          playerMetaPatch.positions = playerData.positions.map((pos: any) => ({
            position: pos.position,
            from: pos.from,
            to: pos.to,
            fromPeriod: pos.from_period,
            toPeriod: pos.to_period,
            startReason: pos.start_reason,
            endReason: pos.end_reason,
          }));
        }

        updateData.metadata = deepMergeEntityMetadata(
          (player.metadata ?? {}) as Record<string, unknown>,
          playerMetaPatch,
        ) as any;

        await this.playerService.update(player.id, updateData);
        this.logger.debug(`Updated player: ${playerData.player_name}`);
      }
    } catch (error) {
      this.logger.error(`Error syncing player ${playerData?.player_name}:`, error);
      throw error;
    }
  }

  private async getLocalTeamId(statsbombTeamId: number): Promise<number | null> {
    if (!statsbombTeamId) {
      return null;
    }

    const team = await this.findTeamByStatsBombTeamId(statsbombTeamId);
    return team?.id ?? null;
  }

  private parsePlayerDob(rawDob: unknown): Date | null {
    if (typeof rawDob !== 'string' || !rawDob.trim()) {
      return null;
    }

    const parsed = new Date(rawDob);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  /**
   * Determine position type from position name
   */
  private determinePositionType(positionName: string): PositionType {
    const name = positionName.toLowerCase();
    
    // Goalkeeper positions
    if (name.includes('goalkeeper') || name.includes('keeper') || name.includes('gk')) {
      return PositionType.GOALKEEPER;
    }
    
    // Defender positions
    if (name.includes('defender') || name.includes('defence') || name.includes('defense') || 
        name.includes('centre-back') || name.includes('center-back') || name.includes('full-back') ||
        name.includes('left-back') || name.includes('right-back') || name.includes('wing-back') ||
        name.includes('sweeper') || name.includes('libero')) {
      return PositionType.DEFENDER;
    }
    
    // Midfielder positions
    if (name.includes('midfielder') || name.includes('midfield') || name.includes('centre-midfield') ||
        name.includes('center-midfield') || name.includes('left-midfield') || name.includes('right-midfield') ||
        name.includes('attacking-midfield') || name.includes('defensive-midfield') || name.includes('winger') ||
        name.includes('wide-midfield') || name.includes('central-midfield')) {
      return PositionType.MIDFIELDER;
    }
    
    // Forward positions
    if (name.includes('forward') || name.includes('striker') || name.includes('centre-forward') ||
        name.includes('center-forward') || name.includes('left-forward') || name.includes('right-forward') ||
        name.includes('attacker') || name.includes('winger') || name.includes('inside-forward')) {
      return PositionType.FORWARD;
    }
    
    // Default fallback - try to infer from common patterns
    if (name.includes('attack') || name.includes('strike')) {
      return PositionType.FORWARD;
    }
    
    if (name.includes('mid') || name.includes('centre') || name.includes('center')) {
      return PositionType.MIDFIELDER;
    }
    
    if (name.includes('def') || name.includes('back')) {
      return PositionType.DEFENDER;
    }
    
    // Default to midfielder if unclear
    return PositionType.MIDFIELDER;
  }

  private normalizePositionName(name: string): string {
    return (name ?? '').trim().replace(/\\s+/g, ' ').toLowerCase();
  }

  private async getPositionsCached(): Promise<Position[]> {
    if (!this.cachedPositions) {
      this.cachedPositions = await this.positionService.getQuery({});
    }
    return this.cachedPositions;
  }

  private normalizeStadiumName(name: string): string {
    return (name ?? '').trim().replace(/\\s+/g, ' ').toLowerCase();
  }

  private async getStadiumsCached(): Promise<Stadium[]> {
    if (!this.cachedStadiums) {
      this.cachedStadiums = await this.stadiumService.getQuery({});
    }
    return this.cachedStadiums;
  }

  private async withStadiumLock(key: string, fn: () => Promise<void>): Promise<void> {
    const existing = this.stadiumLocks.get(key);
    if (existing) return existing;
    const p = (async () => {
      try {
        await fn();
      } finally {
        this.stadiumLocks.delete(key);
      }
    })();
    this.stadiumLocks.set(key, p);
    return p;
  }

  private async withPositionLock(key: string, fn: () => Promise<void>): Promise<void> {
    const existing = this.positionLocks.get(key);
    if (existing) return existing;
    const p = (async () => {
      try {
        await fn();
      } finally {
        this.positionLocks.delete(key);
      }
    })();
    this.positionLocks.set(key, p);
    return p;
  }

  /**
   * Get or create a position
   */
  private async getOrCreatePosition(positionName: string): Promise<Position> {
    const name = (positionName ?? '').trim();
    const normalized = this.normalizePositionName(name);

    // Fast path: in-memory dedupe (handles casing/whitespace differences)
    const cached = await this.getPositionsCached();
    const fromCache = cached.find((p) => this.normalizePositionName(p.name) === normalized);
    if (fromCache) return fromCache;

    // Avoid duplicates caused by parallel batches
    await this.withPositionLock(normalized || name, async () => {
      const recheck = await this.getPositionsCached();
      const again = recheck.find((p) => this.normalizePositionName(p.name) === normalized);
      if (again) return;

      const [byExactName] = await this.positionService.getQuery({ where: { name } });
      if (byExactName) {
        this.cachedPositions = null;
        return;
      }

      const positionType = this.determinePositionType(name);
      await this.positionService.create({
        name,
        type: positionType,
        metadata: {
          source: 'StatsBomb',
          normalizedName: normalized,
          lastSync: new Date().toISOString(),
        },
      } as any);

      this.cachedPositions = null;
    });

    const refreshed = await this.getPositionsCached();
    const createdOrExisting = refreshed.find((p) => this.normalizePositionName(p.name) === normalized);
    if (!createdOrExisting) {
      // Should never happen; fallback to exact query.
      const [fallback] = await this.positionService.getQuery({ where: { name } });
      return fallback;
    }
    return createdOrExisting;
  }

  /**
   * Sync fixtures to database
   */
  private async syncFixtures(
    options?: { skipLineups?: boolean; skipStadiums?: boolean; incremental?: boolean },
  ): Promise<void> {
    this.logger.log('Syncing fixtures...');
    
    const competitions = await this.fetchCompetitions();
    const incremental = options?.incremental !== false;
    
    for (const comp of competitions) {
      if (!(await this.shouldSyncStatsBombCompetitionSeason(comp, incremental))) {
        this.logger.debug(
          `Skipping fixtures for ${comp.competition_name} ${comp.season_name} (unchanged watermark)`,
        );
        continue;
      }
      try {
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        
        // Process matches in parallel batches of 50
        const batchSize = 50;
        for (let i = 0; i < matches.length; i += batchSize) {
          const batch = matches.slice(i, i + batchSize);
          
          this.logger.log(`Processing fixture batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(matches.length / batchSize)} (${batch.length} matches)`);
          
          // Process all matches in the batch in parallel
          const batchPromises = batch.map(async (match) => {
            try {
              await this.syncFixture(match, options);
            } catch (error) {
              this.logger.warn(`Error syncing fixture ${match.match_id}:`, error);
            }
          });
          
          // Wait for all matches in the batch to complete
          await Promise.allSettled(batchPromises);
        }

        // After syncing fixtures for this competition+season, recompute standings.
        const competition = await this.findCompetitionByStatsBombCompetitionId(comp.competition_id);
        const season = await this.findSeasonByStatsBombSeasonId(comp.season_id);
        if (competition?.id && season?.id) {
          await this.recomputeTeamCompetitionSeasonStandings(competition.id, season.id);
        }
      } catch (error) {
        this.logger.warn(`Error syncing fixtures for competition ${comp.competition_name}:`, error);
      }
    }
  }

  /**
   * Sync a single fixture
   */
  private fixtureScoresFromStatsBomb(matchData: StatsBombMatch): { homeScore?: number; awayScore?: number } {
    const h = matchData.home_score;
    const a = matchData.away_score;
    if (typeof h !== 'number' || typeof a !== 'number') return {};
    if (!Number.isFinite(h) || !Number.isFinite(a)) return {};
    return { homeScore: h, awayScore: a };
  }

  /** Persist StatsBomb-derived fields onto a fixture row (by StatsBomb id or cross-provider correlation). */
  private async applyStatsBombToExistingFixtureRow(
    matchData: StatsBombMatch,
    existingFixture: any,
    scorePair: { homeScore?: number; awayScore?: number },
    options?: { skipLineups?: boolean },
  ): Promise<void> {
    const homeTeamId = existingFixture?.homeTeamId ?? null;
    const awayTeamId = existingFixture?.awayTeamId ?? null;
    const competitionId = existingFixture?.competitionId ?? null;
    const seasonId = existingFixture?.seasonId ?? null;

    if (homeTeamId && awayTeamId && competitionId && seasonId) {
      await Promise.all([
        this.ensureTeamCompetitionSeason(homeTeamId, competitionId, seasonId),
        this.ensureTeamCompetitionSeason(awayTeamId, competitionId, seasonId),
      ]);
    }

    const statsBombFixturePatch: Record<string, unknown> = {
      providers: {
        [this.providerKey]: { externalId: String(matchData.match_id) },
      },
      statsbombId: matchData.match_id,
      competitionStage: matchData.competition_stage,
      matchWeek: matchData.match_week,
      referee: matchData.referee,
      homeScore: matchData.home_score,
      awayScore: matchData.away_score,
      lastSync: new Date().toISOString(),
    };

    await this.fixtureService.update(existingFixture.id, {
      id: existingFixture.id,
      date: new Date(`${matchData.match_date} ${matchData.kick_off}`),
      status: this.mapFixtureStatus(matchData.match_status),
      stage: this.mapFixtureStage(matchData.competition_stage.name),
      ...scorePair,
      metadata: deepMergeEntityMetadata(
        (existingFixture.metadata ?? {}) as Record<string, unknown>,
        statsBombFixturePatch,
      ) as any,
    } as any);

    await this.ensureTeamsManagersFromMatch(matchData, homeTeamId, awayTeamId);

    if (!options?.skipLineups) {
      await this.syncLineupsFromMatch(matchData, existingFixture.id);
    }

    await this.refreshLineUpManagersForFixture(matchData, existingFixture.id);
  }

  async syncFixture(matchData: StatsBombMatch, options?: { skipLineups?: boolean; skipStadiums?: boolean }): Promise<void> {
    const scorePair = this.fixtureScoresFromStatsBomb(matchData);
    const existingBySbId = await this.findFixtureByStatsBombMatchId(matchData.match_id);
    if (existingBySbId) {
      this.logger.debug(`Fixture already exists for StatsBomb match ${matchData.match_id}`);
      await this.applyStatsBombToExistingFixtureRow(matchData, existingBySbId, scorePair, options);
      return;
    }

    // Resolve related entities by provider IDs first (safer), then fallback to name/year
    let homeTeamId = await this.getLocalTeamId(matchData.home_team.home_team_id);
    if (!homeTeamId) {
      const [homeTeamByName] = await this.teamService.getQuery({
        where: { name: matchData.home_team.home_team_name }
      });
      homeTeamId = homeTeamByName?.id ?? null;
    }

    let awayTeamId = await this.getLocalTeamId(matchData.away_team.away_team_id);
    if (!awayTeamId) {
      const [awayTeamByName] = await this.teamService.getQuery({
        where: { name: matchData.away_team.away_team_name }
      });
      awayTeamId = awayTeamByName?.id ?? null;
    }

    let competition = await this.findCompetitionByStatsBombCompetitionId(matchData.competition.competition_id);
    if (!competition) {
      [competition] = await this.competitionService.getQuery({
        where: { name: matchData.competition.competition_name }
      });
    }

    let season = await this.findSeasonByStatsBombSeasonId(matchData.season.season_id);
    if (!season) {
      const seasonYear = parseInt(matchData.season.season_name.split('/')[0]);
      if (!Number.isNaN(seasonYear)) {
        [season] = await this.seasonService.getQuery({
          where: { yearStart: seasonYear }
        });
      }
    }

    // Create or get stadium
    const stadium = options?.skipStadiums
      ? await this.getExistingStadium(matchData.stadium)
      : await this.getOrCreateStadium(matchData.stadium, matchData?.competition?.country_name);
    if (!stadium) {
      this.logger.warn(
        `Skipping fixture ${matchData.match_id} because stadium could not be resolved (statsbomb stadium missing/incomplete)`,
      );
      return;
    }

    const kickMs = new Date(`${matchData.match_date} ${matchData.kick_off}`).getTime();
    const correlated =
      !Number.isNaN(kickMs) && homeTeamId && awayTeamId && competition?.id && season?.id
        ? await this.findExistingFixtureCorrelationForStatsBomb({
            competitionId: competition.id,
            seasonId: season.id,
            homeTeamId,
            awayTeamId,
            scheduledAtMs: kickMs,
            scorePair,
            statsBombMatchId: matchData.match_id,
          })
        : null;

    if (correlated) {
      this.logger.debug(
        `Cross-provider correlate: StatsBomb match ${matchData.match_id} → fixture ${correlated.id} (±${FIXTURE_CORRELATION_MAX_MS / 3_600_000}h kickoff window)`,
      );
      await this.applyStatsBombToExistingFixtureRow(matchData, correlated, scorePair, options);
      return;
    }

    let fixture;
    if (homeTeamId && awayTeamId && competition && season) {
      // Ensure join rows exist for both teams in this competition+season.
      await Promise.all([
        this.ensureTeamCompetitionSeason(homeTeamId, competition.id, season.id),
        this.ensureTeamCompetitionSeason(awayTeamId, competition.id, season.id),
      ]);

      await this.ensureTeamsManagersFromMatch(matchData, homeTeamId, awayTeamId);

      fixture = await this.fixtureService.create({
        date: new Date(`${matchData.match_date} ${matchData.kick_off}`),
        homeTeamId,
        awayTeamId,
        competitionId: competition.id,
        seasonId: season.id,
        stadiumId: stadium.id,
        status: this.mapFixtureStatus(matchData.match_status),
        stage: this.mapFixtureStage(matchData.competition_stage.name),
        attendance: 0, // StatsBomb doesn't always provide attendance
        ...scorePair,
        metadata: {
          source: 'StatsBomb',
          statsbombId: matchData.match_id,
          providers: {
            statsbomb: {
              externalId: String(matchData.match_id),
            },
          },
          competitionStage: matchData.competition_stage,
          matchWeek: matchData.match_week,
          referee: matchData.referee,
          homeScore: matchData.home_score,
          awayScore: matchData.away_score,
          lastSync: new Date().toISOString()
        }
      });

      this.logger.log(`✅ Created fixture ID ${fixture.id} for StatsBomb match ${matchData.match_id}: ${matchData.home_team.home_team_name} vs ${matchData.away_team.away_team_name} with metadata: ${JSON.stringify(fixture.metadata)}`);

      // Sync lineups + player lineups from StatsBomb lineup endpoint
      if (!options?.skipLineups) {
        await this.syncLineupsFromMatch(matchData, fixture.id);
      }

      await this.refreshLineUpManagersForFixture(matchData, fixture.id);
    } else {
      this.logger.warn(
        `Skipping fixture ${matchData.match_id} due to unresolved relations: ` +
        `homeTeamId=${homeTeamId ?? 'null'}, awayTeamId=${awayTeamId ?? 'null'}, ` +
        `competitionId=${competition?.id ?? 'null'}, seasonId=${season?.id ?? 'null'}`,
      );
    }
  }

  private async ensureTeamCompetitionSeason(teamId: number, competitionId: number, seasonId: number): Promise<void> {
    const lockKey = `${teamId}:${competitionId}:${seasonId}`;
    const previousLock = this.teamCompetitionSeasonLocks.get(lockKey) ?? Promise.resolve();
    const currentLock = previousLock.then(async () => {
      const existing = await this.teamCompetitionSeasonService.getQuery({
        where: { teamId, competitionId, seasonId },
      });
      if (existing?.[0]) {
        return;
      }
      await this.teamCompetitionSeasonService.create({
        teamId,
        competitionId,
        seasonId,
        metadata: {
          source: 'StatsBomb',
          providers: {
            statsbomb: {
              externalId: lockKey,
            },
          },
          lastSync: new Date().toISOString(),
        },
      } as any);
    });

    this.teamCompetitionSeasonLocks.set(lockKey, currentLock);
    try {
      await currentLock;
    } finally {
      if (this.teamCompetitionSeasonLocks.get(lockKey) === currentLock) {
        this.teamCompetitionSeasonLocks.delete(lockKey);
      }
    }
  }

  private async recomputeTeamCompetitionSeasonStandings(competitionId: number, seasonId: number): Promise<void> {
    try {
      const fixtures = await this.fixtureService.getQuery({ where: { competitionId, seasonId } as any });
      const statsByTeamId = new Map<
        number,
        { played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number }
      >();

      const ensureTeamBucket = (teamId: number) => {
        const existing = statsByTeamId.get(teamId);
        if (existing) return existing;
        const init = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
        statsByTeamId.set(teamId, init);
        return init;
      };

      for (const fixture of fixtures) {
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
          homeScore = typeof meta.homeScore === 'number' ? meta.homeScore : Number(meta.homeScore);
          awayScore = typeof meta.awayScore === 'number' ? meta.awayScore : Number(meta.awayScore);
        }
        const hasScores = Number.isFinite(homeScore) && Number.isFinite(awayScore);

        // Only compute when we have both team ids and scores
        if (!fixture?.homeTeamId || !fixture?.awayTeamId || !hasScores) continue;

        const home = ensureTeamBucket(fixture.homeTeamId);
        const away = ensureTeamBucket(fixture.awayTeamId);

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
          const meta: Record<string, unknown> =
            fixture?.metadata && typeof fixture.metadata === 'object'
              ? (fixture.metadata as Record<string, unknown>)
              : {};
          const winnerTeamId =
            typeof meta.winnerTeamId === 'number' ? meta.winnerTeamId : null;
          const decidedByPenalties = meta.decidedBy === 'penalties';

          if (decidedByPenalties && winnerTeamId === fixture.homeTeamId) {
            home.wins += 1;
            away.losses += 1;
            home.points += 3;
          } else if (decidedByPenalties && winnerTeamId === fixture.awayTeamId) {
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
      }

      // Update all join rows for this competition+season
      const joins = await this.teamCompetitionSeasonService.getQuery({ where: { competitionId, seasonId } as any });
      await Promise.allSettled(
        joins.map(async (join: any) => {
          const stats = statsByTeamId.get(join.teamId) ?? {
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
          };

          const goalDifference = stats.goalsFor - stats.goalsAgainst;
          await this.teamCompetitionSeasonService.update(join.id, {
            id: join.id,
            played: stats.played,
            wins: stats.wins,
            draws: stats.draws,
            losses: stats.losses,
            goalsFor: stats.goalsFor,
            goalsAgainst: stats.goalsAgainst,
            goalDifference,
            points: stats.points,
          } as any);
        }),
      );
    } catch (error) {
      this.logger.warn(`Error recomputing standings for competitionId=${competitionId}, seasonId=${seasonId}:`, error);
    }
  }

  /** Upsert Manager rows from match file managers and set team.managerId (StatsBomb home/away_team_manager). */
  private async ensureTeamsManagersFromMatch(
    matchData: StatsBombMatch,
    homeTeamId: number | null | undefined,
    awayTeamId: number | null | undefined,
  ): Promise<void> {
    const pairs = [
      { localId: homeTeamId, mgr: matchData.home_team?.home_team_manager },
      { localId: awayTeamId, mgr: matchData.away_team?.away_team_manager },
    ] as const;
    for (const { localId, mgr } of pairs) {
      if (!localId || !mgr?.name) continue;
      const mgrRow = await this.getOrCreateManagerFromMatch(mgr, localId);
      if (!mgrRow?.id) continue;
      const [teamRow] = await this.teamService.getQuery({ where: { id: localId } });
      if (teamRow?.managerId === mgrRow.id) continue;
      await this.teamService.update(localId, { id: localId, managerId: mgrRow.id } as any);
    }
  }

  private async getOrCreateManagerFromMatch(matchManager: any, localTeamId: number | null): Promise<any | null> {
    if (!matchManager?.name) return null;

    const [existing] = await this.managerService.getQuery({ where: { name: matchManager.name } });
    if (existing) {
      if (localTeamId) {
        const existingTeamIds = Array.isArray(existing.teamIds) ? existing.teamIds : [];
        if (!existingTeamIds.includes(localTeamId)) {
          await this.managerService.update(existing.id, { id: existing.id, teamIds: [...existingTeamIds, localTeamId] } as any);
        }
      }
      return existing;
    }

    return await this.managerService.create({
      name: matchManager.name,
      nickname: matchManager.nickname ?? matchManager.name,
      nationality: matchManager.country ?? 'Unknown',
      teamIds: localTeamId ? [localTeamId] : [],
      metadata: {
        source: 'StatsBomb',
        statsbombId: matchManager.id,
        providers: {
          statsbomb: {
            externalId: String(matchManager.id),
          },
        },
        lastSync: new Date().toISOString(),
      },
    } as any);
  }

  /** Shared placeholder so LineUp.managerId is always satisfied when StatsBomb omits a manager. */
  private readonly STATS_BOMB_LINEUP_PLACEHOLDER_MANAGER_NAME = 'StatsBomb lineup (manager TBD)';

  private async getOrCreateStatsBombPlaceholderManager(localTeamId: number | null): Promise<number | null> {
    const name = this.STATS_BOMB_LINEUP_PLACEHOLDER_MANAGER_NAME;
    const [existing] = await this.managerService.getQuery({ where: { name } });
    if (existing?.id) {
      if (localTeamId) {
        const existingTeamIds = Array.isArray(existing.teamIds) ? existing.teamIds : [];
        if (!existingTeamIds.includes(localTeamId)) {
          await this.managerService.update(existing.id, {
            id: existing.id,
            teamIds: [...existingTeamIds, localTeamId],
          } as any);
        }
      }
      return existing.id;
    }

    const created = await this.managerService.create({
      name,
      nickname: 'StatsBomb',
      nationality: 'Unknown',
      teamIds: localTeamId ? [localTeamId] : [],
      metadata: {
        source: 'StatsBomb',
        placeholderLineupManager: true,
        lastSync: new Date().toISOString(),
      },
    } as any);
    return created?.id ?? null;
  }

  private async managerIsStatsBombPlaceholder(managerId: number): Promise<boolean> {
    const [row] = await this.managerService.getQuery({ where: { id: managerId } as any });
    if (!row) return false;
    if (row.name === this.STATS_BOMB_LINEUP_PLACEHOLDER_MANAGER_NAME) return true;
    const meta = row.metadata;
    return !!(
      meta &&
      typeof meta === 'object' &&
      !Array.isArray(meta) &&
      (meta as { placeholderLineupManager?: boolean }).placeholderLineupManager
    );
  }

  /**
   * Point LineUp.managerId at real managers when teams/match now resolve them (replaces placeholder rows).
   */
  private async refreshLineUpManagersForFixture(matchData: StatsBombMatch, fixtureId: number): Promise<void> {
    try {
      const [fixture] = await this.fixtureService.getQuery({ where: { id: fixtureId } as any });
      if (!fixture?.homeTeamId || !fixture?.awayTeamId) return;

      const lineUps = await this.lineupService.getQuery({ where: { fixtureId } as any });
      if (!lineUps?.length) return;

      for (const lu of lineUps) {
        let statsbombTeamId: number | null = null;
        if (lu.teamId === fixture.homeTeamId) statsbombTeamId = matchData.home_team.home_team_id;
        else if (lu.teamId === fixture.awayTeamId) statsbombTeamId = matchData.away_team.away_team_id;
        else continue;

        const desired = await this.resolveLineupManagerForTeam(matchData, lu.teamId, statsbombTeamId);
        if (!desired || desired === lu.managerId) continue;
        if (await this.managerIsStatsBombPlaceholder(desired)) continue;

        await this.lineupService.update(lu.id, { id: lu.id, managerId: desired } as any);
      }
    } catch (error) {
      this.logger.warn(`refreshLineUpManagersForFixture fixture ${fixtureId}:`, error);
    }
  }

  private async resolveLineupManagerForTeam(
    matchData: StatsBombMatch,
    localTeamId: number | null,
    statsbombTeamId: number,
  ): Promise<number | null> {
    const isHome = statsbombTeamId === matchData.home_team.home_team_id;
    const isAway = statsbombTeamId === matchData.away_team.away_team_id;
    const matchMgr = isHome
      ? matchData.home_team?.home_team_manager
      : isAway
        ? matchData.away_team?.away_team_manager
        : undefined;

    if (matchMgr?.name) {
      const fromMatch = await this.getOrCreateManagerFromMatch(matchMgr, localTeamId);
      if (fromMatch?.id) return fromMatch.id;
    }

    // Do not fall back to Team.managerId: it is club-level and often wrong for historical fixtures
    // (e.g. previous coach still stored). Match payload or placeholder only.

    return this.getOrCreateStatsBombPlaceholderManager(localTeamId);
  }

  private async resolveLocalTeamIdForLineup(statsbombTeamId: number, matchData: StatsBombMatch): Promise<number | null> {
    const byProvider = await this.getLocalTeamId(statsbombTeamId);
    if (byProvider) return byProvider;

    const name =
      statsbombTeamId === matchData.home_team.home_team_id
        ? matchData.home_team.home_team_name
        : statsbombTeamId === matchData.away_team.away_team_id
          ? matchData.away_team.away_team_name
          : undefined;
    if (!name) return null;
    const [byName] = await this.teamService.getQuery({ where: { name } });
    return byName?.id ?? null;
  }

  private async syncLineupsFromMatch(matchData: StatsBombMatch, fixtureId: number): Promise<void> {
    try {
      const lineupPayload = await this.fetchLineup(matchData.match_id);
      if (!Array.isArray(lineupPayload) || lineupPayload.length === 0) {
        this.logger.warn(
          `No StatsBomb lineups/${matchData.match_id}.json data — skipping lineup rows for fixture ${fixtureId}. ` +
            `Starting XI will still be filled when events sync runs.`,
        );
        return;
      }

      await Promise.all(
        lineupPayload.map(async (teamLineup: any) => {
          const statsbombTeamId = teamLineup?.team_id;
          const localTeamId = await this.resolveLocalTeamIdForLineup(statsbombTeamId, matchData);

          if (!localTeamId) return;

          const managerId = await this.resolveLineupManagerForTeam(matchData, localTeamId, statsbombTeamId);
          if (!managerId) {
            this.logger.warn(`Skipping lineup create for fixture ${fixtureId}, teamId=${localTeamId}: managerId unresolved`);
            return;
          }

          const formation = teamLineup?.formation ? String(teamLineup.formation) : undefined;

          let [lineUp] = await this.lineupService.getQuery({ where: { fixtureId, teamId: localTeamId } as any });
          if (!lineUp) {
            lineUp = await this.lineupService.create({
              fixtureId,
              teamId: localTeamId,
              managerId,
              formation,
              metadata: {
                source: 'StatsBomb',
                providers: {
                  statsbomb: {
                    externalId: `${fixtureId}:${localTeamId}`,
                  },
                },
                statsbombMatchId: matchData.match_id,
                statsbombTeamId,
                lastSync: new Date().toISOString(),
              },
            } as any);
          } else {
            const patch: { id: number; managerId?: number; formation?: string } = { id: lineUp.id };
            const resolvedIsReal = managerId && !(await this.managerIsStatsBombPlaceholder(managerId));
            if (resolvedIsReal && lineUp.managerId !== managerId) {
              patch.managerId = managerId;
            }
            if (formation && lineUp.formation !== formation) {
              patch.formation = formation;
            }
            if (patch.managerId !== undefined || patch.formation !== undefined) {
              await this.lineupService.update(lineUp.id, patch as any);
            }
          }

          const players: any[] = Array.isArray(teamLineup?.lineup) ? teamLineup.lineup : [];

          const slotByStatsBombPlayerId = new Map<number, number>();
          let starterOrdinal = 0;
          for (const p of players) {
            const st =
              Array.isArray(p?.positions) &&
              p.positions.some((pp: any) => String(pp?.start_reason ?? '').toLowerCase().includes('starting'));
            const pid = p?.player_id;
            if (st && pid != null && Number.isFinite(Number(pid))) {
              slotByStatsBombPlayerId.set(Number(pid), starterOrdinal++);
            }
          }

          await Promise.all(
            players.map(async (p: any) => {
              const statsbombPlayerId = p?.player_id;
              let player = statsbombPlayerId ? await this.findPlayerByStatsBombPlayerId(statsbombPlayerId) : null;
              if (!player && p?.player_name) {
                const [byName] = await this.playerService.getQuery({ where: { name: p.player_name } });
                player = byName ?? null;
              }
              if (!player) return;

              const startingSlot =
                Array.isArray(p?.positions) &&
                p.positions.find((pp: any) =>
                  String(pp?.start_reason ?? '').toLowerCase().includes('starting'),
                );
              const posEntry =
                startingSlot ?? (Array.isArray(p?.positions) ? p.positions[0] : undefined);
              const posName = posEntry?.position ? String(posEntry.position) : null;
              const statsbombPositionId =
                posEntry?.position_id != null && Number.isFinite(Number(posEntry.position_id))
                  ? Number(posEntry.position_id)
                  : undefined;

              let positionId: number | undefined = undefined;
              if (posName) {
                const pos = await this.getOrCreatePosition(posName);
                positionId = pos?.id;
              }

              const isStarting =
                Array.isArray(p?.positions) &&
                p.positions.some((pp: any) => String(pp?.start_reason ?? '').toLowerCase().includes('starting'));

              const [existingPLU] = await this.playerLineUpService.getQuery({
                where: { lineupId: lineUp.id, playerId: player.id } as any,
              });

              const lineupSlotFromFile =
                statsbombPlayerId != null && Number.isFinite(Number(statsbombPlayerId))
                  ? slotByStatsBombPlayerId.get(Number(statsbombPlayerId))
                  : undefined;

              const baseMeta: Record<string, unknown> = {
                source: 'StatsBomb',
                statsbombMatchId: matchData.match_id,
                statsbombPlayerId,
                statsbombTeamId,
                lastSync: new Date().toISOString(),
              };
              if (lineupSlotFromFile !== undefined) {
                baseMeta.lineupSlotIndex = lineupSlotFromFile;
              }
              if (statsbombPositionId !== undefined) {
                baseMeta.statsbombPositionId = statsbombPositionId;
              }

              let mergedMeta = deepMergeEntityMetadata(
                (existingPLU?.metadata ?? {}) as Record<string, unknown>,
                baseMeta,
              ) as Record<string, unknown>;
              const prevSlot = (existingPLU?.metadata as { lineupSlotIndex?: number } | undefined)
                ?.lineupSlotIndex;
              if (typeof prevSlot === 'number') {
                mergedMeta = { ...mergedMeta, lineupSlotIndex: prevSlot };
              }

              const resolvedPositionId = positionId ?? existingPLU?.positionId;

              if (existingPLU) {
                await this.playerLineUpService.update(existingPLU.id, {
                  id: existingPLU.id,
                  isCaptain: existingPLU.isCaptain,
                  isStarting: !!isStarting,
                  positionId: resolvedPositionId,
                  metadata: mergedMeta,
                } as any);
              } else {
                await this.playerLineUpService.create({
                  lineupId: lineUp.id,
                  playerId: player.id,
                  isStarting: !!isStarting,
                  isCaptain: false,
                  positionId,
                  metadata: baseMeta,
                } as any);
              }
            }),
          );
        }),
      );
    } catch (error) {
      this.logger.warn(`Error syncing lineups for match ${matchData.match_id}:`, error);
    }
  }

  /**
   * Get fixture ID by StatsBomb match ID
   */
  private async getFixtureIdByStatsBombMatchId(statsbombMatchId: number): Promise<number | null> {
    try {
      const fixture = await this.findFixtureByStatsBombMatchId(statsbombMatchId);
      return fixture ? fixture.id : null;
    } catch (error) {
      this.logger.error(`Error getting fixture ID for StatsBomb match ${statsbombMatchId}:`, error);
      return null;
    }
  }

  /**
   * Get or create a stadium
   */
  private async getOrCreateStadium(stadiumData: any, fallbackCountry?: string): Promise<Stadium | null> {
    if (!stadiumData?.name) {
      return null;
    }
    const name = String(stadiumData.name).trim();
    const normalized = this.normalizeStadiumName(name);

    // Fast path: in-memory dedupe (handles casing/whitespace differences)
    const cached = await this.getStadiumsCached();
    const fromCache = cached.find((s) => this.normalizeStadiumName(s.name) === normalized);
    if (fromCache) return fromCache;

    await this.withStadiumLock(normalized || name, async () => {
      const recheck = await this.getStadiumsCached();
      const again = recheck.find((s) => this.normalizeStadiumName(s.name) === normalized);
      if (again) return;

      const [byExactName] = await this.stadiumService.getQuery({ where: { name } });
      if (byExactName) {
        this.cachedStadiums = null;
        return;
      }

      const country = stadiumData.country ?? fallbackCountry ?? 'Unknown';
      await this.stadiumService.create({
        name,
        country,
        metadata: {
          source: 'StatsBomb',
          lastSync: new Date().toISOString(),
          statsbombId: stadiumData.id,
          providers: {
            statsbomb: {
              externalId: String(stadiumData.id),
            },
          },
          normalizedName: normalized,
        },
      } as any);

      this.cachedStadiums = null;
    });

    const refreshed = await this.getStadiumsCached();
    const createdOrExisting = refreshed.find((s) => this.normalizeStadiumName(s.name) === normalized);
    if (!createdOrExisting) {
      const [fallback] = await this.stadiumService.getQuery({ where: { name } });
      return fallback ?? null;
    }
    return createdOrExisting;
  }

  private async getExistingStadium(stadiumData: any): Promise<Stadium | null> {
    if (!stadiumData?.name) return null;
    const [stadium] = await this.stadiumService.getQuery({ where: { name: stadiumData.name } });
    return stadium ?? null;
  }

  /**
   * Sync events (goals, etc.) to database
   */
  async syncEvents(options?: {
    skipCards?: boolean;
    skipGoals?: boolean;
    skipStartingXi?: boolean;
    skipLineups?: boolean;
    incremental?: boolean;
  }): Promise<void> {
    this.logger.log('🎯 Syncing events...');
    
    const competitions = await this.fetchCompetitions();
    const incremental = options?.incremental !== false;
    this.logger.log(`📊 Found ${competitions.length} competitions for events sync`);
    
    let totalEventsProcessed = 0;
    let totalGoalsCreated = 0;
    
    for (const comp of competitions) {
      if (!(await this.shouldSyncStatsBombCompetitionSeason(comp, incremental))) {
        this.logger.debug(
          `Skipping events for ${comp.competition_name} ${comp.season_name} (unchanged watermark)`,
        );
        continue;
      }
      try {
        this.logger.log(`🏆 Processing events for competition: ${comp.competition_name}`);
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        this.logger.log(`⚽ Found ${matches.length} matches for events sync`);
        
        // Process matches in parallel batches of 50
        const batchSize = 50;
        for (let i = 0; i < matches.length; i += batchSize) {
          const batch = matches.slice(i, i + batchSize);
          
          this.logger.log(`Processing events batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(matches.length / batchSize)} (${batch.length} matches)`);
          
          // Process all matches in the batch in parallel
          const batchPromises = batch.map(async (match) => {
            try {
              return await this.syncEventsFromMatchWithOptions(match.match_id, {
                skipCards: options?.skipCards,
                skipGoals: options?.skipGoals,
                skipStartingXi: options?.skipStartingXi,
                skipLineups: options?.skipLineups,
                matchData: match as StatsBombMatch,
              });
            } catch (error) {
              this.logger.warn(`Error syncing events for match ${match.match_id}:`, error);
              return 0;
            }
          });
          
          // Wait for all matches in the batch to complete
          const results = await Promise.allSettled(batchPromises);
          
          // Sum up events processed
          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              totalEventsProcessed += result.value;
            }
          });
        }

        await this.markStatsBombCompetitionSeasonSynced(comp);
      } catch (error) {
        this.logger.warn(`Error syncing events for competition ${comp.competition_name}:`, error);
      }
    }
    
    this.logger.log(`🎉 Events sync completed! Processed ${totalEventsProcessed} events, created ${totalGoalsCreated} goals`);
  }

  /**
   * Sync events from a specific match
   */
  async syncEventsFromMatch(matchId: number, options?: SyncEventsFromMatchOptions): Promise<number> {
    return this.syncEventsFromMatchWithOptions(matchId, options);
  }

  private async syncEventsFromMatchWithOptions(
    matchId: number,
    options?: SyncEventsFromMatchOptions,
  ): Promise<number> {
    try {
      // Get the internal fixture ID for this StatsBomb match ID
      const fixtureId = await this.getFixtureIdByStatsBombMatchId(matchId);
      
      if (!fixtureId) {
        this.logger.warn(`⚠️ No fixture found for StatsBomb match ${matchId}. Make sure the fixture is synced first.`);
        return 0;
      }

      const events = await this.fetchEvents(matchId);
      this.logger.debug(`📊 Found ${events.length} events for StatsBomb match ${matchId} (fixture ID: ${fixtureId})`);

      if (options?.matchData) {
        const [fx] = await this.fixtureService.getQuery({ where: { id: fixtureId } as any });
        if (fx?.homeTeamId && fx?.awayTeamId) {
          await this.ensureTeamsManagersFromMatch(options.matchData, fx.homeTeamId, fx.awayTeamId);
        }
      }

      let startingXiTeamsSynced = 0;
      if (!options?.skipStartingXi) {
        startingXiTeamsSynced = await this.syncStartingXiFromEvents(
          events,
          matchId,
          fixtureId,
          options?.matchData,
        );
      }

      if (!options?.skipLineups && options?.matchData) {
        await this.syncLineupsFromMatch(options.matchData, fixtureId);
      }

      if (options?.matchData) {
        await this.refreshLineUpManagersForFixture(options.matchData, fixtureId);
      }

      // Filter relevant events (period 5 = penalty shootout — not regulation goals)
      const goalEvents = events.filter(
        (e) =>
          e.period !== 5 &&
          e.type.name === 'Shot' &&
          e.shot?.outcome?.name === 'Goal',
      );
      const cardEvents = events.filter(
        (e) =>
          (e.type?.name === 'Foul Committed' && !!e.foul_committed?.card) ||
          (e.type?.name === 'Bad Behaviour' && !!e.bad_behaviour?.card) ||
          !!e.bad_behaviour?.card ||
          !!e.foul_committed?.card,
      );
      const substitutionEvents = events.filter(e => e.type.name === 'Substitution');
      
      // Collect all unique player and team names needed
      const playerNames = new Set<string>();
      const teamNames = new Set<string>();
      
      const assistNameByGoalEventId = this.mapAssistPlayerNameByGoalEventId(events);
      goalEvents.forEach(e => {
        if (e.player?.name) playerNames.add(e.player.name);
        if (e.team?.name) teamNames.add(e.team.name);
        const assistName = assistNameByGoalEventId.get(e.id);
        if (assistName) playerNames.add(assistName);
      });
      
      cardEvents.forEach(e => {
        if (e.player?.name) playerNames.add(e.player.name);
        if (e.team?.name) teamNames.add(e.team.name);
      });
      
      substitutionEvents.forEach(e => {
        if (e.player?.name) playerNames.add(e.player.name);
        if (e.substitution?.replacement?.name) playerNames.add(e.substitution.replacement.name);
        if (e.team?.name) teamNames.add(e.team.name);
      });
      
      // Batch fetch all players and teams needed
      const [players, teams] = await Promise.all([
        Promise.all(Array.from(playerNames).map(name => 
          this.playerService.getQuery({ where: { name } }).then(([player]) => ({ name, player }))
        )),
        Promise.all(Array.from(teamNames).map(name => 
          this.teamService.getQuery({ where: { name } }).then(([team]) => ({ name, team }))
        ))
      ]);
      
      // Create lookup maps
      const playerMap = new Map<string, any>();
      const teamMap = new Map<string, any>();
      
      players.forEach(({ name, player }) => {
        if (player) playerMap.set(name, player);
      });
      
      teams.forEach(({ name, team }) => {
        if (team) teamMap.set(name, team);
      });
      
      // Collect all event sync promises
      const eventPromises: Promise<void>[] = [];
      
      if (!options?.skipGoals) {
        goalEvents.forEach(event => {
          const assistName = assistNameByGoalEventId.get(event.id);
          const assistant = assistName ? playerMap.get(assistName) ?? null : null;
          eventPromises.push(this.syncGoal(event, fixtureId, playerMap, teamMap, assistant));
        });
      }
      
      if (!options?.skipCards) {
        // Process cards in parallel
        cardEvents.forEach(event => {
          eventPromises.push(this.syncCard(event, fixtureId, playerMap, teamMap));
        });
      }
      
      // Process substitutions in parallel
      substitutionEvents.forEach(event => {
        eventPromises.push(this.syncSubstitution(event, fixtureId, playerMap, teamMap));
      });
      
      // Process all events in parallel
      await Promise.allSettled(eventPromises);

      await this.playerFixtureStatService.rebuildFromStatsBombEvents(
        fixtureId,
        events as StatsBombEventForRollup[],
        (statsbombPlayerId, name) => {
          const byName = playerMap.get(name);
          if (byName?.id) return byName.id;
          void statsbombPlayerId;
          return null;
        },
      );

      // Derive team-level aggregate stats from the player rollups just written.
      // This fills fixtureTeamStat with source=derived so the match page can show
      // total shots, xG, passes, etc. even without an API-Sports stats sync.
      const [fxForTeamStat] = await this.fixtureService.getQuery({ where: { id: fixtureId } as any });
      if (fxForTeamStat?.homeTeamId && fxForTeamStat?.awayTeamId) {
        await this.fixtureTeamStatService.deriveFromPlayerFixtureStats(
          fixtureId,
          fxForTeamStat.homeTeamId,
          fxForTeamStat.awayTeamId,
        );
      }

      if (options?.matchData) {
        await this.persistPenaltyShootoutFromEvents(fixtureId, events, options.matchData);
      }
      
      this.logger.debug(
        `⚽ ${goalEvents.length} goals, 🟨🟥 ${cardEvents.length} cards, 🔄 ${substitutionEvents.length} subs, ` +
          `👕 ${startingXiTeamsSynced} lineup teams (Starting XI from events) — match ${matchId} (fixture ${fixtureId})`,
      );
      const goalsCount = options?.skipGoals ? 0 : goalEvents.length;
      const cardsCount = options?.skipCards ? 0 : cardEvents.length;
      return goalsCount + cardsCount + substitutionEvents.length + startingXiTeamsSynced;
    } catch (error) {
      this.logger.warn(`Error syncing events for match ${matchId}:`, error);
      return 0;
    }
  }

  /** StatsBomb formation codes are digits per defensive line, e.g. 41212 → 4-1-2-1-2 */
  private statsBombFormationCodeToLabel(code: number | undefined): string | undefined {
    if (code === undefined || code === null || !Number.isFinite(code)) return undefined;
    const digits = String(Math.abs(Math.trunc(code))).split('');
    return digits.length ? digits.join('-') : undefined;
  }

  private extractStartingXiRows(ev: StatsBombEvent): Array<{
    statsbombPlayerId: number;
    name: string;
    positionName: string;
    jerseyNumber?: number;
    statsbombPositionId?: number;
  }> {
    const tactics = ev.tactics as StatsBombEvent['tactics'] | undefined;
    if (!tactics) return [];
    const raw = ((tactics as { lineup?: unknown[] }).lineup ?? tactics.line_up ?? []) as Array<{
      player?: { id?: number; name?: string };
      position?: { name?: string; id?: number };
      jersey_number?: number;
    }>;
    if (!Array.isArray(raw)) return [];
    const out: Array<{
      statsbombPlayerId: number;
      name: string;
      positionName: string;
      jerseyNumber?: number;
      statsbombPositionId?: number;
    }> = [];
    for (const row of raw) {
      const pid = row?.player?.id;
      const name = row?.player?.name;
      if (pid === undefined || pid === null || !name) continue;
      const sbPosId = row?.position?.id;
      out.push({
        statsbombPlayerId: Number(pid),
        name: String(name),
        positionName: row?.position?.name ? String(row.position.name) : '',
        jerseyNumber:
          row?.jersey_number !== undefined && row?.jersey_number !== null
            ? Number(row.jersey_number)
            : undefined,
        ...(sbPosId !== undefined && sbPosId !== null && Number.isFinite(Number(sbPosId))
          ? { statsbombPositionId: Number(sbPosId) }
          : {}),
      });
    }
    return out;
  }

  private async mergeFixtureStartingXiFallback(
    fixtureId: number,
    matchId: number,
    localTeamId: number,
    statsbombTeamId: number,
    formation: string | undefined,
    rows: Array<{
      statsbombPlayerId: number;
      name: string;
      positionName: string;
      jerseyNumber?: number;
      statsbombPositionId?: number;
    }>,
  ): Promise<void> {
    const [fx] = await this.fixtureService.getQuery({ where: { id: fixtureId } });
    if (!fx) return;
    const patch: Record<string, unknown> = {
      statsbomb: {
        startingXiFallback: {
          [String(localTeamId)]: {
            formation,
            matchId,
            statsbombTeamId,
            updatedAt: new Date().toISOString(),
            starters: rows.map((r) => ({
              statsbombPlayerId: r.statsbombPlayerId,
              name: r.name,
              position: r.positionName,
              jerseyNumber: r.jerseyNumber,
            })),
          },
        },
      },
    };
    await this.fixtureService.update(fixtureId, {
      id: fixtureId,
      metadata: deepMergeEntityMetadata(
        (fx.metadata ?? {}) as Record<string, unknown>,
        patch,
      ) as any,
    } as any);
  }

  /**
   * Persist Starting XI from events (open-data): updates LineUp formation + PlayerLineUp starters when possible.
   */
  private async syncStartingXiFromEvents(
    events: StatsBombEvent[],
    matchId: number,
    fixtureId: number,
    matchData?: StatsBombMatch,
  ): Promise<number> {
    const xiEvents = events.filter((e) => e.type?.name === 'Starting XI');
    if (!xiEvents.length) return 0;

    let teamsHandled = 0;

    for (const ev of xiEvents) {
      const sbTeamId = ev.team?.id;
      if (!sbTeamId) continue;

      let localTeamId = await this.getLocalTeamId(sbTeamId);
      if (!localTeamId && ev.team?.name) {
        const [byName] = await this.teamService.getQuery({ where: { name: ev.team.name } });
        localTeamId = byName?.id ?? null;
      }
      if (!localTeamId) continue;

      const formationLabel = this.statsBombFormationCodeToLabel(ev.tactics?.formation);
      const rows = this.extractStartingXiRows(ev);
      if (!rows.length) continue;

      let [lineUp] = await this.lineupService.getQuery({ where: { fixtureId, teamId: localTeamId } as any });

      let managerId: number | null = null;
      if (matchData) {
        managerId = await this.resolveLineupManagerForTeam(matchData, localTeamId, sbTeamId);
      }
      if (!managerId || (await this.managerIsStatsBombPlaceholder(managerId))) {
        if (
          lineUp?.managerId &&
          !(await this.managerIsStatsBombPlaceholder(lineUp.managerId))
        ) {
          managerId = lineUp.managerId;
        }
      }
      if (!managerId) {
        managerId = await this.getOrCreateStatsBombPlaceholderManager(localTeamId);
      }

      if (!lineUp && managerId) {
        lineUp = await this.lineupService.create({
          fixtureId,
          teamId: localTeamId,
          managerId,
          formation: formationLabel,
          metadata: {
            source: 'StatsBomb',
            providers: {
              statsbomb: {
                externalId: `${fixtureId}:${localTeamId}`,
              },
            },
            statsbombMatchId: matchId,
            statsbombTeamId: sbTeamId,
            fromStartingXiEvent: true,
            lastSync: new Date().toISOString(),
          },
        } as any);
      } else if (lineUp) {
        const patch: { id: number; formation?: string; managerId?: number } = { id: lineUp.id };
        if (formationLabel && lineUp.formation !== formationLabel) {
          patch.formation = formationLabel;
        }
        const managerResolvedReal =
          !!managerId && !(await this.managerIsStatsBombPlaceholder(managerId));
        if (managerResolvedReal && managerId != null && lineUp.managerId !== managerId) {
          patch.managerId = managerId;
        }
        if (patch.formation !== undefined || patch.managerId !== undefined) {
          await this.lineupService.update(lineUp.id, patch as any);
        }
      }

      if (!lineUp) {
        await this.mergeFixtureStartingXiFallback(
          fixtureId,
          matchId,
          localTeamId,
          sbTeamId,
          formationLabel,
          rows,
        );
        teamsHandled++;
        continue;
      }

      for (let slotIdx = 0; slotIdx < rows.length; slotIdx++) {
        const row = rows[slotIdx];
        let player = await this.findPlayerByStatsBombPlayerId(row.statsbombPlayerId);
        if (!player) {
          const [byName] = await this.playerService.getQuery({ where: { name: row.name } });
          player = byName ?? null;
        }
        if (!player) continue;

        let positionId: number | undefined;
        if (row.positionName) {
          const pos = await this.getOrCreatePosition(row.positionName);
          positionId = pos?.id;
        }

        const [existingPLU] = await this.playerLineUpService.getQuery({
          where: { lineupId: lineUp.id, playerId: player.id } as any,
        });

        const basePatch: Record<string, unknown> = {
          statsbombMatchId: matchId,
          statsbombPlayerId: row.statsbombPlayerId,
          statsbombTeamId: sbTeamId,
          jerseyNumber: row.jerseyNumber,
          lastStartingXiSync: new Date().toISOString(),
          lineupSlotIndex: slotIdx,
        };
        if (row.statsbombPositionId != null && Number.isFinite(row.statsbombPositionId)) {
          basePatch.statsbombPositionId = row.statsbombPositionId;
        }

        const pluMeta = existingPLU
          ? (deepMergeEntityMetadata(
              (existingPLU.metadata ?? {}) as Record<string, unknown>,
              basePatch,
            ) as Record<string, unknown>)
          : basePatch;

        if (existingPLU) {
          await this.playerLineUpService.update(existingPLU.id, {
            id: existingPLU.id,
            isStarting: true,
            positionId: positionId ?? existingPLU.positionId,
            metadata: pluMeta,
          } as any);
        } else {
          await this.playerLineUpService.create({
            lineupId: lineUp.id,
            playerId: player.id,
            isStarting: true,
            isCaptain: false,
            positionId,
            metadata: pluMeta,
          } as any);
        }
      }

      teamsHandled++;
    }

    return teamsHandled;
  }

  /**
   * Fetch events for a specific match
   */
  private async fetchEvents(matchId: number): Promise<StatsBombEvent[]> {
    try {
      return await this.httpService.fetchEvents(matchId);
    } catch (error) {
      this.logger.error(`Error fetching events for match ${matchId}:`, error);
      return [];
    }
  }

  /**
   * Persist penalty-shootout winner and tally onto fixture metadata (StatsBomb period 5).
   */
  private async persistPenaltyShootoutFromEvents(
    fixtureId: number,
    events: StatsBombEvent[],
    matchData: StatsBombMatch,
  ): Promise<void> {
    const [fixture] = await this.fixtureService.getQuery({ where: { id: fixtureId } as any });
    if (!fixture?.homeTeamId || !fixture?.awayTeamId) return;

    const resultFields = deriveStatsBombPenaltyShootout(
      events,
      matchData.home_team.home_team_id,
      matchData.away_team.away_team_id,
      fixture.homeTeamId,
      fixture.awayTeamId,
    );
    if (resultFields.decidedBy !== 'penalties') return;

    await this.fixtureService.update(fixtureId, {
      id: fixtureId,
      metadata: deepMergeEntityMetadata(
        (fixture.metadata ?? {}) as Record<string, unknown>,
        resultFields as Record<string, unknown>,
      ) as any,
    } as any);
  }

  /** Shot event id → assisting player's StatsBomb name. */
  private mapAssistPlayerNameByGoalEventId(events: StatsBombEvent[]): Map<string, string> {
    const byId = new Map<string, StatsBombEvent>();
    for (const event of events) {
      if (event.id) byId.set(event.id, event);
    }

    const assistNameByGoalEventId = new Map<string, string>();

    for (const event of events) {
      if (event.period === 5) continue;
      if (event.type?.name !== 'Shot' || event.shot?.outcome?.name !== 'Goal') continue;
      const keyPassId = event.shot?.key_pass_id;
      if (!keyPassId) continue;
      const pass = byId.get(keyPassId);
      const name = pass?.player?.name?.trim();
      if (name) assistNameByGoalEventId.set(event.id, name);
    }

    for (const event of events) {
      if (event.period === 5) continue;
      if (event.type?.name !== 'Pass' || !event.pass?.goal_assist) continue;
      const shotId = event.pass.assisted_shot_id;
      const name = event.player?.name?.trim();
      if (!shotId || !name || assistNameByGoalEventId.has(shotId)) continue;
      assistNameByGoalEventId.set(shotId, name);
    }

    return assistNameByGoalEventId;
  }

  private async upsertGoalAssistant(
    goal: { id: number; assistantId?: number | null },
    assistant: { id: number } | null | undefined,
  ): Promise<void> {
    if (!assistant?.id) return;
    if (goal.assistantId === assistant.id) return;
    await this.goalService.update(goal.id, { assistantId: assistant.id });
  }

  /**
   * Sync a goal to database
   */
  private async syncGoal(
    eventData: StatsBombEvent,
    fixtureId: number,
    playerMap?: Map<string, any>,
    teamMap?: Map<string, any>,
    assistant?: { id: number } | null,
  ): Promise<void> {
    try {
      const statsbombPlayerName = eventData.player?.name ?? 'Unknown player';
      this.logger.debug(`🎯 Processing goal: ${statsbombPlayerName} at ${eventData.minute}'`);
      if (!eventData.player?.name) {
        this.logger.warn(`⚠️ Goal event ${eventData.id} missing player; skipping`);
        return;
      }

      const team = await this.resolveStatsBombTeam(eventData.team, teamMap);

      const existingGoalByEventId = await this.findGoalByStatsBombEventId(eventData.id, fixtureId);
      if (existingGoalByEventId) {
        await this.upsertIncidentTeamId('goal', existingGoalByEventId, team);
        await this.upsertGoalAssistant(existingGoalByEventId, assistant);
        return;
      }

      // Get player from map or query
      let player: any | null = null;
      if (playerMap) {
        player = playerMap.get(eventData.player.name);
      } else {
        const [foundPlayer] = await this.playerService.getQuery({
          where: { name: eventData.player.name }
        });
        player = foundPlayer ?? null;
      }

      if (!player) {
        this.logger.warn(`⚠️ Player not found for goal: ${statsbombPlayerName}`);
        return;
      }

      // Fallback duplicate check (now that we have local player id)
      const [existingGoalByFields] = await this.goalService.getQuery({
        where: {
          fixtureId: fixtureId,
          minute: eventData.minute,
          scorerId: player.id,
        },
      });

      if (existingGoalByFields) {
        await this.upsertIncidentTeamId('goal', existingGoalByFields, team);
        await this.upsertGoalAssistant(existingGoalByFields, assistant);
        return;
      }

      if (!team) {
        this.logger.warn(`⚠️ Team not found for goal: ${eventData.team?.name ?? 'unknown'}`);
        return;
      }

      const goalData = {
        minute: eventData.minute,
        scorerId: player.id,
        fixtureId: fixtureId,
        teamId: team.id,
        assistantId: assistant?.id,
        penalty: eventData.shot?.type?.name === 'Penalty',
        ownGoal: false, // Would need additional logic to determine this
        metadata: {
          source: 'StatsBomb',
          statsbombEventId: eventData.id,
          providers: {
            statsbomb: {
              externalId: String(eventData.id),
            },
          },
          shotType: eventData.shot?.type?.name,
          technique: eventData.shot?.technique?.name,
          bodyPart: eventData.shot?.body_part?.name,
          lastSync: new Date().toISOString()
        }
      };

      this.logger.debug(`Creating goal with data: ${JSON.stringify(goalData)}`);
      
      const goal = await this.goalService.create(goalData);
      this.logger.log(`✅ Created goal: ${statsbombPlayerName} at ${eventData.minute}' with metadata: ${JSON.stringify(goal.metadata)}`);
      
      // Verify metadata was stored by querying the database
      const [verificationGoal] = await this.goalService.getQuery({
        where: { id: goal.id }
      });
      this.logger.debug(`Verification - Goal metadata from DB: ${JSON.stringify(verificationGoal?.metadata)}`);
    } catch (error) {
      this.logger.error(`Error creating goal for event ${eventData.id}:`, error);
      throw error;
    }
  }

  /**
   * Sync a card to database
   */
  private async syncCard(
    eventData: StatsBombEvent,
    fixtureId: number,
    playerMap?: Map<string, any>,
    teamMap?: Map<string, any>,
  ): Promise<void> {
    try {
      const statsbombPlayerId = eventData.player?.id;
      const statsbombPlayerName = eventData.player?.name ?? 'Unknown player';
      this.logger.debug(`🟨🟥 Processing card: ${statsbombPlayerName} at ${eventData.minute}'`);

      const team = await this.resolveStatsBombTeam(eventData.team, teamMap);

      const existingCardByEventId = await this.findCardByStatsBombEventId(eventData.id, fixtureId);
      if (existingCardByEventId) {
        await this.upsertIncidentTeamId('card', existingCardByEventId, team);
        return;
      }

      // Resolve local player (prefer StatsBomb player id, fallback to name)
      let player: any | null = null;
      if (statsbombPlayerId) {
        player = await this.findPlayerByStatsBombPlayerId(statsbombPlayerId);
      }
      if (!player && playerMap && eventData.player?.name) {
        player = playerMap.get(eventData.player.name) ?? null;
      }
      if (!player && eventData.player?.name) {
        const [foundPlayer] = await this.playerService.getQuery({
          where: { name: eventData.player.name },
        });
        player = foundPlayer ?? null;
      }

      if (!player) {
        this.logger.warn(
          `⚠️ Player not found for card event ${eventData.id} (${statsbombPlayerName})`,
        );
        return;
      }

      if (!team) {
        this.logger.warn(`⚠️ Team not found for card: ${eventData.team?.name ?? 'unknown'}`);
        return;
      }

      // Fallback duplicate check (now that we have local player id)
      const [existingCardByFields] = await this.cardService.getQuery({
        where: {
          fixtureId: fixtureId,
          minute: eventData.minute,
          playerId: player.id,
        },
      });

      if (existingCardByFields) {
        await this.upsertIncidentTeamId('card', existingCardByFields, team);
        return;
      }

      const cardName = eventData.foul_committed?.card?.name ?? eventData.bad_behaviour?.card?.name ?? '';
      // Determine card type
      const cardType = cardName.toLowerCase().includes('red')
        ? CardType.RED 
        : CardType.YELLOW;

      const cardData = {
        minute: eventData.minute,
        playerId: player.id,
        fixtureId: fixtureId,
        teamId: team.id,
        type: cardType,
        metadata: {
          source: 'StatsBomb',
          statsbombEventId: eventData.id,
          providers: {
            statsbomb: {
              externalId: String(eventData.id),
            },
          },
          cardName,
          lastSync: new Date().toISOString()
        }
      };

      this.logger.debug(`Creating card with data: ${JSON.stringify(cardData)}`);
      
      const card = await this.cardService.create(cardData);
      this.logger.log(
        `✅ Created ${cardType.toLowerCase()} card: ${statsbombPlayerName} at ${eventData.minute}' with metadata: ${JSON.stringify(card.metadata)}`,
      );
    } catch (error) {
      this.logger.error(`Error creating card for event ${eventData.id}:`, error);
      throw error;
    }
  }

  /**
   * Sync a substitution to database
   */
  private async syncSubstitution(eventData: StatsBombEvent, fixtureId: number, playerMap?: Map<string, any>, teamMap?: Map<string, any>): Promise<void> {
    try {
      const statsbombPlayerName = eventData.player?.name ?? 'Unknown player';
      this.logger.debug(`🔄 Processing substitution: ${statsbombPlayerName} at ${eventData.minute}'`);
      if (!eventData.player?.name) {
        this.logger.warn(`⚠️ Substitution event ${eventData.id} missing player; skipping`);
        return;
      }

      const team = await this.resolveStatsBombTeam(eventData.team, teamMap);

      const existingSubstitutionByEventId = await this.findSubstitutionByStatsBombEventId(
        eventData.id,
        fixtureId,
      );
      if (existingSubstitutionByEventId) {
        await this.upsertIncidentTeamId('substitution', existingSubstitutionByEventId, team);
        return;
      }

      // Get players from map or query
      let playerOut, playerIn;
      if (playerMap) {
        playerOut = playerMap.get(eventData.player.name);
        playerIn = eventData.substitution?.replacement?.name 
          ? playerMap.get(eventData.substitution.replacement.name)
          : null;
      } else {
        const [foundPlayerOut] = await this.playerService.getQuery({
          where: { name: eventData.player.name }
        });
        playerOut = foundPlayerOut;

        if (eventData.substitution?.replacement?.name) {
          const [foundPlayerIn] = await this.playerService.getQuery({
            where: { name: eventData.substitution.replacement.name }
          });
          playerIn = foundPlayerIn;
        }
      }

      if (!playerOut) {
        this.logger.warn(`⚠️ Player out not found for substitution: ${statsbombPlayerName}`);
        return;
      }

      if (!playerIn) {
        this.logger.warn(`⚠️ Player in not found for substitution: ${eventData.substitution?.replacement?.name}`);
        return;
      }

      if (!team) {
        this.logger.warn(`⚠️ Team not found for substitution: ${eventData.team?.name ?? 'unknown'}`);
        return;
      }

      // Fallback duplicate check (now that we have local player out id)
      const [existingSubstitutionByFields] = await this.substitutionService.getQuery({
        where: {
          fixtureId: fixtureId,
          minute: eventData.minute,
          playerOutId: playerOut.id,
        },
      });

      if (existingSubstitutionByFields) {
        await this.upsertIncidentTeamId('substitution', existingSubstitutionByFields, team);
        return;
      }

      const substitutionData = {
        minute: eventData.minute,
        playerOutId: playerOut.id,
        playerInId: playerIn.id,
        fixtureId: fixtureId,
        teamId: team.id,
        metadata: {
          source: 'StatsBomb',
          statsbombEventId: eventData.id,
          providers: {
            statsbomb: {
              externalId: String(eventData.id),
            },
          },
          outcome: eventData.substitution?.outcome?.name,
          lastSync: new Date().toISOString()
        }
      };

      this.logger.debug(`Creating substitution with data: ${JSON.stringify(substitutionData)}`);
      
      const substitution = await this.substitutionService.create(substitutionData);
      this.logger.log(`✅ Created substitution: ${statsbombPlayerName} → ${eventData.substitution?.replacement?.name} at ${eventData.minute}' with metadata: ${JSON.stringify(substitution.metadata)}`);
    } catch (error) {
      this.logger.error(`Error creating substitution for event ${eventData.id}:`, error);
      throw error;
    }
  }

  /**
   * Map StatsBomb competition type to our enum
   */
  private mapCompetitionType(competitionName: string): CompetitionType {
    const name = competitionName.toLowerCase();
    if (name.includes('champions league') || name.includes('europa league')) {
      return CompetitionType.CUP;
    }
    return CompetitionType.LEAGUE;
  }

  /**
   * Map StatsBomb match status to our enum
   */
  private mapFixtureStatus(status: string): FixtureStatus {
    switch (status.toLowerCase()) {
      case 'available':
        return FixtureStatus.COMPLETED;
      case 'scheduled':
        return FixtureStatus.SCHEDULED;
      case 'in_play':
        return FixtureStatus.LIVE;
      default:
        return FixtureStatus.SCHEDULED;
    }
  }

  /**
   * Map StatsBomb competition stage to our enum
   */
  private mapFixtureStage(stage: string): FixtureStage {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes('final') || stageLower.includes('semi') || stageLower.includes('quarter')) {
      switch (stageLower) {
        case 'final':
          return FixtureStage.FINAL;
        case 'semi':
          return FixtureStage.SEMI_FINAL;
        case 'quarter':
          return FixtureStage.QUARTER_FINAL;
        case 'last 16':
          return FixtureStage.LAST_16;
        case 'last 32':
          return FixtureStage.LAST_32;
        case 'group':
          return FixtureStage.GROUP_STAGE;
        case 'third':
          return FixtureStage.THIRD_PLACE;
        case 'playoff':
          return FixtureStage.PLAY_OFF;
        default:
          return FixtureStage.LEAGUE;
      }
    }


    return FixtureStage.LEAGUE;
  }

  /**
   * Test team type detection with sample data
   */
  testTeamTypeDetection(): { teamName: string; teamCountry: string; detectedType: TeamType }[] {
    const testCases = [
      { teamName: 'Brazil', teamCountry: 'Brazil' },
      { teamName: 'Argentina', teamCountry: 'Argentina' },
      { teamName: 'Manchester United', teamCountry: 'England' },
      { teamName: 'Real Madrid', teamCountry: 'Spain' },
      { teamName: 'Barcelona', teamCountry: 'Spain' },
      { teamName: 'Germany', teamCountry: 'Germany' },
      { teamName: 'France', teamCountry: 'France' },
      { teamName: 'Liverpool FC', teamCountry: 'England' },
      { teamName: 'Bayern Munich', teamCountry: 'Germany' },
      { teamName: 'Juventus', teamCountry: 'Italy' },
      { teamName: 'AC Milan', teamCountry: 'Italy' },
      { teamName: 'Paris Saint-Germain', teamCountry: 'France' },
      { teamName: 'Chelsea FC', teamCountry: 'England' },
      { teamName: 'Arsenal', teamCountry: 'England' },
      { teamName: 'Spain', teamCountry: 'Spain' },
      { teamName: 'Italy', teamCountry: 'Italy' },
      { teamName: 'Netherlands', teamCountry: 'Netherlands' },
      { teamName: 'Portugal', teamCountry: 'Portugal' },
      { teamName: 'Belgium', teamCountry: 'Belgium' },
      { teamName: 'Croatia', teamCountry: 'Croatia' },
    ];

    return testCases.map(testCase => ({
      teamName: testCase.teamName,
      teamCountry: testCase.teamCountry,
      detectedType: this.determineTeamType(testCase.teamName, testCase.teamCountry)
    }));
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus(): Promise<any> {
    const competitionCount = await this.competitionService.count();
    const teamCount = await this.teamService.count();
    const playerCount = await this.playerService.count();
    const fixtureCount = await this.fixtureService.count();
    const goalCount = await this.goalService.count();
    const cardCount = await this.cardService.count();
    const substitutionCount = await this.substitutionService.count();

    return {
      competitions: competitionCount,
      teams: teamCount,
      players: playerCount,
      fixtures: fixtureCount,
      goals: goalCount,
      cards: cardCount,
      substitutions: substitutionCount,
      events: goalCount + cardCount + substitutionCount,
      lastSync: new Date().toISOString(),
    };
  }
}
