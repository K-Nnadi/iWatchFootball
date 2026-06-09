import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlanSlug, SubscriptionStatus } from '../../enums/subscription.enum';
import { SecurityFeature } from '../../../auth/decorators/security-feature.decorator';
import { OperationType, createRoleGroup, UserRole } from '../../../auth/types/security.types';
import { RequestWithUser } from '../../../auth/types/auth.types';
import { FindOptionsWhere } from 'typeorm';

@Entity('userSubscription')
@SecurityFeature<UserSubscription>({
    base: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
            filter: (): FindOptionsWhere<UserSubscription> => ({}),
            fields: [
                'id',
                'createdAt',
                'updatedAt',
                'userId',
                'stripeCustomerId',
                'stripeSubscriptionId',
                'planSlug',
                'status',
                'currentPeriodStart',
                'currentPeriodEnd',
                'cancelAtPeriodEnd',
            ],
        },
        [UserRole.USER]: {
            filter: (req: RequestWithUser): FindOptionsWhere<UserSubscription> => ({
                userId: req.user?.id,
            }),
            fields: [
                'id',
                'planSlug',
                'status',
                'currentPeriodEnd',
                'cancelAtPeriodEnd',
            ],
        },
        default: { filter: (): FindOptionsWhere<UserSubscription> => ({ id: -1 }), fields: ['id'] },
    },
    [OperationType.CREATE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            fields: [
                'userId',
                'stripeCustomerId',
                'stripeSubscriptionId',
                'planSlug',
                'status',
                'currentPeriodStart',
                'currentPeriodEnd',
                'cancelAtPeriodEnd',
            ],
        },
        default: { filter: (): FindOptionsWhere<UserSubscription> => ({ id: -1 }) },
    },
    [OperationType.UPDATE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            fields: [
                'stripeCustomerId',
                'stripeSubscriptionId',
                'planSlug',
                'status',
                'currentPeriodStart',
                'currentPeriodEnd',
                'cancelAtPeriodEnd',
            ],
        },
        default: { filter: (): FindOptionsWhere<UserSubscription> => ({ id: -1 }) },
    },
    [OperationType.DELETE]: {
        [createRoleGroup(UserRole.ADMIN)]: { fields: [] },
        default: { filter: (): FindOptionsWhere<UserSubscription> => ({ id: -1 }) },
    },
})
export class UserSubscription extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int', unique: true } })
    @ApiProperty({ description: 'Subscribed user id' })
    userId!: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiPropertyOptional({ description: 'Stripe customer id (cus_...)' })
    stripeCustomerId?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiPropertyOptional({ description: 'Stripe subscription id (sub_...)' })
    stripeSubscriptionId?: string;

    @EntityEnumColumn({
        db: { enum: SubscriptionPlanSlug, default: SubscriptionPlanSlug.FREE },
        api: { enum: SubscriptionPlanSlug },
    })
    planSlug!: SubscriptionPlanSlug;

    @EntityEnumColumn({
        db: { enum: SubscriptionStatus, default: SubscriptionStatus.NONE },
        api: { enum: SubscriptionStatus },
    })
    status!: SubscriptionStatus;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    currentPeriodStart?: Date;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    currentPeriodEnd?: Date;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    cancelAtPeriodEnd!: boolean;
}
