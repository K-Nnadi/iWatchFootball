import { ApiPropertyOptional } from '@nestjs/swagger';
import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {
    EntityColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { Player } from '../player/player.entity';
import { Fixture } from '../fixture/fixture.entity';

@Entity('playerFixtureStat')
export class PlayerFixtureStat extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    playerId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Player,
        joinOptions: { name: 'playerId' },
        description: 'Player these stats belong to',
    })
    player?: Promise<Player>;

    @EntityColumn({ db: { type: 'int' } })
    fixtureId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: { name: 'fixtureId' },
        description: 'Fixture these stats belong to',
    })
    fixture?: Promise<Fixture>;

    @OptionalEntityColumn({ db: { type: 'decimal', precision: 8, scale: 3 } })
    xg?: number;

    @OptionalEntityColumn({ db: { type: 'decimal', precision: 8, scale: 3 } })
    xa?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    shots?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    shotsOnTarget?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    headedShots?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    successfulPasses?: number;

    @OptionalEntityColumn({ db: { type: 'decimal', precision: 5, scale: 2 } })
    passCompletionPct?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    keyPasses?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    chancesCreated?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    bigChancesCreated?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    successfulDribbles?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    duelsWon?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    touches?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    touchesInOppositionBox?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    foulsWon?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    defensiveContributions?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    tackles?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    interceptions?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    recoveries?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    foulsCommitted?: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    minutes?: number;

    @ApiPropertyOptional({ description: 'Match rating when available from data provider' })
    @OptionalEntityColumn({ db: { type: 'decimal', precision: 4, scale: 2 } })
    rating?: number;
}

export type PlayerFixtureStatRollup = {
    playerId: number;
    xg: number;
    xa: number;
    shots: number;
    shotsOnTarget: number;
    headedShots: number;
    successfulPasses: number;
    passAttempts: number;
    keyPasses: number;
    chancesCreated: number;
    bigChancesCreated: number;
    successfulDribbles: number;
    duelsWon: number;
    touches: number;
    touchesInOppositionBox: number;
    foulsWon: number;
    defensiveContributions: number;
    tackles: number;
    interceptions: number;
    recoveries: number;
    foulsCommitted: number;
};

export function emptyPlayerFixtureStatRollup(playerId: number): PlayerFixtureStatRollup {
    return {
        playerId,
        xg: 0,
        xa: 0,
        shots: 0,
        shotsOnTarget: 0,
        headedShots: 0,
        successfulPasses: 0,
        passAttempts: 0,
        keyPasses: 0,
        chancesCreated: 0,
        bigChancesCreated: 0,
        successfulDribbles: 0,
        duelsWon: 0,
        touches: 0,
        touchesInOppositionBox: 0,
        foulsWon: 0,
        defensiveContributions: 0,
        tackles: 0,
        interceptions: 0,
        recoveries: 0,
        foulsCommitted: 0,
    };
}
