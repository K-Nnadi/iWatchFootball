import {ApiProperty, PickType} from "@nestjs/swagger";
import {Entity, OneToOne, JoinColumn} from "typeorm";
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {EntityColumn, OptionalEntityColumn, EntityEnumColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';
import { CommunicationFrequency, Language } from "../../enums/commsPreference.enum";
import { User } from "../user/user";

@Entity('commsPreference')
@SecurityFeature<CommsPreference>({
  base: {
    // READ operations - Users can only see their own preferences, admins can see all
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<CommsPreference> => {
        // Admins and moderators can see all communication preferences
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'userId', 'emailNotifications', 'smsNotifications',
        'pushNotifications', 'inAppNotifications', 'marketingEmails', 'newsletterEmails',
        'matchReminders', 'language', 'timezone', 'metadata'
      ],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<CommsPreference> => {
        // Users can only see their own communication preferences
        return { userId: req.user?.id };
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'userId', 'emailNotifications', 'smsNotifications',
        'pushNotifications', 'inAppNotifications', 'marketingEmails', 'newsletterEmails',
        'matchReminders', 'language', 'timezone', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<CommsPreference> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      // All authenticated users can create communication preferences
      fields: ['userId', 'emailNotifications', 'smsNotifications', 'pushNotifications', 
              'inAppNotifications', 'marketingEmails', 'newsletterEmails', 'matchReminders', 
              'language', 'timezone', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<CommsPreference> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Admin and moderator can update any communication preferences
      fields: ['userId', 'emailNotifications', 'smsNotifications', 'pushNotifications', 
              'inAppNotifications', 'marketingEmails', 'newsletterEmails', 'matchReminders', 
              'language', 'timezone', 'metadata'],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<CommsPreference> => {
        // Users can only update their own communication preferences
        return { userId: req.user?.id };
      },
      fields: ['emailNotifications', 'smsNotifications', 'pushNotifications', 
              'inAppNotifications', 'marketingEmails', 'newsletterEmails', 'matchReminders', 
              'language', 'timezone', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<CommsPreference> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete communication preferences
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<CommsPreference> => ({ id: -1 }) },
  },
})
export class CommsPreference extends BaseDbEntity {

    @EntityColumn({db: {type: "int"}})
    userId!: number;

    @ApiProperty()
    @OneToOne(() => User, user => user.commsPreference, { lazy: true })
    @JoinColumn({ name: 'userId' })
    user!: Promise<User>;

    // Email notification preferences
    @EntityEnumColumn({
        db: {enum: CommunicationFrequency, default: CommunicationFrequency.DAILY},
        api: {enum: CommunicationFrequency}
    })
    emailNotifications!: CommunicationFrequency;

    // SMS notification preferences
    @EntityEnumColumn({
        db: {enum: CommunicationFrequency, default: CommunicationFrequency.NEVER},
        api: {enum: CommunicationFrequency}
    })
    smsNotifications!: CommunicationFrequency;

    // Push notification preferences
    @EntityEnumColumn({
        db: {enum: CommunicationFrequency, default: CommunicationFrequency.IMMEDIATE},
        api: {enum: CommunicationFrequency}
    })
    pushNotifications!: CommunicationFrequency;

    // In-app notification preferences
    @EntityEnumColumn({
        db: {enum: CommunicationFrequency, default: CommunicationFrequency.IMMEDIATE},
        api: {enum: CommunicationFrequency}
    })
    inAppNotifications!: CommunicationFrequency;

    // Marketing email preferences
    @EntityEnumColumn({
        db: {enum: CommunicationFrequency, default: CommunicationFrequency.WEEKLY},
        api: {enum: CommunicationFrequency}
    })
    marketingEmails!: CommunicationFrequency;

    // Newsletter email preferences
    @EntityEnumColumn({
        db: {enum: CommunicationFrequency, default: CommunicationFrequency.WEEKLY},
        api: {enum: CommunicationFrequency}
    })
    newsletterEmails!: CommunicationFrequency;

    // Match reminder preferences
    @EntityEnumColumn({
        db: {enum: CommunicationFrequency, default: CommunicationFrequency.DAILY},
        api: {enum: CommunicationFrequency}
    })
    matchReminders!: CommunicationFrequency;

    // Language preference
    @EntityEnumColumn({
        db: {enum: Language, default: Language.EN},
        api: {enum: Language}
    })
    language!: Language;

    // Timezone preference
    @OptionalEntityColumn({db: {type: "varchar"}})
    timezone?: string;
}

export class CommsPreferenceDTO extends PickType(CommsPreference, [
    'userId', 'emailNotifications', 'smsNotifications', 'pushNotifications', 
    'inAppNotifications', 'marketingEmails', 'newsletterEmails', 'matchReminders', 
    'language', 'timezone', 'metadata'
] as const) {}
