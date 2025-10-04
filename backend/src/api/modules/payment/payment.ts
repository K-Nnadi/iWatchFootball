import {Entity} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Ticket} from '../ticket/ticket';
import {
    EntityColumn,
    EntityEnumColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {PickType} from '@nestjs/swagger';
import {PaymentMethod} from "../../enums/payment.enum";

@Entity('payment')
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

    @EntityRelation({
        type: RelationshipType.ONE_TO_MANY,
        entity: () => Ticket,
        inverseSide: (ticket: Ticket) => ticket.payment, // Ensure this matches `Ticket.payment`
    })
    tickets!: Ticket[];
}

export class CreatePaymentDTO extends PickType(Payment, [
    'method',
    'status',
    'amount',
    'metadata'
] as const) {}
