import {ApiProperty, PickType} from "@nestjs/swagger";
import {Column, Entity, ManyToOne} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {User} from "../user/user";
import {Fixture} from "../fixture/fixture";
import {EntityColumn, OptionalEntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';


@Entity('log')
@SecurityFeature<Log>({
  base: {
    // READ operations - Only admins and moderators can see logs
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Log> => {
        // Admins and moderators can see all logs
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'userId', 'fixtureId', 'ticketNumber', 'isVerified', 'notes', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Log> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create logs
      fields: ['userId', 'fixtureId', 'ticketNumber', 'isVerified', 'notes', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Log> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update logs
      fields: ['userId', 'fixtureId', 'ticketNumber', 'isVerified', 'notes', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Log> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete logs
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Log> => ({ id: -1 }) },
  },
})
export class Log extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    userId!: number;

    @ApiProperty()
    @ManyToOne(() => User, user => user.logs, {lazy: true})
    user!: Promise<User>;

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @ApiProperty()
    @ManyToOne(() => Fixture, fixture => fixture.logs, {lazy: true})
    fixture!: Promise<Fixture>;

    @OptionalEntityColumn({db: {type: "varchar"}})
    ticketNumber?: string;

    @EntityColumn({db: {type: "boolean", default: false}})
    isVerified!: boolean;

    @OptionalEntityColumn({db: {type: "varchar"}})
    notes?: string;

}

export class CreateLogDTO extends PickType(Log, ["userId", "fixtureId", "ticketNumber", "notes", "isVerified", "metadata"] as const) {
}