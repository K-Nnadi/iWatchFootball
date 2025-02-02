import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Team} from '../team/team';
import {Competition} from '../competition/competition';
import {Season} from '../season/season';
import {
    EntityColumn,
    EntityRelation,
    OptionalEntityColumn,
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {PickType} from "@nestjs/swagger";

@Entity('competitionStanding')
export class CompetitionStanding extends BaseDbEntity {
    @EntityRelation({
        db: {type: 'many-to-one', target: () => Competition},
        api: {description: 'Competition', type: () => Competition},
    })
    competition?: Competition;

    @EntityColumn({
        db: {type: 'int'},
        api: {description: 'Competition ID'},
    })
    competitionId!: number;

    @EntityRelation({
        db: {type: 'many-to-one', target: () => Season},
        api: {description: 'Season', type: () => Season},
    })
    season?: Season;

    @EntityColumn({db: {type: 'int'}})
    seasonId!: number;

    @EntityRelation({
        db: {type: 'many-to-one', target: () => Team},
        api: {description: 'Team', type: () => Team},
    })
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
    'positionChange'   // Include optional fields if creation allows specifying them
] as const) {
}