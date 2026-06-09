import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IntegrationKind, IntegrationProvider } from '../../enums/integration.enum';
import { SecurityFeature } from '../../../auth/decorators/security-feature.decorator';
import { OperationType, createRoleGroup, UserRole } from '../../../auth/types/security.types';
import { FindOptionsWhere } from 'typeorm';

/**
 * Unified integration registry. Credentials and provider-specific settings live in `config`.
 *
 * Example config shapes:
 * - Stripe PAYMENT: { secretKey, publishableKey, webhookSecret, premiumMonthlyPriceId }
 * - OpenAI LLM: { apiKey, model, baseUrl }
 * - API Sports HTTP_API: { apiKey, baseUrl }
 */
@Entity('integration')
@SecurityFeature<Integration>({
    base: {
        [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
            filter: (): FindOptionsWhere<Integration> => ({}),
            fields: [
                'id',
                'createdAt',
                'updatedAt',
                'slug',
                'kind',
                'provider',
                'name',
                'enabled',
                'isDefault',
                'config',
                'description',
            ],
        },
        default: { filter: (): FindOptionsWhere<Integration> => ({ id: -1 }), fields: ['id'] },
    },
    [OperationType.CREATE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            fields: ['slug', 'kind', 'provider', 'name', 'enabled', 'isDefault', 'config', 'description'],
        },
        default: { filter: (): FindOptionsWhere<Integration> => ({ id: -1 }) },
    },
    [OperationType.UPDATE]: {
        [createRoleGroup(UserRole.ADMIN)]: {
            fields: ['slug', 'kind', 'provider', 'name', 'enabled', 'isDefault', 'config', 'description'],
        },
        default: { filter: (): FindOptionsWhere<Integration> => ({ id: -1 }) },
    },
    [OperationType.DELETE]: {
        [createRoleGroup(UserRole.ADMIN)]: { fields: [] },
        default: { filter: (): FindOptionsWhere<Integration> => ({ id: -1 }) },
    },
})
export class Integration extends BaseDbEntity {
    @EntityColumn({ db: { type: 'varchar', length: 120, unique: true } })
    @ApiProperty({ example: 'stripe-primary', description: 'Unique slug for code lookups' })
    slug!: string;

    @EntityColumn({ db: { type: 'varchar', length: 32 } })
    @ApiProperty({ enum: IntegrationKind })
    kind!: IntegrationKind;

    @EntityColumn({ db: { type: 'varchar', length: 64 } })
    @ApiProperty({ enum: IntegrationProvider, description: 'Provider implementation key' })
    provider!: IntegrationProvider | string;

    @EntityColumn({ db: { type: 'varchar', length: 120 } })
    @ApiProperty({ example: 'Stripe' })
    name!: string;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty()
    enabled!: boolean;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Default integration for this kind when slug omitted' })
    isDefault!: boolean;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiPropertyOptional({
        description: 'Provider credentials and settings (encrypted at rest in production)',
        example: { secretKey: 'sk_test_...', publishableKey: 'pk_test_...' },
    })
    config?: Record<string, unknown>;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional()
    description?: string;
}

export class CreateIntegrationDTO extends PickType(Integration, [
    'slug',
    'kind',
    'provider',
    'name',
    'enabled',
    'isDefault',
    'config',
    'description',
] as const) {}
