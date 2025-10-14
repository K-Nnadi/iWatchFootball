import {ApiProperty, PickType} from '@nestjs/swagger';
import {Column, Entity, ManyToOne} from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Fixture} from "../fixture/fixture";
import {Player} from "../player/player";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('goal')
@SecurityFeature<Goal>({
  base: {
    // READ operations - All authenticated users can read goals
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Goal> => {
        // All authenticated users can see all goals
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'minute', 'scorerId',
        'assistantId', 'fixtureId', 'teamId', 'ownGoal', 'penalty', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Goal> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create goals
      fields: ['minute', 'scorerId', 'assistantId', 'fixtureId', 'teamId', 'ownGoal', 'penalty', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Goal> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update goals
      fields: ['minute', 'scorerId', 'assistantId', 'fixtureId', 'teamId', 'ownGoal', 'penalty', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Goal> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete goals
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Goal> => ({ id: -1 }) },
  },
})
export class Goal extends BaseDbEntity {
    @EntityColumn({db: {type: "int"}})
    minute!: number;

    @EntityColumn({db: {type: "int"}})
    scorerId!: number;

    @ApiProperty()
    @ManyToOne(() => Player, player => player.goals, { lazy: true })
    scorer!: Promise<Player>;

    @OptionalEntityColumn({db: {type: "int"}})
    assistantId?: number;

    @ApiProperty()
    @ManyToOne(() => Player, player => player.assists, { nullable: true, lazy: true })
    assistant?: Promise<Player>;

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @ApiProperty()
    @ManyToOne(() => Fixture, fixture => fixture.goals, { lazy: true })
    fixture!: Promise<Fixture>;

    @EntityColumn({db: {type: "int"}})
    teamId!: number;

    @OptionalEntityColumn({db: {type: "boolean"}})
    @Column()
    ownGoal?: boolean;

    @OptionalEntityColumn({db: {type: "boolean"}})
    penalty?: boolean;
}

export class CreateGoalDTO extends PickType(Goal, ["fixtureId", "scorerId", "assistantId", "teamId", "minute", "ownGoal", "penalty", "metadata"] as const) {}

