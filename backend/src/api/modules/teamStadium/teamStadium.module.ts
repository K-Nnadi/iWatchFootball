import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeamStadiumDTO, TeamStadium } from './teamStadium.entity';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { deepMergeEntityMetadata } from '@iWatchFootball/base-tools/entity/entityMetadata';

/** `teamStadium.metadata.source` for rows created from API-Football GET `/teams` `venue` (club home ground). */
export const TEAM_STADIUM_PRIMARY_SOURCE_APISPORTS_TEAMS = 'api-sports-teams';

@Injectable()
export class TeamStadiumService extends CrudRepoAdapter<TeamStadium, CreateTeamStadiumDTO> {
  constructor(@InjectRepository(TeamStadium) private entityRepo: Repository<TeamStadium>) {
    super(entityRepo);
  }

  /**
   * Registered home ground from API-Football `GET /teams` (`venue`), not match venue.
   * Soft-deletes prior primary rows we tagged with the same source when the venue id changes.
   */
  async ensurePrimaryHomeFromApiSportsTeams(teamId: number, stadiumId: number): Promise<TeamStadium> {
    const patchMeta = {
      relationship: 'primary_home',
      source: TEAM_STADIUM_PRIMARY_SOURCE_APISPORTS_TEAMS,
      lastSyncedAt: new Date().toISOString(),
    } as Record<string, unknown>;

    const links = await this.getQuery({ where: { teamId } as any });
    for (const link of links) {
      const m = link.metadata as Record<string, unknown> | null | undefined;
      if (
        m &&
        m['source'] === TEAM_STADIUM_PRIMARY_SOURCE_APISPORTS_TEAMS &&
        m['relationship'] === 'primary_home' &&
        link.stadiumId !== stadiumId
      ) {
        await this.delete(link.id);
      }
    }

    const [pair] = await this.getQuery({ where: { teamId, stadiumId } as any });
    if (pair?.id) {
      const merged = deepMergeEntityMetadata(
        (pair.metadata ?? {}) as Record<string, unknown>,
        patchMeta,
      ) as any;
      await this.update(pair.id, { id: pair.id, metadata: merged } as any);
      const [again] = await this.getQuery({ where: { teamId, stadiumId } as any });
      if (again?.id) return again;
      throw new Error(`teamStadium ensurePrimaryHome: row missing after update (team=${teamId} stadium=${stadiumId})`);
    }

    const softDeleted = await this.entityRepo.findOne({
      where: { teamId, stadiumId } as any,
      withDeleted: true,
    });
    if (softDeleted?.id != null && softDeleted.deletedAt != null) {
      await this.entityRepo.recover(softDeleted);
      const merged = deepMergeEntityMetadata(
        (softDeleted.metadata ?? {}) as Record<string, unknown>,
        patchMeta,
      ) as any;
      await this.update(softDeleted.id, { id: softDeleted.id, metadata: merged } as any);
      const [again] = await this.getQuery({ where: { teamId, stadiumId } as any });
      if (again?.id) return again;
      throw new Error(`teamStadium ensurePrimaryHome: recover failed (team=${teamId} stadium=${stadiumId})`);
    }

    const created = await this.create({ teamId, stadiumId, metadata: patchMeta } as any);
    if (!created?.id) {
      throw new Error(`teamStadium ensurePrimaryHome: create failed (team=${teamId} stadium=${stadiumId})`);
    }
    return created as TeamStadium;
  }

  /** Idempotent link row for (team, stadium). */
  async ensurePair(teamId: number, stadiumId: number): Promise<TeamStadium> {
    const [existing] = await this.getQuery({
      where: { teamId, stadiumId } as any,
    });
    if (existing?.id) {
      return existing;
    }
    try {
      return await this.create({ teamId, stadiumId } as any);
    } catch {
      const [again] = await this.getQuery({
        where: { teamId, stadiumId } as any,
      });
      if (again?.id) return again;
      throw new Error(`teamStadium ensurePair failed for team ${teamId} stadium ${stadiumId}`);
    }
  }
}

@AuthedController('team-stadium')
export class TeamStadiumController extends CrudController<TeamStadium, CreateTeamStadiumDTO>(
  TeamStadium,
  CreateTeamStadiumDTO,
) {
  constructor(private service: TeamStadiumService) {
    super(service);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([TeamStadium])],
  controllers: [TeamStadiumController],
  providers: [TeamStadiumService],
  exports: [TeamStadiumService],
})
export class TeamStadiumModule {}
