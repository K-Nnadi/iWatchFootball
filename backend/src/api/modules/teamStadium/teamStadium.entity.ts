import { Entity, Unique } from 'typeorm';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { Team } from '../team/team.entity';
import { Stadium } from '../stadium/stadium.entity';
import { EntityColumn, EntityRelation, RelationshipType } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { PickType } from '@nestjs/swagger';

@Entity('teamStadium')
@Unique('UQ_teamStadium_teamId_stadiumId', ['teamId', 'stadiumId'])
export class TeamStadium extends BaseDbEntity {
  @EntityColumn({ db: { type: 'int' } })
  teamId!: number;

  @ApiPropertyOptional()
  @EntityRelation({
    type: RelationshipType.MANY_TO_ONE,
    entity: () => Team,
    joinOptions: { name: 'teamId' },
  })
  team?: Promise<Team>;

  @EntityColumn({ db: { type: 'int' } })
  stadiumId!: number;

  @ApiPropertyOptional()
  @EntityRelation({
    type: RelationshipType.MANY_TO_ONE,
    entity: () => Stadium,
    joinOptions: { name: 'stadiumId' },
  })
  stadium?: Promise<Stadium>;
}

export class CreateTeamStadiumDTO extends PickType(TeamStadium, ['teamId', 'stadiumId', 'metadata'] as const) {}
