import {PickType} from "@nestjs/swagger";
import {Entity} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {PositionType} from "../../enums/position.enum";

@Entity('position')
export class Position extends BaseDbEntity {

    @EntityColumn({db: {type: "varchar"}})
    name!: string; // e.g., Forward, Midfielder

    @EntityEnumColumn({db: {enum: PositionType}})
    type!: PositionType

    @OptionalEntityColumn({db: {type: "varchar"}})
    abbreviation?: string; // e.g., FW, MF
}

export class CreatePositionDTO extends PickType(Position, ["name", "type", "abbreviation", "metadata"] as const) {}