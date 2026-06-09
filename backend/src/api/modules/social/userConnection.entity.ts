import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn, EntityEnumColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { UserConnectionStatus } from '../../enums/social.enum';

@Entity('userConnection')
export class UserConnection extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'User who sent the friend request' })
    requesterId!: number;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty({ description: 'User who received the friend request' })
    addresseeId!: number;

    @EntityEnumColumn({
        db: { enum: UserConnectionStatus, default: UserConnectionStatus.PENDING },
        api: { enum: UserConnectionStatus },
    })
    status!: UserConnectionStatus;
}
