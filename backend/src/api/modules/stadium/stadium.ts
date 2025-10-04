import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToMany, OneToMany, OneToOne} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Address} from "../address/address";
import {Team} from "../team/team";
import {Fixture} from "../fixture/fixture";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {forwardRef} from "@nestjs/common";


@Entity('stadium')

export class Stadium extends BaseDbEntity{

    @EntityColumn({db: {type: "varchar"}})
    name!: string


    @EntityColumn({db: {type: "varchar"}})
    country!: string

    @OptionalEntityColumn({db: {type: "timestamp"}})
    opened?: Date

    @EntityColumn({db: {type: "int", array: true}})
    teamIds?: number[]

    @ApiPropertyOptional()
    @ManyToMany(() => Team, team => team.stadiums, {lazy: true})
    teams?: Promise<Team[]>

    @OptionalEntityColumn({db: {type: "int"}})
    capacity?: number

    @OptionalEntityColumn({db: {type: "int"}})
    addressId?: number

    @ApiPropertyOptional()
    // @ts-ignore
    @OneToOne(() => Address, (address) => address.stadium)
    address?: Address;


    @ApiPropertyOptional()
    @OneToMany(() => Fixture, fixture => fixture.stadium, {lazy: true})
    fixtures?: Promise<Fixture[]>
}

export class CreateStadiumDTO extends PickType(Stadium, ["name", "country", "opened", "teamIds", "capacity", "addressId", 'metadata'] as const){}