import {ApiProperty, PickType} from "@nestjs/swagger";
import {Entity, ManyToOne} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Player} from "../player/player";
import {Team} from "../team/team";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';


@Entity('transfer')
@SecurityFeature<Transfer>({
  base: {
    // READ operations - Public access for transfers (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Transfer> => {
        // All users (including unauthenticated) can see all transfers
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'playerId', 'sourceTeamId', 'destinationTeamId',
        'transferFee', 'date', 'isLoan', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<Transfer> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'playerId', 'sourceTeamId', 'destinationTeamId',
        'transferFee', 'date', 'isLoan', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Transfer> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create transfers
      fields: ['playerId', 'sourceTeamId', 'destinationTeamId', 'transferFee', 'date', 'isLoan', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Transfer> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update transfers
      fields: ['playerId', 'sourceTeamId', 'destinationTeamId', 'transferFee', 'date', 'isLoan', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Transfer> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete transfers
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Transfer> => ({ id: -1 }) },
  },
})
export class Transfer extends BaseDbEntity {
    @EntityColumn({db: {type: "int"}})
    playerId!: number

    @ApiProperty()
    @ManyToOne(() => Player, player => player.transfers, { lazy: true })
    player!: Promise<Player>

    @EntityColumn({db: {type: "int"}})
    sourceTeamId!: number

    @ApiProperty()
    @ManyToOne(() => Team)
    sourceTeam!: Promise<Team>;  // Country player is transferring from

    @EntityColumn({db: {type: "int"}})
    destinationTeamId!: number

    @ApiProperty()
    @ManyToOne(() => Team)
    destinationTeam!: Promise<Team>;

    @EntityColumn({db: {type: "int"}})
    transferFee!: number

    @OptionalEntityColumn({db: {type: "timestamp"}})
    date?: Date

    @OptionalEntityColumn({db: {type: "boolean"}})
    isLoan?: boolean
}

export class CreateTransferDTO extends PickType(Transfer, ["playerId", "sourceTeamId", "destinationTeamId", "transferFee", "date", "isLoan", "metadata"] as const) {
}