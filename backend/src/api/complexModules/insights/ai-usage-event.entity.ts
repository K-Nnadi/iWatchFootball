import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityColumn, OptionalEntityColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { AiUsageOperation } from '../../enums/integration.enum';

@Entity('aiUsageEvent')
export class AiUsageEvent extends BaseDbEntity {
    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    userId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'FK to integration when not env fallback' })
    integrationId?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    fixtureId?: number;

    @EntityColumn({ db: { type: 'varchar', length: 64 } })
    @ApiProperty({ enum: AiUsageOperation })
    operation!: AiUsageOperation;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    inputTokens?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    outputTokens?: number;

    @OptionalEntityColumn({ db: { type: 'decimal', precision: 18, scale: 8 } })
    @ApiPropertyOptional()
    estimatedUsd?: string;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional()
    latencyMs?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 128 } })
    @ApiPropertyOptional()
    providerRequestId?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 64 } })
    @ApiPropertyOptional()
    errorCode?: string;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiPropertyOptional()
    metadata?: Record<string, unknown>;
}
