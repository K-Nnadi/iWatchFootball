import {Entity, ManyToOne} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Ticket} from "../ticket/ticket.entity";
import {PaymentProvider} from "../paymentProvider/paymentProvider.entity";
import {Transaction} from "../transaction/transaction.entity";
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {ApiPropertyOptional, PickType} from '@nestjs/swagger';
import {PaymentMethod} from "../../enums/payment.enum";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('payment')
@SecurityFeature<Payment>({
  base: {
    // READ operations - Users can only see their own payments, admins can see all
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Payment> => {
        // Admins and moderators can see all payments
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'method', 'status', 'amount', 'paymentProviderId', 'metadata'
      ],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Payment> => {
        // Users can only see their own payments (through tickets)
        // This would need to be implemented through ticket relationships
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'method', 'status', 'amount', 'paymentProviderId', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Payment> => ({ id: -1 }), fields: ['id'] },
  },
    [OperationType.CREATE]: {
      [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
        // All authenticated users can create payments
        fields: ['method', 'status', 'amount', 'paymentProviderId', 'metadata'],
      },
      default: { filter: (): FindOptionsWhere<Payment> => ({ id: -1 }) },
    },
    [OperationType.UPDATE]: {
      [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
        // Only admin and moderator can update payments
        fields: ['method', 'status', 'amount', 'paymentProviderId', 'metadata'],
      },
      default: { filter: (): FindOptionsWhere<Payment> => ({ id: -1 }) },
    },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete payments
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Payment> => ({ id: -1 }) },
  },
})
export class Payment extends BaseDbEntity {
    @EntityEnumColumn({
        db: {type: 'varchar', length: 20},
    })
    method!: PaymentMethod;

    @EntityColumn({db: {enum: PaymentMethod}})
    status!: string;

    @OptionalEntityColumn({
        db: {type: 'decimal', precision: 10, scale: 2},
        api: {description: 'Total amount paid', example: 199.99},
    })
    amount?: number;

    /**
     * Optional reference to the payment provider used for this payment
     */
    @OptionalEntityColumn({
        db: {type: 'int'},
        api: {description: 'ID of the payment provider used', example: 1},
    })
    paymentProviderId?: number;

    @ApiPropertyOptional({nullable: true})
    @ManyToOne(() => PaymentProvider, {nullable: true})
    paymentProvider?: PaymentProvider;

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => Ticket,
        inverseSide: (ticket: Ticket) => ticket.payment, // Ensure this matches `Ticket.payment`
    })
    tickets!: Ticket[];

    /**
     * Transactions that make up this payment (cash, credit, etc.)
     */
    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => Transaction,
        inverseSide: (transaction: Transaction) => transaction.payment,
    })
    transactions!: Transaction[];
}

export class CreatePaymentDTO extends PickType(Payment, [
    'method',
    'status',
    'amount',
    'paymentProviderId',
] as const) {}
