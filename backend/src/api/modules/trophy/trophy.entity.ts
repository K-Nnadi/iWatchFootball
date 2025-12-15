import {Entity, ManyToOne, OneToOne} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Competition} from "../competition/competition.entity";
import {Player} from "../player/player.entity";
import {Team} from "../team/team.entity";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {PickType} from "@nestjs/swagger";

@Entity('trophy')
export class Trophy extends BaseDbEntity {
    @EntityColumn({db: {type: "varchar"}})
    name!: string;

    @OptionalEntityColumn({db: {type: "varchar"}})
    description?: string;

    @OptionalEntityColumn({db: {type: "timestamp"}})
    yearIntroduced?: Date;

    @OptionalEntityColumn({db: {type: "int"}})
    competitionId?: number;

    @OptionalEntityColumn({db: {type: "int"}})
    teamId?: number;

    @OptionalEntityColumn({db: {type: "int"}})
    playerId?: number;

    @ManyToOne(() => Competition, competition => competition.trophies, {lazy: true, nullable: true})
    competition?: Promise<Competition>;

    @ManyToOne(() => Team, team => team.trophies, {lazy: true, nullable: true})
    team?: Team;

    @ManyToOne(() => Player, player => player.trophies, {lazy: true, nullable: true})
    player?: Player;
}

export class CreateTrophyDTO extends PickType(Trophy, [
    'name',
    'description',
    'yearIntroduced',
    'competitionId',
    'teamId',
    'playerId',
    'metadata'
] as const) {
}