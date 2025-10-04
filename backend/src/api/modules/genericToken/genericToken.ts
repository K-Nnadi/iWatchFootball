import {PickType} from "@nestjs/swagger";
import {Entity} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";


@Entity('genericToken')

export class GenericToken extends BaseDbEntity {
    @EntityColumn({db: {type: "varchar"}})
    token!: string

    @EntityColumn({db: {type: "varchar"}})
    type!: string

    @EntityColumn({db: {type: "varchar"}})
    expiry!: string

    @OptionalEntityColumn({db: {type: "varchar"}})
    userEmail?: string

    @EntityColumn({db: {type: "int"}})
    userId!: number

}

export class CreateGenericTokenDTO extends PickType(GenericToken, ["token", "type", "expiry", "userEmail", "userId", "metadata"] as const) {
}