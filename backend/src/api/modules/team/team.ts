import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, ManyToMany, ManyToOne, OneToMany} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Stadium} from "../stadium/stadium";
import {TeamCompetitionSeason} from "../teamCompetitionSeason/teamCompetitionSeason";
import {TeamType} from "../../enums/team.enum";
import {Manager} from "../manager/manager";
import {Player} from "../player/player";
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {Fixture} from "../fixture/fixture";
import {Trophy} from "../trophy/trophy";


@Entity('team')
export class Team extends BaseDbEntity {

    @EntityColumn({db: {type: "varchar"}})
    name!: string;

    @OptionalEntityColumn({db: {type: "timestamp"}})
    founded?: Date;

    @OptionalEntityColumn({db: {type: "int", array: true}})
    stadiumIds?: number[];

    @ApiPropertyOptional({nullable: true})
    @ManyToMany(() => Stadium, stadium => stadium.teams)
    stadiums?: Stadium[]

    @ApiProperty()
    @OneToMany(() => TeamCompetitionSeason, teamCompSeason => teamCompSeason.team)
    teamCompetitionSeasons!: TeamCompetitionSeason[];

    @OptionalEntityColumn({db: {type: "int"}})
    managerId?: number;

    @ApiProperty()
    @ManyToOne(() => Manager, manager => manager.teams, {lazy: true})
    manager?: Promise<Manager>;

    @OptionalEntityColumn({db: {type: "int", array: true}})
    playerIds?: number[]

    @ApiProperty()
    @ManyToMany(() => Player, player => player.teams, {lazy: true})
    players?: Promise<Player[]>

    @OptionalEntityColumn({db: {type: "varchar"}})
    logoUrl?: string;

    @OptionalEntityColumn({db: {type: "varchar"}})
    website?: string;

    @OptionalEntityColumn({db: {type: "int"}})
    city?: string;

    @OptionalEntityColumn({db: {type: "varchar"}})
    country!: string;

    @EntityEnumColumn({
        db: {enum: TeamType, default: TeamType.CLUB}
    })
    type!: TeamType;

    @OptionalEntityColumn({db: {type: "int"}})
    parentId?: number;

    @ApiProperty()
    @OneToMany(() => Fixture, (fixture) => fixture.homeTeam, {lazy: true})
    homeFixtures?: Promise<Fixture[]>;

    @ApiProperty()
    @OneToMany(() => Fixture, (fixture) => fixture.awayTeam, {lazy: true})
    awayFixtures?: Promise<Fixture[]>;

    @ApiProperty({nullable: true})
    @OneToMany(() => Trophy, trophy => trophy.player, {lazy: true, nullable: true})
    trophies?: Trophy[];

}

export class CreateTeamDTO extends PickType(Team, ["name", "founded", "stadiumIds", "managerId", "website", "logoUrl", "city", "country", "type", "parentId"] as const) {
}