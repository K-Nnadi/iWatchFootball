import {ApiProperty, PickType} from '@nestjs/swagger';
import {Entity, OneToMany} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {TeamCompetitionSeason} from "../teamCompetitionSeason/teamCompetitionSeason.entity";
import {EntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('season')
@SecurityFeature<Season>({
  base: {
    // READ operations - Public access for seasons (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Season> => {
        // All users (including unauthenticated) can see all seasons
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'yearStart', 'yearEnd', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<Season> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'yearStart', 'yearEnd', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Season> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create seasons
      fields: ['yearStart', 'yearEnd', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Season> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update seasons
      fields: ['yearStart', 'yearEnd', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Season> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete seasons
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Season> => ({ id: -1 }) },
  },
})
export class Season extends BaseDbEntity {
    @EntityColumn({db: {type: "int"}})
    yearStart!: number; // e.g., 2023 for 2023/2024 season

    @EntityColumn({db: {type: "int"}})
    yearEnd!: number;   // e.g., 2024

    @ApiProperty()
    @OneToMany(() => TeamCompetitionSeason, teamCompSeason => teamCompSeason.season)
    teamCompetitionSeasons!: TeamCompetitionSeason[];
}

export class CreateSeasonDTO extends PickType(Season, ['yearStart', 'yearEnd', "metadata"] as const) {}