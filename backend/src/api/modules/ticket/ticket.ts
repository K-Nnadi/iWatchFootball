import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Fixture} from '../fixture/fixture';
import {Payment} from '../payment/payment';
import {User} from '../user/user';
import {
    EntityColumn, EntityRelation,
    OptionalEntityColumn, RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {PickType} from '@nestjs/swagger';
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('ticket')
@SecurityFeature<Ticket>({
  base: {
    // READ operations - Public access for tickets (no authentication required)
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Ticket> => {
        // All users (including unauthenticated) can see all tickets
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'category', 'price', 'fixtureId', 'metadata'
      ],
    },
    // Allow public access (no authentication required)
    'public': {
      filter: (): FindOptionsWhere<Ticket> => {
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'category', 'price', 'fixtureId', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Ticket> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can create tickets
      fields: ['category', 'price', 'fixtureId', 'userId', 'paymentId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Ticket> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update tickets
      fields: ['category', 'price', 'fixtureId', 'userId', 'paymentId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Ticket> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete tickets
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Ticket> => ({ id: -1 }) },
  },
})
export class Ticket extends BaseDbEntity {
    @EntityColumn({db: {type: 'varchar', length: 50}})
    category!: string;

    @EntityColumn({db: {type: 'decimal', precision: 10, scale: 2},})
    price!: number;

    /**
     * The fixture this ticket is valid for
     */
    @EntityColumn({db: {type: 'int'},})
    fixtureId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: {name: 'fixtureId'},
        description: 'The fixture this ticket is valid for'
    })
    fixture!: Fixture;

    /**
     * Optional user who has purchased this ticket
     */
    @OptionalEntityColumn({db: {type: 'int'},})
    userId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => User,
        joinOptions: {name: 'userId'},
        description: 'User who has purchased this ticket'
    })
    user?: User;

    /**
     * Optional Payment information if ticket is purchased
     */
    @OptionalEntityColumn({
        db: {type: 'int'}
    })
    paymentId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Payment,
        joinOptions: {name: 'paymentId'},
        description: 'Payment information if ticket is purchased'
    })
    payment?: Payment;
}

export class CreateTicketDTO extends PickType(Ticket, [
    'category',
    'price',
    'fixtureId',
    'userId',
    'paymentId',
    'metadata'
] as const) {}