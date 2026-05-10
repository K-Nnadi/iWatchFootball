import { Entity } from 'typeorm';
import { BaseDbEntity } from '@iWatchFootball/base-tools/entity/baseDb.entity';
import { MarketplaceListing } from './marketplaceListing.entity';
import { User } from '../user/user.entity';
import { Payment } from '../payment/payment.entity';
import { Credit } from '../credit/credit.entity';
import {
    EntityColumn,
    EntityRelation,
    OptionalEntityColumn,
    RelationshipType,
} from '@iWatchFootball/base-tools/decorators/entity.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('marketplaceTransaction')
export class MarketplaceTransaction extends BaseDbEntity {
    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    listingId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => MarketplaceListing,
        joinOptions: { name: 'listingId' },
        description: 'The listing that was sold',
    })
    listing!: MarketplaceListing;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    buyerId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => User,
        joinOptions: { name: 'buyerId' },
        description: 'User who purchased the ticket',
    })
    buyer!: User;

    @EntityColumn({ db: { type: 'int' } })
    @ApiProperty()
    buyerPaymentId!: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Payment,
        joinOptions: { name: 'buyerPaymentId' },
        description: 'Payment made by the buyer',
    })
    buyerPayment!: Payment;

    @EntityColumn({ db: { type: 'decimal', precision: 10, scale: 2 } })
    @ApiProperty({ description: 'Seller ask price (what seller receives as credit)' })
    salePrice!: number;

    @EntityColumn({ db: { type: 'decimal', precision: 10, scale: 2 } })
    @ApiProperty({ description: 'Admin fee charged on top of ask price' })
    adminFee!: number;

    @EntityColumn({ db: { type: 'decimal', precision: 5, scale: 4 } })
    @ApiProperty({ description: 'Fee rate at the time of sale (e.g. 0.1000 = 10%)' })
    adminFeeRate!: number;

    @OptionalEntityColumn({ db: { type: 'int' } })
    @ApiPropertyOptional({ description: 'Credit record updated for the seller' })
    sellerCreditId?: number;

    @EntityRelation({
        type: RelationshipType.MANY_TO_ONE,
        entity: () => Credit,
        joinOptions: { name: 'sellerCreditId' },
        description: 'Credit record credited to the seller',
    })
    sellerCredit?: Credit;
}
