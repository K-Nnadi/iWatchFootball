import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, ManyToMany, OneToMany} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Goal} from "../goal/goal";
import {Transfer} from "../transfer/transfer";
import {Team} from "../team/team";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {Trophy} from "../trophy/trophy";


@Entity('player')

export class Player extends BaseDbEntity{

    @EntityColumn({db: {type: "varchar"}})
    name!: string

    @OptionalEntityColumn({db: {type: "varchar"}})
    nickname?: string

    @EntityColumn({db: {type: "timestamp"}})
    dateOfBirth!: Date

    @EntityColumn({db: {type: "varchar"}})
    nationality!: string

    @EntityColumn({db: {type: "int", array: true}})
    positionIds?: number[]

    @OptionalEntityColumn({db: {type: "varchar"}})
    bio?: string

    @OptionalEntityColumn({db: {type: "int", array: true}})
    teamIds?: number[]

    @ApiPropertyOptional()
    @ManyToMany(() => Team, team => team.players, {lazy: true})
    teams?: Promise<Team[]>

    @OptionalEntityColumn({db: {type: "int"}})
    kitNumber?: number

    @OptionalEntityColumn({db: {type: "int"}})
    height?: number;

    @OptionalEntityColumn({db: {type: "int"}})
    weight?: number;

    @OptionalEntityColumn({db: {type: "varchar"}})
    photoUrl?: string

    @ApiProperty()
    @OneToMany(() => Goal, goal => goal.scorer, {lazy: true})
    goals!: Promise<Goal[]>;

    @ApiProperty()
    @OneToMany(() => Goal, goal => goal.assistant, {lazy: true})
    assists!: Promise<Goal[]>;

    @ApiProperty()
    @OneToMany(() => Goal, goal => goal.ownGoal, {lazy: true})
    ownGoals!: Promise<Goal[]>;

    @ApiProperty()
    @OneToMany(() => Transfer, transfer => transfer.player, {lazy: true})
    transfers!: Transfer[];

    @ApiProperty({nullable: true})
    @OneToMany(() => Trophy, trophy => trophy.player, {lazy: true, nullable: true})
    trophies?: Trophy[];

}



export class CreatePlayerDTO extends PickType(Player, ["name", "nickname", "dateOfBirth", "nationality", "bio", "positionIds", "teamIds", "height", "weight", "kitNumber", "photoUrl", 'metadata' ] as const) {}