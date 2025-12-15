import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Team} from "../team/team.entity";
import {Competition} from "../competition/competition.entity";
import {Season} from "../season/season.entity";
import {
    EntityColumn,
    EntityRelation,
    OptionalEntityColumn, RelationshipType,
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {PickType} from "@nestjs/swagger";

@Entity('competitionStanding')
export class CompetitionStanding extends BaseDbEntity {
    @EntityRelation({type: RelationshipType.MANY_TO_ONE, entity: () => Competition, joinOptions: {name: 'competitionId'}})
    competition?: Competition;

    @EntityColumn({
        db: {type: 'int'},
        api: {description: 'Competition ID'},
    })
    competitionId!: number;

    @EntityRelation({type: RelationshipType.MANY_TO_ONE, entity: () => Season, joinOptions: {name: 'seasonId'}})
    season?: Season;

    @EntityColumn({db: {type: 'int'}})
    seasonId!: number;

    @EntityRelation({type: RelationshipType.MANY_TO_ONE, entity: () => Team, joinOptions: {name: 'teamId'}})
    team!: Team;

    @EntityColumn({db: {type: 'int'}})
    teamId!: number;

    @EntityColumn({db: {type: 'int'}})
    position!: number;

    @EntityColumn({db: {type: 'int'}})
    played!: number;

    @EntityColumn({db: {type: 'int'}})
    won!: number;

    @EntityColumn({db: {type: 'int'}})
    drawn!: number;

    @EntityColumn({db: {type: 'int'}})
    lost!: number;

    @EntityColumn({db: {type: 'int'}})
    goalsFor!: number;

    @EntityColumn({db: {type: 'int'}})
    goalsAgainst!: number;

    @EntityColumn({db: {type: 'int'}})
    goalDifference!: number;

    @EntityColumn({db: {type: 'int'}})
    points!: number;

    @OptionalEntityColumn({db: {type: 'varchar'}})
    form?: string;

    @OptionalEntityColumn({db: {type: 'int'}})
    positionChange?: number;
}

export class CreateCompetitionStandingDTO extends PickType(CompetitionStanding, [
    'competitionId',
    'seasonId',
    'teamId',
    'position',
    'played',
    'won',
    'drawn',
    'lost',
    'goalsFor',
    'goalsAgainst',
    'goalDifference',
    'points',
    'form',            // Include optional fields if creation allows specifying them
    'positionChange',   // Include optional fields if creation allows specifying them
    "metadata"
] as const) {
}