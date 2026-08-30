import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToOne} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Team} from "../team/team.entity";
import {Competition} from "../competition/competition.entity";
import {Season} from "../season/season.entity";
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

}

export class CreateTeamCompetitionSeasonDTO extends PickType(TeamCompetitionSeason, [
  'teamId',
  'competitionId',
  'seasonId',
  'metadata',
] as const) {}