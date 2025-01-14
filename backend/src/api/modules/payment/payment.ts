import {Entity, OneToMany} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Ticket} from '../ticket/ticket';
import {
    EntityColumn,
    OptionalEntityColumn,
    EntityEnumColumn
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';
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

    /**
     * A payment can cover multiple tickets (especially if a user checks out multiple tickets)
     */
    @ApiProperty({description: 'List of tickets covered by this payment'})
    @OneToMany(() => Ticket, (ticket) => ticket.payment)
    tickets!: Ticket[];
}

export class CreatePaymentDTO extends PickType(Payment, [
    'method',
    'status',
    'amount',
] as const) {}
