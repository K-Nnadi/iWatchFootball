import {ApiProperty, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToOne} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {PredictedResult} from "../../enums/prediction.enum";
import {User} from "../user/user";
import {Fixture} from "../fixture/fixture";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('prediction')
@SecurityFeature<Prediction>({
  base: {
    // READ operations - Users can only see their own predictions, admins can see all
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Prediction> => {
        // Admins and moderators can see all predictions
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'userId', 'fixtureId', 'predicted', 'metadata'
      ],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Prediction> => {
        // Users can only see their own predictions
        return { userId: req.user?.id };
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'userId', 'fixtureId', 'predicted', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Prediction> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      // All authenticated users can create predictions
      fields: ['userId', 'fixtureId', 'predicted', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Prediction> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update predictions
      fields: ['userId', 'fixtureId', 'predicted', 'metadata'],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Prediction> => {
        // Users can only update their own predictions
        return { userId: req.user?.id };
      },
      fields: ['predicted', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Prediction> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete predictions
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Prediction> => ({ id: -1 }) },
  },
})
export class Prediction extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    userId!: number;

    @ApiProperty()
    @ManyToOne(() => User, user => user.predictions, {lazy: true})
    user!: Promise<User>;

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @ApiProperty()
    @ManyToOne(() => Fixture, fixture => fixture.predictions, {lazy: true})
    fixture!: Promise<Fixture>;

    @OptionalEntityColumn({db:{enum: PredictedResult}})
    predicted?: PredictedResult;
}

export class CreatePredictionDTO extends PickType(Prediction, ["fixtureId", "userId", "fixture", "user", "predicted", "metadata"] as const) {}