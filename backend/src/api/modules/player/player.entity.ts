import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, ManyToOne, OneToMany} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Goal} from "../goal/goal.entity";
import {Transfer} from "../transfer/transfer.entity";
import {Team} from "../team/team.entity";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {Trophy} from "../trophy/trophy.entity";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';


@Entity('player')
@SecurityFeature<Player>({
  base: {
    // READ operations - Public access for players (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Player> => {
        // All users (including unauthenticated) can see all players
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'name', 'nickname', 'dateOfBirth', 'nationality',
        'positionIds', 'bio', 'currentTeamId', 'kitNumber', 'height', 'weight', 'photoUrl', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<Player> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'name', 'nickname', 'dateOfBirth', 'nationality',
        'positionIds', 'bio', 'currentTeamId', 'kitNumber', 'height', 'weight', 'photoUrl', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Player> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create players
      fields: ['name', 'nickname', 'dateOfBirth', 'nationality', 'positionIds', 'bio', 'currentTeamId', 'kitNumber', 'height', 'weight', 'photoUrl', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Player> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update players
      fields: ['name', 'nickname', 'dateOfBirth', 'nationality', 'positionIds', 'bio', 'currentTeamId', 'kitNumber', 'height', 'weight', 'photoUrl', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Player> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete players
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Player> => ({ id: -1 }) },
  },
})
export class Player extends BaseDbEntity{

    @EntityColumn({db: {type: "varchar"}})
    name!: string

    @OptionalEntityColumn({db: {type: "varchar"}})
    nickname?: string

    @EntityColumn({db: {type: "timestamp"}})
    dateOfBirth!: Date

    @EntityColumn({db: {type: "varchar"}})
    nationality!: string

    @EntityColumn({db: {type: "int", array: true}})
    positionIds?: number[]

    @OptionalEntityColumn({db: {type: "varchar"}})
    bio?: string

    @OptionalEntityColumn({ db: { type: 'int' } })
    currentTeamId?: number;

    @ApiPropertyOptional()
    @ManyToOne(() => Team, { lazy: true, nullable: true })
    currentTeam?: Promise<Team>;

    @OptionalEntityColumn({db: {type: "int"}})
    kitNumber?: number;

    @OptionalEntityColumn({db: {type: "int"}})
    height?: number;

    @OptionalEntityColumn({db: {type: "int"}})
    weight?: number;

    @OptionalEntityColumn({db: {type: "varchar"}})
    photoUrl?: string

    @ApiProperty()
    @OneToMany(() => Goal, goal => goal.scorer, {lazy: true})
    goals!: Promise<Goal[]>;

    @ApiProperty()
    @OneToMany(() => Goal, goal => goal.assistant, {lazy: true})
    assists!: Promise<Goal[]>;

    @ApiProperty()
    @OneToMany(() => Goal, goal => goal.ownGoal, {lazy: true})
    ownGoals!: Promise<Goal[]>;

    @ApiProperty()
    @OneToMany(() => Transfer, transfer => transfer.player, {lazy: true})
    transfers!: Transfer[];

    @ApiProperty({nullable: true})
    @OneToMany(() => Trophy, trophy => trophy.player, {lazy: true, nullable: true})
    trophies?: Trophy[];
}



export class CreatePlayerDTO extends PickType(Player, ["name", "nickname", "dateOfBirth", "nationality", "bio", "positionIds", "currentTeamId", "height", "weight", "kitNumber", "photoUrl", 'metadata' ] as const) {}