import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailDispatchStatus } from '../../enums/emailDispatch.enum';

@Entity('emailDispatchLog')
export class EmailDispatchLog extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    userId!: number;

    @EntityColumn({ db: { type: 'varchar', length: 100 } })
    @ApiProperty()
    templateKey!: string;

    @EntityEnumColumn({ db: { type: 'varchar', length: 20 } })
    @ApiProperty({ enum: EmailDispatchStatus })
    status!: EmailDispatchStatus;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 255 } })
    @ApiPropertyOptional()
    providerMessageId?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional()
    error?: string;
}
