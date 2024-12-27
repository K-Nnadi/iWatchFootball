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
import {ApiProperty, PickType} from '@nestjs/swagger';

@Entity('fixture')
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

    @ManyToOne(() => Team, { eager: true, nullable: true })
    homeTeam?: Team;

    @OptionalEntityColumn({
        db: { type: 'int' },
        api: { description: 'ID of the away team', example: 2 },
    })
    awayTeamId?: number;

    @ManyToOne(() => Team, { eager: true, nullable: true })
    awayTeam?: Team;

    @OneToMany(() => LineUp, (lineUp) => lineUp.fixture)
    lineUps!: LineUp[];

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

    @ManyToOne(() => TeamCompetitionSeason, (teamCompetitionSeason) => teamCompetitionSeason.fixtures)
    teamCompetitionSeasons!: TeamCompetitionSeason;

    @EntityColumn({
        db: { type: 'int' },
        api: { description: 'Stadium ID where the fixture takes place', example: 5 },
    })
    stadiumId!: number;

    @ManyToOne(() => Stadium, (stadium) => stadium.fixtures, { eager: true })
    stadium!: Stadium;

    @OneToMany(() => Goal, (goal) => goal.fixture, { cascade: true })
    goals!: Goal[];

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
    'seasonId',
] as const) {}
