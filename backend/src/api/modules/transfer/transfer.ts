import {ApiProperty, PickType} from "@nestjs/swagger";
import {Entity, ManyToOne} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Player} from "../player/player";
import {Team} from "../team/team";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";


@Entity('transfer')
export class Transfer extends BaseDbEntity {
    @EntityColumn({db: {type: "int"}})
    playerId!: number

    @ApiProperty()
    @ManyToOne(() => Player, player => player.transfers)
    player!: Player

    @EntityColumn({db: {type: "int"}})
    sourceTeamId!: number

    @ApiProperty()
    @ManyToOne(() => Team)
    sourceTeam!: Team;  // Country player is transferring from

    @EntityColumn({db: {type: "int"}})
    destinationTeamId!: number

    @ApiProperty()
    @ManyToOne(() => Team)
    destinationTeam!: Team;

    @EntityColumn({db: {type: "int"}})
    transferFee!: number

    @OptionalEntityColumn({db: {type: "timestamp"}})
    date?: Date

    @OptionalEntityColumn({db: {type: "boolean"}})
    isLoan?: boolean
}

export class CreateTransferDTO extends PickType(Transfer, ["playerId", "sourceTeamId", "destinationTeamId", "transferFee", "date", "isLoan"] as const) {
}