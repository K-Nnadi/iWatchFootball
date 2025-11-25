import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Team} from '../team/team';
import {Stadium} from '../stadium/stadium';
import {FixtureStage, FixtureStatus} from '../../enums/fixture.enum';
import {LineUp} from '../lineUp/lineUp';
import {TeamCompetitionSeason} from '../teamCompetitionSeason/teamCompetitionSeason';
import {Goal} from '../goal/goal';
import {FixtureReferee} from '../fixtureReferee/fixtureReferee';
import {Log} from '../log/log';
import {Prediction} from '../prediction/prediction';
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {PickType} from '@nestjs/swagger';
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('fixture')
@SecurityFeature<Fixture>({
  base: {
    // READ operations - Public access for fixtures (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Fixture> => {
        // All users (including unauthenticated) can see all fixtures
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'date', 'homeTeamId', 'awayTeamId',
        'competitionId', 'seasonId', 'stadiumId', 'status', 'stage', 'attendance', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<Fixture> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'date', 'homeTeamId', 'awayTeamId',
        'competitionId', 'seasonId', 'stadiumId', 'status', 'stage', 'attendance', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Fixture> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create fixtures
      fields: ['date', 'homeTeamId', 'awayTeamId', 'competitionId', 'seasonId', 'stadiumId', 'status', 'stage', 'attendance', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Fixture> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update fixtures
      fields: ['date', 'homeTeamId', 'awayTeamId', 'competitionId', 'seasonId', 'stadiumId', 'status', 'stage', 'attendance', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Fixture> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete fixtures
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Fixture> => ({ id: -1 }) },
  },
})
export class Fixture extends BaseDbEntity {
    @EntityColumn({
        db: { type: 'timestamp' },
        api: { description: 'Date and time of the fixture', example: '2023-12-25T18:00:00Z' },
    })
    date!: Date;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'ID of the home team', example: 1 },
    })
    homeTeamId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Team,
        joinOptions: {name: 'homeTeamId'},
        description: 'Home team for this fixture'
    })
    homeTeam?: Promise<Team>;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'ID of the away team', example: 2 },
    })
    awayTeamId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Team,
        joinOptions: {name: 'awayTeamId'},
        description: 'Away team for this fixture'
    })
    awayTeam?: Promise<Team>;

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => LineUp,
        inverseSide: (lineUp: LineUp) => lineUp.fixture,
        description: 'Line-ups for this fixture'
    })
    lineUps!: Promise<LineUp[]>;

    @EntityColumn({
        db: { type: 'int' },
        api: { description: 'Competition ID associated with the fixture', example: 1 },
    })
    competitionId!: number;

    @EntityColumn({
        db: { type: 'int' },
        api: { description: 'Season ID associated with the fixture', example: 2023 },
    })
    seasonId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => TeamCompetitionSeason,
        joinOptions: {name: 'competitionId'},
        description: 'Team competition season for this fixture'
    })
    teamCompetitionSeasons!: TeamCompetitionSeason;

    @EntityColumn({
        db: { type: 'int' },
        api: { description: 'Stadium ID where the fixture takes place', example: 5 },
    })
    stadiumId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Stadium,
        joinOptions: {name: 'stadiumId'},
        description: 'Stadium where this fixture takes place'
    })
    stadium?: Stadium;

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => Goal,
        inverseSide: (goal: Goal) => goal.fixture,
        description: 'Goals scored in this fixture'
    })
    goals!: Goal[];

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => FixtureReferee,
        inverseSide: (fixtureReferee: FixtureReferee) => fixtureReferee.fixture,
        description: 'Referees for this fixture'
    })
    referees!: FixtureReferee[];

    @EntityEnumColumn({
        db: { enum: FixtureStatus },
        api: { description: 'Status of the fixture', example: FixtureStatus.SCHEDULED },
    })
    status!: FixtureStatus;

    @EntityEnumColumn({
        db: { enum: FixtureStage },
        api: { description: 'Stage of the fixture', example: FixtureStage.LEAGUE },
    })
    stage!: FixtureStage;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'Attendance for the fixture', example: 50000 },
    })
    attendance?: number;

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => Log,
        inverseSide: (log: Log) => log.fixture,
        description: 'Logs for this fixture'
    })
    logs!: Log[];

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => Prediction,
        inverseSide: (prediction: Prediction) => prediction.fixture,
        description: 'Predictions for this fixture'
    })
    predictions?: Prediction[];
}

export class CreateFixtureDTO extends PickType(Fixture, [
    'homeTeamId',
    'awayTeamId',
    'competitionId',
    'stadiumId',
    'date',
    'attendance',
    'status',
    'stage',
    'seasonId',
    'metadata'
] as const) {}
