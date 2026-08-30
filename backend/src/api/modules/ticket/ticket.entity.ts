import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Fixture} from "../fixture/fixture.entity";
import {Payment} from "../payment/payment.entity";
import {User} from '../user/user.entity';
import {MarketplaceListing} from '../marketplaceListing/marketplaceListing.entity';
import {
    EntityColumn, EntityEnumColumn, EntityRelation,
    OptionalEntityColumn, RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {PickType} from '@nestjs/swagger';
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';
import { TicketSource, TicketStatus } from '../../enums/ticket.enum';

/**
 * Platform inventory ticket — **one row = one seat**.
 * Seat identity for owned inventory lives here; see plans/schema-backlog.md P1-2.
 */
@Entity('ticket')
@SecurityFeature<Ticket>({
  base: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      filter: (): FindOptionsWhere<Ticket> => ({}),
      fields: [
        'id', 'createdAt', 'updatedAt', 'category', 'price', 'fixtureId',
        'status', 'source', 'activeListingId',
        'seatSection', 'seatBlock', 'metadata'
      ],
    },
    'public': {
      filter: (): FindOptionsWhere<Ticket> => ({}),
      fields: [
        'id', 'createdAt', 'updatedAt', 'category', 'price', 'fixtureId',
        'status', 'source', 'activeListingId',
        'seatSection', 'seatBlock', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Ticket> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      fields: [
        'category', 'price', 'fixtureId', 'userId', 'paymentId',
        'status', 'source', 'activeListingId',
        'seatSection', 'seatBlock', 'seatRow', 'seatNumber', 'metadata',
      ],
    },
    default: { filter: (): FindOptionsWhere<Ticket> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      fields: [
        'category', 'price', 'fixtureId', 'userId', 'paymentId',
        'status', 'source', 'activeListingId',
        'seatSection', 'seatBlock', 'seatRow', 'seatNumber', 'metadata',
      ],
    },
    default: { filter: (): FindOptionsWhere<Ticket> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
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

    @EntityColumn({db: {type: 'int'},})
    fixtureId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Fixture,
        joinOptions: {name: 'fixtureId'},
        description: 'The fixture this ticket is valid for'
    })
    fixture!: Fixture;

    @EntityEnumColumn({
        db: { enum: TicketStatus, default: TicketStatus.AVAILABLE },
        api: { enum: TicketStatus },
    })
    status!: TicketStatus;

    @EntityEnumColumn({
        db: { enum: TicketSource, default: TicketSource.PRIMARY },
        api: { enum: TicketSource },
    })
    source!: TicketSource;

    @OptionalEntityColumn({ db: { type: 'int' } })
    activeListingId?: number | null;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => MarketplaceListing,
        joinOptions: { name: 'activeListingId' },
        description: 'Active marketplace listing when status is LISTED',
    })
    activeListing?: MarketplaceListing;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 100 } })
    seatSection?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 50 } })
    seatBlock?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 20 } })
    seatRow?: string;

    @OptionalEntityColumn({ db: { type: 'varchar', length: 20 } })
    seatNumber?: string;

    @OptionalEntityColumn({db: {type: 'int'},})
    userId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => User,
        joinOptions: {name: 'userId'},
        description: 'User who has purchased this ticket'
    })
    user?: User;

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
    'status',
    'source',
    'activeListingId',
    'seatSection',
    'seatBlock',
    'seatRow',
    'seatNumber',
    'metadata'
] as const) {}
