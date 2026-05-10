import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConfigValueType } from './platformConfig.entity';

export class UpdatePlatformConfigDto {
    @ApiProperty({ enum: ConfigValueType, description: 'Discriminator — indicates which value field holds the data' })
    valueType!: ConfigValueType;

    @ApiPropertyOptional({ description: 'Populated when valueType is number' })
    numberValue?: number;

    @ApiPropertyOptional({ description: 'Populated when valueType is string' })
    stringValue?: string;

    @ApiPropertyOptional({ description: 'Populated when valueType is boolean' })
    booleanValue?: boolean;

    @ApiPropertyOptional({ description: 'Populated when valueType is array', type: [Object] })
    arrayValue?: unknown[];

    @ApiPropertyOptional({ description: 'Populated when valueType is json' })
    jsonValue?: Record<string, unknown>;

    @ApiPropertyOptional({ description: 'Human-readable description (optional update)' })
    description?: string;
}
