import {Entity, ManyToOne, OneToMany} from 'typeorm';
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
    OptionalEntityColumn,
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
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

    @ApiProperty()
    @ManyToOne(() => Team, (team) => team.homeFixtures, {  nullable: true })
    homeTeam?: Promise<Team>;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'ID of the away team', example: 2 },
    })
    awayTeamId?: number;

    @ApiProperty()
    @ManyToOne(() => Team, (team) => team.awayFixtures, {  nullable: true })
    awayTeam?: Promise<Team>;

    @ApiProperty()
    @OneToMany(() => LineUp, (lineUp) => lineUp.fixture, {lazy: true})
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

    @ApiProperty()
    @ManyToOne(() => TeamCompetitionSeason, (teamCompetitionSeason) => teamCompetitionSeason.fixtures)
    teamCompetitionSeasons!: TeamCompetitionSeason;

    @EntityColumn({
        db: { type: 'int' },
        api: { description: 'Stadium ID where the fixture takes place', example: 5 },
    })
    stadiumId!: number;

    @ApiPropertyOptional({nullable: true})
    @ManyToOne(() => Stadium, (stadium) => stadium.fixtures)
    stadium?: Stadium;

    @ApiProperty()
    @OneToMany(() => Goal, (goal) => goal.fixture, { cascade: true })
    goals!: Goal[];

    @ApiProperty()
    @OneToMany(() => FixtureReferee, (fixtureReferee) => fixtureReferee.fixture)
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

    @ApiProperty()
    @OneToMany(() => Log, (log) => log.fixture)
    logs!: Log[];

    @ApiProperty()
    @OneToMany(() => Prediction, (prediction) => prediction.fixture)
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
