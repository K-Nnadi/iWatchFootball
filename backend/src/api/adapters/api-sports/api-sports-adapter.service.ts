import { Injectable, Logger } from '@nestjs/common';
import { ApiSportsHttpService } from './api-sports-http.service';
import { API_SPORTS_CONFIG } from './api-sports.config';
import { CompetitionStandingService } from '../../modules/competitionStanding/competitionStanding.module';
import { TeamService } from '../../modules/team/team.module';
import { PlayerService } from '../../modules/player/player.module';
import { TransferService } from '../../modules/transfer/transfer.module';
import { CreateCompetitionStandingDTO } from '../../modules/competitionStanding/competitionStanding.entity';

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

@Injectable()
export class ApiSportsAdapterService {
  private readonly logger = new Logger(ApiSportsAdapterService.name);

  constructor(
    private readonly http: ApiSportsHttpService,
    private readonly competitionStandingService: CompetitionStandingService,
    private readonly teamService: TeamService,
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
    competitionId: number,
    seasonId: number,
    teamId: number,
  ): Promise<any | null> {
    const [row] = await this.competitionStandingService.getQuery({
      where: { competitionId, seasonId, teamId } as any,
    });
    return row ?? null;
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
        if (data?.errors?.length) {
          errors.push(
            `league ${item.league} season ${item.season}: ${JSON.stringify(data.errors)}`,
          );
          continue;
        }
        const response = data?.response;
        if (!Array.isArray(response) || !response[0]) {
          errors.push(`league ${item.league} season ${item.season}: empty response`);
          continue;
        }
        const leagueBlock = response[0].league;
        const groups: any[] = Array.isArray(leagueBlock?.standings) ? leagueBlock.standings : [];
        for (const group of groups) {
          const rows: any[] = Array.isArray(group) ? group : [group];
          for (const row of rows) {
            if (!row?.team?.id) continue;
            const localTeam = await this.findLocalTeamByApiSportsId(Number(row.team.id));
            if (!localTeam) {
              this.logger.warn(
                `No local team for API-Sports team id ${row.team.id} (${row.team.name}) — set metadata.providers.apisports.externalId`,
              );
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
              row.goalsDiff != null
                ? Number(row.goalsDiff)
                : goalsFor - goalsAgainst;
            const payload: CreateCompetitionStandingDTO = {
              competitionId: item.competitionId,
              seasonId: item.seasonId,
              teamId: localTeam.id,
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
              item.competitionId,
              item.seasonId,
              localTeam.id,
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
}
