import {ApiProperty, PickType} from '@nestjs/swagger';
import {Column, Entity, ManyToOne, OneToMany} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {LineUp} from '../lineUp/lineUp';
import {Player} from '../player/player';
import {Substitution} from "../substitution/substitution";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('playerLineup')
export class PlayerLineUp extends BaseDbEntity {
    @ApiProperty()
    @ManyToOne(() => LineUp, lineup => lineup.playerLineups)
    lineup!: LineUp;

    @EntityColumn({ db:{ type: "int"}})
    lineupId!: number;

    @EntityColumn({ db:{ type: "int"}})
    playerId!: number;

    @ApiProperty()
    @ManyToOne(() => Player)
    player!: Player;

    @EntityColumn({ db:{ type: "boolean"}})
    isStarting!: boolean;

    @OptionalEntityColumn({ db:{ type: "int"}})
    positionId?: number;

    @ApiProperty()
    @OneToMany(() => Substitution, substitution => substitution.playerLineup)
    substitutions!: Substitution[];

    @EntityColumn({ db:{ type: "boolean"}})
    isCaptain!: boolean;
}


export class CreatePlayerLineUpDTO extends PickType(PlayerLineUp, [ "lineupId" , "playerId" , "isCaptain" , "positionId", "isStarting"] as const) {}
