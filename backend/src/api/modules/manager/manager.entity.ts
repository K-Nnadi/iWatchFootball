import {ApiProperty, PickType} from "@nestjs/swagger";
import {Column, Entity, OneToMany} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Team} from "../team/team.entity";
import {ManagerEmployment} from "../managerEmployment/managerEmployment.entity";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";


@Entity('manager')

export class Manager extends BaseDbEntity{
    @EntityColumn()
    name!: string

    @EntityColumn({db: {type: "varchar"}})
    nickname!: string

    @EntityColumn({db: {type: "varchar"}})
    nationality!: string

    @OptionalEntityColumn({db: {type: "int", array: true}})
    teamIds?: number[]

    @ApiProperty()
    @OneToMany(() => Team, team => team.manager)
    teams?: Promise<Team[]>

    @ApiProperty()
    @OneToMany(() => ManagerEmployment, employment => employment.manager, {lazy: true})
    employments!: Promise<ManagerEmployment[]>;
}


export class CreateManagerDTO extends PickType(Manager, ["name", "nickname","nationality", "teamIds", "metadata"] as const) {}