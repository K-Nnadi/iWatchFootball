import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { Credit } from '../credit/credit.entity';
import { DiscountCodeModule } from '../discountCode/discountCode.module';
import { TicketOwnershipHistoryModule } from '../ticketOwnershipHistory/ticketOwnershipHistory.module';
import { UserTicketLogModule } from '../userTicketLog/userTicketLog.module';
import { LoyaltyModule } from '../../services/loyalty/loyalty.module';
import { PrimaryOrderRefundService } from './primary-order-refund.service';
import { AuthModule } from '../../../auth/auth.module';

/** Payment + ledger + Ticket rows. Pre-payment reservation lives in TicketHoldModule. */
@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([Credit]),
        DiscountCodeModule,
        TicketOwnershipHistoryModule,
        UserTicketLogModule,
        LoyaltyModule,
    ],
    controllers: [CheckoutController, PaymentWebhookController],
    providers: [CheckoutService, PrimaryOrderRefundService],
    exports: [CheckoutService],
})
export class CheckoutModule {}
