import {ApiProperty, PickType} from '@nestjs/swagger';
import {Entity, ManyToOne, OneToMany} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Fixture} from "../fixture/fixture";
import {Team} from "../team/team";
import {Manager} from "../manager/manager";
import {PlayerLineUp} from "../playerLineUp/playerLineUp";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('lineUp')
export class LineUp extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @ApiProperty()
    @ManyToOne(() => Fixture, fixture => fixture.lineUps, {lazy: true})
    fixture!: Promise<Fixture>;

    @EntityColumn({db: {type: "int"}})
    teamId!: number;

    @ApiProperty()
    @ManyToOne(() => Team)
    team?: Promise<Team>;

    @EntityColumn({db: {type: "int"}})
    managerId!: number;

    @ManyToOne(() => Manager,{lazy: true})
    manager?: Promise<Manager>;

    @ApiProperty()
    @OneToMany(() => PlayerLineUp, playerLineUp => playerLineUp.lineup, {lazy: true})
    playerLineups?: Promise<PlayerLineUp[]>;

    @OptionalEntityColumn({db: {type: "varchar"}})
    formation?: string; // e.g., 4-4-2, 3-5-2
}

export class CreateLineUpDTO extends PickType(LineUp, ["fixtureId", "teamId", "managerId", "formation", "metadata"] as const) {}
