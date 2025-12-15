import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Payment} from "../payment/payment.entity";
import {User} from '../user/user.entity';
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {PickType} from '@nestjs/swagger';
import {TransactionType} from "../../enums/transaction.enum";
import { SecurityFeature } from "../../../auth/decorators/security-feature.decorator";
import { OperationType, createRoleGroup, UserRole } from "../../../auth/types/security.types";
import { RequestWithUser } from "../../../auth/types/auth.types";
import { FindOptionsWhere } from 'typeorm';

@Entity('transaction')
@SecurityFeature<Transaction>({
  base: {
    // READ operations - Users can only see their own transactions, admins can see all
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Transaction> => {
        // Admins and moderators can see all transactions
        return {};
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'type', 'amount', 'description', 'paymentId', 'userId', 'metadata'
      ],
    },
    [UserRole.USER]: {
      filter: (req: RequestWithUser): FindOptionsWhere<Transaction> => {
        // Users can only see their own transactions
        return { userId: req.user?.id };
      },
      fields: [
        'id', 'createdAt', 'updatedAt', 'type', 'amount', 'description', 'paymentId', 'metadata'
      ],
    },
    default: { filter: (): FindOptionsWhere<Transaction> => ({ id: -1 }), fields: ['id'] },
  },
  [OperationType.CREATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER)]: {
      // All authenticated users can create transactions
      fields: ['type', 'amount', 'description', 'paymentId', 'userId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Transaction> => ({ id: -1 }) },
  },
  [OperationType.UPDATE]: {
    [createRoleGroup(UserRole.ADMIN, UserRole.MODERATOR)]: {
      // Only admin and moderator can update transactions
      fields: ['type', 'amount', 'description', 'paymentId', 'metadata'],
    },
    default: { filter: (): FindOptionsWhere<Transaction> => ({ id: -1 }) },
  },
  [OperationType.DELETE]: {
    [createRoleGroup(UserRole.ADMIN)]: {
      // Only admin can delete transactions
      fields: [],
    },
    default: { filter: (): FindOptionsWhere<Transaction> => ({ id: -1 }) },
  },
})
export class Transaction extends BaseDbEntity {
    @EntityEnumColumn({
        db: {type: 'varchar', length: 50},
        api: {description: 'Type of transaction', example: TransactionType.CASH_PAYMENT},
    })
    type!: TransactionType;

    @EntityColumn({
        db: {type: 'decimal', precision: 10, scale: 2},
        api: {description: 'Transaction amount (positive for credits, negative for debits)', example: 50.00},
    })
    amount!: number;

    @OptionalEntityColumn({
        db: {type: 'varchar', length: 500},
        api: {description: 'Description of the transaction', example: 'Payment for ticket purchase'},
    })
    description?: string;

    /**
     * Optional reference to the payment this transaction is part of
     */
    @OptionalEntityColumn({
        db: {type: 'int'},
        api: {description: 'ID of the payment this transaction belongs to', example: 1},
    })
    paymentId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Payment,
        inverseSide: (payment: Payment) => payment.transactions,
        joinOptions: {name: 'paymentId'},
        description: 'Payment this transaction belongs to'
    })
    payment?: Payment;

    /**
     * User who owns this transaction
     */
    @EntityColumn({
        db: {type: 'int'},
        api: {description: 'ID of the user who owns this transaction', example: 1},
    })
    userId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => User,
        joinOptions: {name: 'userId'},
        description: 'User who owns this transaction'
    })
    user!: User;
}

export class CreateTransactionDTO extends PickType(Transaction, [
    'type',
    'amount',
    'description',
    'paymentId',
    'userId',
] as const) {}

