import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConfigValueType {
    NUMBER  = 'number',
    STRING  = 'string',
    BOOLEAN = 'boolean',
    ARRAY   = 'array',
    JSON    = 'json',
}

@Entity('platformConfig')
export class PlatformConfig extends BaseDbEntity {
    @EntityColumn({ db: { type: 'varchar', length: 100, unique: true } })
    @ApiProperty({ description: 'Unique config key' })
    key!: string;

    @EntityColumn({ db: { type: 'varchar', length: 20 } })
    @ApiProperty({ enum: ConfigValueType, description: 'Discriminator indicating which value column holds the data' })
    valueType!: ConfigValueType;

    @OptionalEntityColumn({ db: { type: 'decimal', precision: 18, scale: 4 } })
    @ApiPropertyOptional({ description: 'Populated when valueType is number' })
    numberValue?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 1000 } })
    @ApiPropertyOptional({ description: 'Populated when valueType is string' })
    stringValue?: string;

    @OptionalEntityColumn({ db: { type: 'boolean' } })
    @ApiPropertyOptional({ description: 'Populated when valueType is boolean' })
    booleanValue?: boolean;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiPropertyOptional({ description: 'Populated when valueType is array', type: [Object] })
    arrayValue?: unknown[];

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiPropertyOptional({ description: 'Populated when valueType is json' })
    jsonValue?: Record<string, unknown>;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional({ description: 'Human-readable description of this config entry' })
    description?: string;
}
