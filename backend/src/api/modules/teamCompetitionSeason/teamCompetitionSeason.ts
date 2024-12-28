import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToOne, OneToMany} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Team} from "../team/team";
import {Competition} from "../competition/competition";
import {Season} from "../season/season";
import {Fixture} from "../fixture/fixture";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";


@Entity('teamCompetitionSeason')
export class TeamCompetitionSeason extends BaseDbEntity {
    @EntityColumn({db: {type: "int"}})
    teamId!: number;

    @ApiPropertyOptional()
    @ManyToOne(() => Team, team => team.teamCompetitionSeasons)
    team?: Promise<Team>;

    @EntityColumn({db: {type: "int"}})
    competitionId!: number;

    @ApiProperty()
    @ManyToOne(() => Competition, competition => competition.teamCompetitionSeasons, {lazy: true})
    competition!: Promise<Competition>;

    @EntityColumn({db: {type: "int"}})
    seasonId!: number;

    @ApiProperty()
    @ManyToOne(() => Season, season => season.teamCompetitionSeasons, {lazy: true})
    season!: Promise<Season>;

    @ApiProperty()
    @OneToMany(() => Fixture, fixture => fixture.teamCompetitionSeasons, {lazy: true})
    fixtures?: Promise<Fixture[]>;

    @OptionalEntityColumn({db: {type: "int"}})
    points?: number; // Optional: Store points for league competitions

    @OptionalEntityColumn({db: {type: "int"}})
    position?: number; // Optional: Store the position in the competition for that season
}

export class CreateTeamCompetitionSeasonDTO extends PickType(TeamCompetitionSeason, ['teamId', 'competitionId', 'seasonId', 'points', 'position'] as const) {}