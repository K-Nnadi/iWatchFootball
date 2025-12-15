import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {PickType} from '@nestjs/swagger';
import {LoyaltyEventType} from "../../enums/loyaltyEventType.enum";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('loyaltyScheme')
@SecurityFeature<LoyaltyScheme>({
  base: {
    // READ operations - Only admins and moderators can see loyalty schemes
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<LoyaltyScheme> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'eventType', 'name', 'description', 
        'threshold', 'rewardAmount', 'enabled', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<LoyaltyScheme> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can create loyalty schemes
      fields: ['eventType', 'name', 'description', 'threshold', 'rewardAmount', 'enabled', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<LoyaltyScheme> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can update loyalty schemes
      fields: ['name', 'description', 'threshold', 'rewardAmount', 'enabled', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<LoyaltyScheme> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete loyalty schemes
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<LoyaltyScheme> => ({ id: -1 }) },
  },
})
export class LoyaltyScheme extends BaseDbEntity {
    @EntityEnumColumn({
        db: {type: 'varchar', length: 50},
        api: {description: 'Type of loyalty event this scheme applies to', example: LoyaltyEventType.SPENDING_MILESTONE},
    })
    eventType!: LoyaltyEventType;

    @EntityColumn({
        db: {type: 'varchar', length: 100},
        api: {description: 'Name of the loyalty scheme', example: 'Spend £1000 Get £20'},
    })
    name!: string;

    @OptionalEntityColumn({
        db: {type: 'varchar', length: 500},
        api: {description: 'Description of the loyalty scheme', example: 'Award £20 credit when user spends £1000'},
    })
    description?: string;

    /**
     * Threshold value for the scheme (e.g., spending amount, number of purchases)
     * For SPENDING_MILESTONE: amount in pounds
     * For BIRTHDAY: not used
     * For FIRST_PURCHASE: not used
     */
    @OptionalEntityColumn({
        db: {type: 'decimal', precision: 10, scale: 2},
        api: {description: 'Threshold value for the scheme (e.g., spending amount)', example: 1000.00},
    })
    threshold?: number;

    /**
     * Credit amount to award when scheme is triggered
     */
    @EntityColumn({
        db: {type: 'decimal', precision: 10, scale: 2},
        api: {description: 'Credit amount to award when scheme is triggered', example: 20.00},
    })
    rewardAmount!: number;

    @EntityColumn({
        db: {type: 'boolean', default: true},
        api: {description: 'Whether this scheme is enabled', example: true},
    })
    enabled!: boolean;
}

export class CreateLoyaltySchemeDTO extends PickType(LoyaltyScheme, [
    'eventType',
    'name',
    'description',
    'threshold',
    'rewardAmount',
    'enabled',
] as const) {}

