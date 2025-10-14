import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, OneToMany, OneToOne} from "typeorm";
import {UserType} from "../../enums/user.enum";
import {Log} from "../log/log";
import {EntityColumn, EntityEnumColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Prediction} from "../prediction/prediction";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';
import { CommsPreference } from "../commsPreference/commsPreference";


@Entity('user')
@SecurityFeature<User>({
  base: {
    // READ operations - All authenticated users can read users (but with limited fields)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<User> => {
        // All authenticated users can see all users
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'firstName', 'lastName', 'userName', 'email', 'type'
      ],
    },
    default: { filter: (): FindOptionsWhere<User> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create users
      fields: ['firstName', 'lastName', 'userName', 'email', 'password', 'type'],
    },
    default: { filter: (): FindOptionsWhere<User> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update users
      fields: ['firstName', 'lastName', 'userName', 'email', 'type'],
    },
    default: { filter: (): FindOptionsWhere<User> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete users
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<User> => ({ id: -1 }) },
  },
})
export class User extends BaseDbEntity {
    @EntityColumn()
    firstName!: string

    @EntityColumn()
    lastName!: string

    @EntityColumn({db: {unique: true}})
    userName!: string

    @EntityColumn({
        db: {unique: true},
        api: {format: 'email'}
    })
    email!: string

    @EntityColumn({api: {minLength: 8, maxLength: 32}})
    password!: string

    @EntityEnumColumn({
        db: {default: UserType.USER, enum: UserType},
    })
    type!: UserType

    @ApiProperty()
    @OneToMany(() => Log, log => log.user, {lazy: true})
    logs!: Promise<Log[]>

    @ApiPropertyOptional()
    @OneToMany(() => Prediction, prediction => prediction.fixture, {lazy: true})
    predictions?: Promise<Prediction[]>;

    @ApiPropertyOptional()
    @OneToOne(() => CommsPreference, commsPreference => commsPreference.user, {lazy: true, nullable: true})
    commsPreference?: Promise<CommsPreference>;
}

export class CreateUserDTO extends PickType(User, ["firstName", "lastName", "userName", "email", "type", "metadata"] as const) {
}
