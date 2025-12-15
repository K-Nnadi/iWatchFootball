import {PickType} from '@nestjs/swagger';
import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('injury')
export class Injury extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    playerId!: number;

    @EntityColumn({db: {type: "varchar"}})
    injuryType!: string; // e.g., hamstring, ACL tear

    @EntityColumn({db: {type: "timestamp"}})
    startDate!: Date;

    @OptionalEntityColumn({db: {type: "timestamp"}})
    endDate?: Date;

    @EntityColumn({db: {type: "varchar"}})
    status!: string; // e.g., injured, recovered
}

export class CreateInjuryDTO extends PickType(Injury, ["playerId", "injuryType", "startDate", "endDate", "status", "metadata"] as const) {}
