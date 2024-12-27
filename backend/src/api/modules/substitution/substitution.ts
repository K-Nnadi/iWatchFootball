import {ApiProperty, PickType} from '@nestjs/swagger';
import {Column, Entity, ManyToOne} from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Player} from "../player/player";
import {PlayerLineUp} from "../playerLineUp/playerLineUp";
import {Team} from "../team/team";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('substitution')
export class Substitution extends BaseDbEntity {
    @ApiProperty()
    @ManyToOne(() => PlayerLineUp, playerLineup => playerLineup.substitutions)
    playerLineup!: PlayerLineUp;

    @EntityColumn({db:{type: "int"}})
    fixtureId!: number;

    @EntityColumn({db:{type: "int"}})
    teamId!: number;

    @ApiProperty()
    @ManyToOne(() => Team, { nullable: true })
    team?: Team;

    @Column()
    playerInId!: number;

    @ManyToOne(() => Player)
    playerIn!: Player;

    @Column()
    playerOutId!: number;

    @ApiProperty()
    @ManyToOne(() => Player)
    playerOut!: Player;

    @OptionalEntityColumn({db:{type: "int"}})
    minute!: number;
}

export class CreateSubstitutionDTO extends PickType(Substitution, ["fixtureId", "teamId", "playerInId", "playerOutId", "minute"] as const) {}
