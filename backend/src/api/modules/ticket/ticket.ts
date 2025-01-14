import {Entity, ManyToOne} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {Fixture} from '../fixture/fixture';
import {Payment} from '../payment/payment';
import {User} from '../user/user';
import {
    EntityColumn,
    OptionalEntityColumn,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import {ApiProperty, ApiPropertyOptional, PickType} from '@nestjs/swagger';

@Entity('ticket')
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

    @ApiProperty()
    @ManyToOne(() => Fixture, (fixture) => fixture.id, {nullable: false})
    fixture!: Fixture;

    /**
     * Optional user who has purchased this ticket
     */
    @OptionalEntityColumn({db: {type: 'int'},})
    userId?: number;

    @ApiPropertyOptional({nullable: true})
    @ManyToOne(() => User, (user) => user.id, {nullable: true})
    user?: User;

    /**
     * Optional Payment information if ticket is purchased
     */
    @OptionalEntityColumn({
        db: {type: 'int'}
    })
    paymentId?: number;

    @ApiPropertyOptional({nullable: true})
    @ManyToOne(() => Payment, (payment) => payment.tickets, {nullable: true})
    payment?: Payment;
}

export class CreateTicketDTO extends PickType(Ticket, [
    'category',
    'price',
    'fixtureId',
] as const) {
    @ApiPropertyOptional({ description: 'User ID if purchased', example: 42 })
    userId?: number;

    @ApiPropertyOptional({ description: 'Payment ID if purchased', example: 84 })
    paymentId?: number;
}