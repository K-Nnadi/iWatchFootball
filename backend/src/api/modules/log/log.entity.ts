import {PickType} from "@nestjs/swagger";
import {Entity} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {User} from "../user/user.entity";
import {Fixture} from "../fixture/fixture.entity";
import {EntityColumn, EntityRelation, OptionalEntityColumn, RelationshipType} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';


@Entity('log')
@SecurityFeature<Log>({
  base: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (): FindOptionsWhere<Log> => ({}),
      fields: [
        'id', 'createdAt', 'updatedAt', 'userId', 'fixtureId', 'ticketNumber', 'isVerified', 'notes', 'metadata'
      ],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Log> => ({ userId: req.user?.id }),
      fields: [
        'id', 'createdAt', 'updatedAt', 'userId', 'fixtureId', 'ticketNumber', 'isVerified', 'notes', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Log> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      fields: ['userId', 'fixtureId', 'ticketNumber', 'isVerified', 'notes', 'metadata'],
    },
    [UserRole.USER]: {
      fields: ['userId', 'fixtureId', 'ticketNumber', 'notes', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Log> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      fields: ['userId', 'fixtureId', 'ticketNumber', 'isVerified', 'notes', 'metadata'],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Log> => ({ userId: req.user?.id }),
      fields: ['ticketNumber', 'notes', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Log> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      fields: [],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Log> => ({ userId: req.user?.id }),
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Log> => ({ id: -1 }) },
  },
})
export class Log extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    userId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => User,
        joinOptions: {name: 'userId'},
        description: 'User who created this log'
    })
    user!: Promise<User>;

    @EntityColumn({db: {type: "int"}})
    fixtureId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: {name: 'fixtureId'},
        description: 'Fixture for this log'
    })
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
