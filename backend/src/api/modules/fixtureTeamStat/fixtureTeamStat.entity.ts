import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Fixture } from '../fixture/fixture.entity';
import { Team } from '../team/team.entity';

export enum FixtureTeamStatSource {
    API_SPORTS = 'api_sports',
    DERIVED = 'derived',
    MANUAL = 'manual',
}

export enum FixtureTeamStatSide {
    HOME = 'home',
    AWAY = 'away',
}

@Entity('fixtureTeamStat')
export class FixtureTeamStat extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    fixtureId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: { name: 'fixtureId' },
        description: 'Fixture these team stats belong to',
    })
    fixture?: Promise<Fixture>;

    @EntityColumn({ db: { type: 'int' } })
    teamId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Team,
        joinOptions: { name: 'teamId' },
        description: 'Team these stats belong to',
    })
    team?: Promise<Team>;

    @EntityEnumColumn({
        db: { enum: FixtureTeamStatSide },
        api: { description: 'Which side of the fixture this team was on', example: FixtureTeamStatSide.HOME },
    })
    side!: FixtureTeamStatSide;

    @EntityEnumColumn({
        db: { enum: FixtureTeamStatSource },
        api: { description: 'Where the stats were sourced from', example: FixtureTeamStatSource.API_SPORTS },
    })
    source!: FixtureTeamStatSource;

    // ---- Possession ----

    @ApiPropertyOptional({ description: 'Ball possession percentage (0–100)', example: 54.3 })
    @OptionalEntityColumn({ db: { type: 'decimal', precision: 5, scale: 2 } })
    possession?: number;

    // ---- Shooting ----

    @OptionalEntityColumn({ db: { type: 'int' } })
    shotsTotal?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    shotsOnTarget?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    shotsOffTarget?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    shotsBlocked?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    shotsInsideBox?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    shotsOutsideBox?: number;

    // ---- Chance quality ----

    @ApiPropertyOptional({ description: 'Total expected goals for the team in this fixture' })
    @OptionalEntityColumn({ db: { type: 'decimal', precision: 5, scale: 2 } })
    xg?: number;

    // ---- Set pieces / discipline ----

    @OptionalEntityColumn({ db: { type: 'int' } })
    corners?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    fouls?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    offsides?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    yellowCards?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    redCards?: number;

    // ---- Goalkeeping ----

    @OptionalEntityColumn({ db: { type: 'int' } })
    goalkeeperSaves?: number;

    // ---- Passing ----

    @OptionalEntityColumn({ db: { type: 'int' } })
    passesTotal?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    passesAccurate?: number;

    @ApiPropertyOptional({ description: 'Pass accuracy as a percentage (0–100)' })
    @OptionalEntityColumn({ db: { type: 'decimal', precision: 5, scale: 2 } })
    passAccuracyPct?: number;
}

/** Serialisable shape used by services before an upsert. */
export type FixtureTeamStatInput = {
    fixtureId: number;
    teamId: number;
    side: FixtureTeamStatSide;
    source: FixtureTeamStatSource;
    possession?: number;
    shotsTotal?: number;
    shotsOnTarget?: number;
    shotsOffTarget?: number;
    shotsBlocked?: number;
    shotsInsideBox?: number;
    shotsOutsideBox?: number;
    xg?: number;
    corners?: number;
    fouls?: number;
    offsides?: number;
    yellowCards?: number;
    redCards?: number;
    goalkeeperSaves?: number;
    passesTotal?: number;
    passesAccurate?: number;
    passAccuracyPct?: number;
};
