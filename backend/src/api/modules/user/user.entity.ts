import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, OneToMany, OneToOne} from "typeorm";
import {UserType} from "../../enums/user.enum";
import {Log} from "../log/log.entity";
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    RelationshipType
} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {Prediction} from "../prediction/prediction.entity";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';
import {CommsPreference} from "../commsPreference/commsPreference.entity";
import {Credit} from "../credit/credit.entity";
import {Transaction} from "../transaction/transaction.entity";
import {TrackerVisibility} from "../../enums/social.enum";
import {UserFavouriteTeam} from "../userFavouriteTeam/userFavouriteTeam.entity";


@Entity('user')
@SecurityFeature<User>({
  base: {
    // READ operations - Admin and moderator can read all users
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<User> => {
        // Admins and moderators can see all users
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'firstName', 'lastName', 'userName', 'email', 'type', 'favouriteTeamIds',
        'trackerVisibility', 'shareVerifiedOnly'
      ],
    },
    default: { filter: (): FindOptionsWhere<User> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.READ]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<User> => {
        // Admins and moderators can see all users
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'firstName', 'lastName', 'userName', 'email', 'type', 'favouriteTeamIds',
        'trackerVisibility', 'shareVerifiedOnly'
      ],
    },
    [UserRole.USER]: {
      // Users can only see their own user record
      filter: (req: RequestWithUser): FindOptionsWhere<User> => {
        return { id: req.user?.id };
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'firstName', 'lastName', 'userName', 'email', 'type', 'favouriteTeamIds',
        'trackerVisibility', 'shareVerifiedOnly'
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
      fields: ['firstName', 'lastName', 'userName', 'email', 'type', 'favouriteTeamIds'],
    },
    [UserRole.USER]: {
      // Users can update their own favourite teams
      filter: (req: RequestWithUser): FindOptionsWhere<User> => {
        return { id: req.user?.id };
      },
      fields: ['favouriteTeamIds', 'trackerVisibility', 'shareVerifiedOnly'],
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

    @EntityColumn()
    userName!: string

    @EntityColumn({
        db: {unique: true},
        api: {format: 'email'}
    })
    email!: string

    @EntityColumn({api: {minLength: 8, maxLength: 32}})
    password!: string

    @EntityEnumColumn({
        db: {default: UserRole.USER, enum: UserRole},
    })
    type!: UserRole

    @ApiProperty()
    @OneToMany(() => Log, log => log.user, {lazy: true})
    logs!: Promise<Log[]>

    @ApiPropertyOptional()
    @OneToMany(() => Prediction, prediction => prediction.fixture, {lazy: true})
    predictions?: Promise<Prediction[]>;

    @ApiPropertyOptional()
    @OneToOne(() => CommsPreference, (commsPreference) => commsPreference.user, { lazy: true })
    commsPreference?: Promise<CommsPreference>;

    @EntityRelation({
        type: RelationshipType.ONE_TO_ONE,
        entity: () => Credit,
        description: 'Credit account for this user'
    })
    credit?: Promise<Credit>;

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => Transaction,
        inverseSide: (transaction: Transaction) => transaction.user,
        description: 'Transactions for this user'
    })
    transactions?: Promise<Transaction[]>;

    @ApiPropertyOptional({ type: [Number], description: 'Favourite team IDs (not a DB column; populated from userFavouriteTeam join rows)' })
    favouriteTeamIds?: number[];

    @ApiPropertyOptional()
    @OneToMany(() => UserFavouriteTeam, (link) => link.user, { lazy: true })
    favouriteTeamLinks?: Promise<UserFavouriteTeam[]>;

    @EntityEnumColumn({
        db: { enum: TrackerVisibility, default: TrackerVisibility.PRIVATE },
        api: { enum: TrackerVisibility },
    })
    trackerVisibility!: TrackerVisibility;

    @EntityColumn({ db: { type: 'boolean', default: true } })
    shareVerifiedOnly!: boolean;
}

export class CreateUserDTO extends PickType(User, ["firstName", "lastName", "userName", "email", "type", "metadata"] as const) {
}
