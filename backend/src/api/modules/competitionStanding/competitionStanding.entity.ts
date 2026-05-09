import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {TeamCompetitionSeason} from "../teamCompetitionSeason/teamCompetitionSeason.entity";
import {
    EntityColumn,
    EntityRelation,
    OptionalEntityColumn, RelationshipType,
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {PickType} from "@nestjs/swagger";

@Entity('competitionStanding')
export class CompetitionStanding extends BaseDbEntity {
    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => TeamCompetitionSeason,
        joinOptions: {name: 'teamCompetitionSeasonId'},
    })
    teamCompetitionSeason?: TeamCompetitionSeason;

    @EntityColumn({db: {type: 'int'}})
    teamCompetitionSeasonId!: number;

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
    'teamCompetitionSeasonId',
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