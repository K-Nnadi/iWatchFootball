import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { PaymentProviderType } from '../../enums/paymentProvider.enum';
import { SecurityFeature } from '../../../auth/decorators/security-feature.decorator';
import { OperationType, createRoleGroup, UserRole } from '../../../auth/types/security.types';
import { RequestWithUser } from '../../../auth/types/auth.types';
import { FindOptionsWhere } from 'typeorm';

@Entity('paymentProvider')
@SecurityFeature<PaymentProvider>({
    base: {
        // READ operations - Public can see enabled providers (without secrets), admins see all
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
            filter: (req: RequestWithUser): FindOptionsWhere<PaymentProvider> => {
                return {};
            },
            fields: [
                'id',
                'createdAt',
                'updatedAt',
                'name',
                'slug',
                'type',
                'apiKey',
                'enabled',
                'logoUrl',
                'metadata',
            ],
        },
        // Public can only see enabled providers without sensitive data
        'public': {
            filter: (): FindOptionsWhere<PaymentProvider> => {
                return { enabled: true };
            },
            fields: ['id', 'name', 'slug', 'type', 'enabled', 'logoUrl'],
        },
        default: { filter: (): FindOptionsWhere<PaymentProvider> => ({ id: -1 }), fields: ['id'] },
    },
    [OperationType.CREATE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            // Only admin can create payment providers
            fields: ['name', 'slug', 'type', 'apiKey', 'enabled', 'logoUrl', 'metadata'],
        },
        default: { filter: (): FindOptionsWhere<PaymentProvider> => ({ id: -1 }) },
    },
    [OperationType.UPDATE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            // Only admin can update payment providers
            fields: ['name', 'slug', 'type', 'apiKey', 'enabled', 'logoUrl', 'metadata'],
        },
        default: { filter: (): FindOptionsWhere<PaymentProvider> => ({ id: -1 }) },
    },
    [OperationType.DELETE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            // Only admin can delete payment providers
            fields: [],
        },
        default: { filter: (): FindOptionsWhere<PaymentProvider> => ({ id: -1 }) },
    },
})
export class PaymentProvider extends BaseDbEntity {
    @EntityColumn({
        db: { type: 'varchar', length: 100 },
        api: { description: 'Display name of the payment provider', example: 'Stripe' },
    })
    name!: string;

    @EntityColumn({
        db: { type: 'varchar', length: 50, unique: true },
        api: { description: 'Unique slug identifier', example: 'stripe' },
    })
    slug!: string;

    @EntityEnumColumn({
        db: { enum: PaymentProviderType },
        api: { description: 'Type of payment provider', example: PaymentProviderType.CARD },
    })
    type!: PaymentProviderType;

    /**
     * API Key or Secret for the payment provider
     * NOTE: In production, this should be encrypted at rest using TypeORM's encryption transformer
     * or stored in a secure secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
     */
    @EntityColumn({
        db: { type: 'text' },
        api: { description: 'API key or secret (encrypted in production)', example: 'sk_live_...' },
    })
    apiKey!: string;

    @EntityColumn({
        db: { type: 'boolean', default: false },
        api: { description: 'Whether this provider is enabled and available', example: true },
    })
    enabled!: boolean;

    @OptionalEntityColumn({
        db: { type: 'varchar', length: 500 },
        api: { description: 'URL to the provider logo', example: '/logos/stripe.svg' },
    })
    logoUrl?: string;

    @OptionalEntityColumn({
        db: { type: 'json' },
        api: { description: 'Additional configuration/metadata as JSON', example: {} },
    })
    metadata?: Record<string, any>;
}

export class CreatePaymentProviderDTO extends PickType(PaymentProvider, [
    'name',
    'slug',
    'type',
    'apiKey',
    'enabled',
    'logoUrl',
    'metadata',
] as const) {}

