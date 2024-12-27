import {ApiProperty, PickType} from '@nestjs/swagger';
import {Column, Entity, ManyToOne} from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Fixture} from "../fixture/fixture";
import {Player} from "../player/player";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('goal')
export class Goal extends BaseDbEntity {
    @EntityColumn({db: {type: "int"}})
    minute!: number;

    @EntityColumn({db: {type: "int"}})
    scorerId!: number;

    @ApiProperty()
    @ManyToOne(() => Player, player => player.goals)
    scorer!: Player;

    @OptionalEntityColumn({db: {type: "int"}})
    assistantId?: number;

    @ApiProperty()
    @ManyToOne(() => Player, player => player.assists, { nullable: true })
    assistant?: Player;

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @ApiProperty()
    @ManyToOne(() => Fixture, fixture => fixture.goals)
    fixture!: Fixture;

    @EntityColumn({db: {type: "int"}})
    teamId!: number;

    @OptionalEntityColumn({db: {type: "boolean"}})
    @Column()
    ownGoal?: boolean;

    @OptionalEntityColumn({db: {type: "boolean"}})
    penalty?: boolean;
}

export class CreateGoalDTO extends PickType(Goal, ["fixtureId", "scorerId", "assistantId", "teamId", "minute", "ownGoal", "penalty"] as const) {}
