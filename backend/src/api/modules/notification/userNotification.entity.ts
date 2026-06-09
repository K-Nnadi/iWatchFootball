import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../enums/notification.enum';

@Entity('userNotification')
export class UserNotification extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    userId!: number;

    @EntityEnumColumn({
        db: { enum: NotificationType },
        api: { enum: NotificationType },
    })
    type!: NotificationType;

    @EntityColumn({ db: { type: 'varchar', length: 200 } })
    @ApiProperty()
    title!: string;

    @EntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiProperty()
    message!: string;

    @OptionalEntityColumn({ db: { type: 'timestamptz' } })
    @ApiPropertyOptional()
    readAt?: Date;

    @OptionalEntityColumn({ db: { type: 'jsonb' } })
    @ApiPropertyOptional()
    metadata?: Record<string, unknown>;
}
