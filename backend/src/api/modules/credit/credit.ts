import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {User} from '../user/user';
import {
    EntityColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {ApiPropertyOptional, PickType} from '@nestjs/swagger';
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('credit')
@SecurityFeature<Credit>({
  base: {
    // READ operations - Users can only see their own credit, admins can see all
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Credit> => {
        // Admins and moderators can see all credits
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'balance', 'userId', 'metadata'
      ],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Credit> => {
        // Users can only see their own credit
        return { userId: req.user?.id };
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'balance', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Credit> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create credit records
      fields: ['balance', 'userId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Credit> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update credit balances
      fields: ['balance', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Credit> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete credit records
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Credit> => ({ id: -1 }) },
  },
})
export class Credit extends BaseDbEntity {
    @EntityColumn({
        db: {type: 'decimal', precision: 10, scale: 2, default: 0},
        api: {description: 'Current credit balance for the user', example: 100.50},
    })
    balance!: number;

    /**
     * User who owns this credit account
     */
    @EntityColumn({
        db: {type: 'int', unique: true},
        api: {description: 'ID of the user who owns this credit account', example: 1},
    })
    userId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => User,
        joinOptions: {name: 'userId'},
        description: 'User who owns this credit account'
    })
    user!: User;
}

export class CreateCreditDTO extends PickType(Credit, [
    'balance',
    'userId',
] as const) {}

