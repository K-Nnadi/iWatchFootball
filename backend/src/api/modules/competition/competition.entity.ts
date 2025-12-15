import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, OneToMany} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {CompetitionType} from "../../enums/competition.enum";
import {TeamCompetitionSeason} from "../teamCompetitionSeason/teamCompetitionSeason.entity";
import {Trophy} from "../trophy/trophy.entity";
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';


@Entity('competition')
@SecurityFeature<Competition>({
  base: {
    // READ operations - Public access for competitions (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Competition> => {
        // All users (including unauthenticated) can see all competitions
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'name', 'code', 'type', 'country', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<Competition> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'name', 'code', 'type', 'country', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Competition> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create competitions
      fields: ['name', 'code', 'type', 'country', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Competition> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update competitions
      fields: ['name', 'code', 'type', 'country', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Competition> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete competitions
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Competition> => ({ id: -1 }) },
  },
})
export class Competition extends BaseDbEntity {

    @EntityColumn({
        db: {type: "varchar"}
    })
    name!: string;

    @OptionalEntityColumn({
        db: {type: "varchar"}
    })
    code?: string;

    @EntityEnumColumn({
        db: {enum: CompetitionType, default: CompetitionType.LEAGUE}
    })
    type!: CompetitionType; // e.g., league, knockout

    @EntityColumn({db: {type: "varchar"}})
    country!: string;

    @ApiProperty()
    @OneToMany(() => TeamCompetitionSeason, teamCompSeason => teamCompSeason.competition, {lazy: true})
    teamCompetitionSeasons!: Promise<TeamCompetitionSeason[]>;

    @ApiProperty()
    @OneToMany(() => Trophy, trophy => trophy.competition, {lazy: true})
    trophies!: Promise<Trophy[]>;
}

export class CreateCompetitionDTO extends PickType(Competition, ["name", "type", "country", 'metadata'] as const) {
}

