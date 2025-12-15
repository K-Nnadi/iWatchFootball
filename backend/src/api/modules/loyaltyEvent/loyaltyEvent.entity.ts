import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {User} from '../user/user.entity';
import {LoyaltyScheme} from "../loyaltyScheme/loyaltyScheme.entity";
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {PickType} from '@nestjs/swagger';
import {LoyaltyEventType} from "../../enums/loyaltyEventType.enum";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('loyaltyEvent')
@SecurityFeature<LoyaltyEvent>({
  base: {
    // READ operations - Users can only see their own loyalty events, admins can see all
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<LoyaltyEvent> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'eventType', 'userId', 'loyaltySchemeId', 
        'rewardAmount', 'description', 'metadata'
      ],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<LoyaltyEvent> => {
        return { userId: req.user?.id };
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'eventType', 'rewardAmount', 'description', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<LoyaltyEvent> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create loyalty events (usually done by service)
      fields: ['eventType', 'userId', 'loyaltySchemeId', 'rewardAmount', 'description', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<LoyaltyEvent> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can update loyalty events
      fields: ['description', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<LoyaltyEvent> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete loyalty events
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<LoyaltyEvent> => ({ id: -1 }) },
  },
})
export class LoyaltyEvent extends BaseDbEntity {
    @EntityEnumColumn({
        db: {type: 'varchar', length: 50},
        api: {description: 'Type of loyalty event', example: LoyaltyEventType.SPENDING_MILESTONE},
    })
    eventType!: LoyaltyEventType;

    /**
     * User who received this loyalty reward
     */
    @EntityColumn({
        db: {type: 'int'},
        api: {description: 'ID of the user who received this reward', example: 1},
    })
    userId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => User,
        joinOptions: {name: 'userId'},
        description: 'User who received this loyalty reward'
    })
    user!: User;

    /**
     * Optional reference to the loyalty scheme that triggered this event
     */
    @OptionalEntityColumn({
        db: {type: 'int'},
        api: {description: 'ID of the loyalty scheme that triggered this event', example: 1},
    })
    loyaltySchemeId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => LoyaltyScheme,
        joinOptions: {name: 'loyaltySchemeId'},
        description: 'Loyalty scheme that triggered this event'
    })
    loyaltyScheme?: LoyaltyScheme;

    /**
     * Credit amount awarded
     */
    @EntityColumn({
        db: {type: 'decimal', precision: 10, scale: 2},
        api: {description: 'Credit amount awarded', example: 20.00},
    })
    rewardAmount!: number;

    @OptionalEntityColumn({
        db: {type: 'varchar', length: 500},
        api: {description: 'Description of the loyalty event', example: 'Birthday reward: £10 credit'},
    })
    description?: string;
}

export class CreateLoyaltyEventDTO extends PickType(LoyaltyEvent, [
    'eventType',
    'userId',
    'loyaltySchemeId',
    'rewardAmount',
    'description',
] as const) {}

