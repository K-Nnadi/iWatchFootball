import {ApiProperty, PickType} from "@nestjs/swagger";
import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Team} from "../team/team";
import {Manager} from "../manager/manager";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";


@Entity('managerEmployment')
export class ManagerEmployment extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    managerId!: number;

    @ApiProperty()
    @ManyToOne(() => Manager, manager => manager.employments)
    manager?: Manager;

    @EntityColumn({db: {type: "int"}})
    @Column()
    teamId!: number;

    @ApiProperty()
    @ManyToOne(() => Team, { nullable: true })
    team?: Team;


    @OptionalEntityColumn({db: {type: "timestamp"}})
    startDate?: Date;

    @OptionalEntityColumn({db: {type: "timestamp"}})
    endDate?: Date;

    @EntityColumn({db: {type: "boolean", default: false}})
    isCurrent!: boolean;
}



export class CreateManagerEmploymentDTO extends PickType(ManagerEmployment, [] as const) {}