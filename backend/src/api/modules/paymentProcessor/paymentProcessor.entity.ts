import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { PickType } from '@nestjs/swagger';
import { PaymentProcessorType } from '../../enums/paymentProcessor.enum';
import { SecurityFeature } from '../../../auth/decorators/security-feature.decorator';
import { OperationType, createRoleGroup, UserRole } from '../../../auth/types/security.types';
import { RequestWithUser } from '../../../auth/types/auth.types';
import { FindOptionsWhere } from 'typeorm';

/**
 * Checkout UI registry for payment processors (display name, slug, logo, enabled).
 *
 * **Do not store PSP credentials here.** All secrets and webhook keys belong in
 * the `integration` table (`integration.config` for slug `stripe-primary`).
 *
 * @deprecated apiKey column — cleared by migration; never write new secrets to this table.
 */
@Entity('paymentProcessor')
@SecurityFeature<PaymentProcessor>({
    base: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
            filter: (_req: RequestWithUser): FindOptionsWhere<PaymentProcessor> => {
                return {};
            },
            fields: [
                'id',
                'createdAt',
                'updatedAt',
                'name',
                'slug',
                'type',
                'enabled',
                'logoUrl',
                'metadata',
            ],
        },
        public: {
            filter: (): FindOptionsWhere<PaymentProcessor> => {
                return { enabled: true };
            },
            fields: ['id', 'name', 'slug', 'type', 'enabled', 'logoUrl'],
        },
        default: { filter: (): FindOptionsWhere<PaymentProcessor> => ({ id: -1 }), fields: ['id'] },
    },
    [OperationType.CREATE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            fields: ['name', 'slug', 'type', 'enabled', 'logoUrl', 'metadata'],
        },
        default: { filter: (): FindOptionsWhere<PaymentProcessor> => ({ id: -1 }) },
    },
    [OperationType.UPDATE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            fields: ['name', 'slug', 'type', 'enabled', 'logoUrl', 'metadata'],
        },
        default: { filter: (): FindOptionsWhere<PaymentProcessor> => ({ id: -1 }) },
    },
    [OperationType.DELETE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            fields: [],
        },
        default: { filter: (): FindOptionsWhere<PaymentProcessor> => ({ id: -1 }) },
    },
})
export class PaymentProcessor extends BaseDbEntity {
    @EntityColumn({
        db: { type: 'varchar', length: 100 },
        api: { description: 'Display name of the payment processor', example: 'Stripe' },
    })
    name!: string;

    @EntityColumn({
        db: { type: 'varchar', length: 50, unique: true },
        api: { description: 'Unique slug identifier', example: 'stripe' },
    })
    slug!: string;

    @EntityEnumColumn({
        db: { enum: PaymentProcessorType },
        api: { description: 'Type of payment processor', example: PaymentProcessorType.CARD },
    })
    type!: PaymentProcessorType;

    /**
     * Legacy optional API key field. Stripe/PayPal secrets live in the `integration` table
     * (`stripe-primary.config`) — do not store PSP secrets here for new processors.
     */
    @OptionalEntityColumn({
        db: { type: 'text' },
        api: {
            description: 'Deprecated — use integration.config for PSP credentials',
            example: 'sk_live_...',
        },
    })
    apiKey?: string;

    @EntityColumn({
        db: { type: 'boolean', default: false },
        api: { description: 'Whether this processor is enabled and available', example: true },
    })
    enabled!: boolean;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 500 },
        api: { description: 'URL to the processor logo', example: '/logos/stripe.svg' },
    })
    logoUrl?: string;

    @OptionalEntityColumn({
        db: { type: 'json' },
        api: { description: 'Additional configuration/metadata as JSON', example: {} },
    })
    metadata?: Record<string, unknown>;
}

export class CreatePaymentProcessorDTO extends PickType(PaymentProcessor, [
    'name',
    'slug',
    'type',
    'enabled',
    'logoUrl',
    'metadata',
] as const) {}
