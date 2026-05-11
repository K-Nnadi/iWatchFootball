import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityColumn, OptionalEntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {
    ExternalIntegrationAuthType,
    ExternalIntegrationKind,
    ExternalIntegrationProvider,
} from '../../enums/external-integration.enum';

@Entity('externalIntegration')
export class ExternalIntegration extends BaseDbEntity {
    @EntityColumn({ db: { type: 'varchar', length: 120, unique: true } })
    @ApiProperty({ description: 'Stable id for API selection, e.g. primary-llm' })
    slug!: string;

    @EntityColumn({ db: { type: 'varchar', length: 32 } })
    @ApiProperty({ enum: ExternalIntegrationKind })
    kind!: ExternalIntegrationKind;

    @EntityColumn({ db: { type: 'varchar', length: 32 } })
    @ApiProperty({ enum: ExternalIntegrationProvider })
    provider!: ExternalIntegrationProvider;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 512 } })
    @ApiPropertyOptional()
    baseUrl?: string;

    @EntityColumn({ db: { type: 'varchar', length: 32 } })
    @ApiProperty({ enum: ExternalIntegrationAuthType })
    authType!: ExternalIntegrationAuthType;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 128 } })
    @ApiPropertyOptional({ description: 'process.env key name holding the secret' })
    secretRef?: string;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiPropertyOptional({ description: 'model id, timeoutMs, headers' })
    config?: Record<string, unknown>;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    @ApiProperty()
    enabled!: boolean;

    @EntityColumn({ db: { type: 'boolean', default: false } })
    @ApiProperty({ description: 'Default LLM when request omits slug/id' })
    isDefault!: boolean;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional()
    description?: string;
}
