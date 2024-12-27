import {ApiProperty, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToMany, OneToMany, OneToOne} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Address} from "../address/address";
import {Team} from "../team/team";
import {Fixture} from "../fixture/fixture";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";


@Entity('stadium')

export class Stadium extends BaseDbEntity{

    @EntityColumn({db: {type: "varchar"}})
    name!: string

    @OptionalEntityColumn({db: {type: "timestamp"}})
    opened?: Date

    @EntityColumn({db: {type: "int", array: true}})
    teamIds?: number[]

    @ApiProperty()
    @ManyToMany(() => Team, team => team.stadiums)
    teams!: Team[]

    @OptionalEntityColumn({db: {type: "int"}})
    capacity?: number

    @OptionalEntityColumn({db: {type: "int"}})
    addressId?: number

    @ApiProperty()
    @OneToOne(() => Address, address => address.stadium)
    address?: Address

    @ApiProperty()
    @OneToMany(() => Fixture, fixture => fixture.stadium)
    fixtures?: Fixture[]
}

export class CreateStadiumDTO extends PickType(Stadium, ["name", "opened", "teamIds", "capacity", "addressId"] as const){}