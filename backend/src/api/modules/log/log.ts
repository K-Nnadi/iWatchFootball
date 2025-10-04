import {ApiProperty, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToOne} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {User} from "../user/user";
import {Fixture} from "../fixture/fixture";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";


@Entity('log')

export class Log extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    userId!: number;

    @ApiProperty()
    @ManyToOne(() => User, user => user.logs, {lazy: true})
    user!: Promise<User>;

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @ApiProperty()
    @ManyToOne(() => Fixture, fixture => fixture.logs, {lazy: true})
    fixture!: Promise<Fixture>;

    @OptionalEntityColumn({db: {type: "varchar"}})
    ticketNumber?: string;

    @EntityColumn({db: {type: "boolean", default: false}})
    isVerified!: boolean;

    @OptionalEntityColumn({db: {type: "varchar"}})
    notes?: string;

}

export class CreateLogDTO extends PickType(Log, ["userId", "fixtureId", "ticketNumber", "notes", "isVerified", "metadata"] as const) {
}