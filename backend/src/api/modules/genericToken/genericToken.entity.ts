import {PickType} from "@nestjs/swagger";
import {Entity} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {TokenType} from "../../enums/genericToken.enum";


@Entity('genericToken')

export class GenericToken extends BaseDbEntity {
    @EntityColumn({db: {type: "varchar"}})
    token!: string

    @EntityEnumColumn({db: {enum: TokenType}})
    type!: TokenType

    @EntityColumn({db: {type: "varchar"}})
    expiry!: string

    @OptionalEntityColumn({db: {type: "varchar"}})
    userEmail?: string

    @EntityColumn({db: {type: "int"}})
    userId!: number

}

export class CreateGenericTokenDTO extends PickType(GenericToken, ["token", "type", "expiry", "userEmail", "userId", "metadata"] as const) {
}