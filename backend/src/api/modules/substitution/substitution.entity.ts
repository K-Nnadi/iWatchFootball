import {ApiProperty, PickType} from '@nestjs/swagger';
import {Column, Entity, ManyToOne} from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Player} from "../player/player.entity";
import {PlayerLineUp} from "../playerLineUp/playerLineUp.entity";
import {Team} from "../team/team.entity";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('substitution')
export class Substitution extends BaseDbEntity {
    @ApiProperty()
    @ManyToOne(() => PlayerLineUp, playerLineup => playerLineup.substitutions, {lazy: true})
    playerLineup!: Promise<PlayerLineUp>;

    @EntityColumn({db:{type: "int"}})
    fixtureId!: number;

    @EntityColumn({db:{type: "int"}})
    teamId!: number;

    @ApiProperty()
    @ManyToOne(() => Team, { nullable: true, lazy: true })
    team?: Promise<Team>;

    @Column()
    playerInId!: number;

    @ManyToOne(() => Player, {lazy: true })
    playerIn!: Promise<Player>;

    @Column()
    playerOutId!: number;

    @ApiProperty()
    @ManyToOne(() => Player, {lazy: true })
    playerOut!: Promise<Player>;

    @OptionalEntityColumn({db:{type: "int"}})
    minute!: number;
}

export class CreateSubstitutionDTO extends PickType(Substitution, ["fixtureId", "teamId", "playerInId", "playerOutId", "minute", "metadata"] as const) {}
