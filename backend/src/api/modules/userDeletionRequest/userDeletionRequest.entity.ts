import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('userDeletionRequest')
export class UserDeletionRequest extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    userId!: number;

    @EntityColumn({ db: { type: 'timestamptz' } })
    @ApiProperty()
    requestedAt!: Date;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    completedAt?: Date;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional()
    notes?: string;
}
