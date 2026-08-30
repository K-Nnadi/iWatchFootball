import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubTicketRuleEnforcement } from '../../enums/clubTicketRule.enum';

@Entity('clubTicketRule')
export class ClubTicketRule extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int', unique: true } })
    @ApiProperty()
    teamId!: number;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    @ApiProperty({ default: true })
    resaleAllowed!: boolean;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Max resale price as % of face value' })
    maxResalePricePct?: number;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 500 } })
    @ApiPropertyOptional()
    notes?: string;

    @EntityEnumColumn({ db: { type: 'varchar', length: 20, default: ClubTicketRuleEnforcement.NONE } })
    @ApiProperty({ enum: ClubTicketRuleEnforcement })
    enforcedAt!: ClubTicketRuleEnforcement;
}
