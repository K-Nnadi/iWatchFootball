import { ApiProperty } from '@nestjs/swagger';
import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { EntityColumn, EntityEnumColumn } from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { SecurityQuestion } from '../../enums/securityQuestion.enum';

@Entity('userSecurityAnswer')
export class UserSecurityAnswer extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int', unique: true } })
    @ApiProperty()
    userId!: number;

    @EntityEnumColumn({
        db: { enum: SecurityQuestion },
        api: { enum: SecurityQuestion },
    })
    question!: SecurityQuestion;

    /** bcrypt hash of normalized answer — never exposed via API */
    @EntityColumn({ db: { type: 'varchar', length: 255 } })
    answerHash!: string;
}
