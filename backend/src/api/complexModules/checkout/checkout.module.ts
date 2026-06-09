import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { Credit } from '../../modules/credit/credit.entity';
import { DiscountCodeModule } from '../../modules/discountCode/discountCode.module';
import { TicketOwnershipHistoryModule } from '../../modules/ticketOwnershipHistory/ticketOwnershipHistory.module';
import { UserTicketLogModule } from '../../modules/userTicketLog/userTicketLog.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { PrimaryOrderRefundService } from './primary-order-refund.service';
import { AuthModule } from '../../../auth/auth.module';
import { LogModule } from '../../modules/log/log.module';
import { PaymentSession } from '../../integrations/payments/entities/payment-session.entity';

/** Payment + ledger + Ticket rows. Pre-payment reservation lives in TicketHoldModule. */
@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([Credit, PaymentSession]),
        DiscountCodeModule,
        TicketOwnershipHistoryModule,
        UserTicketLogModule,
        LoyaltyModule,
        LogModule,
    ],
    controllers: [CheckoutController, PaymentWebhookController],
    providers: [CheckoutService, PrimaryOrderRefundService],
    exports: [CheckoutService],
})
export class CheckoutModule {}
