import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketHoldModule } from '../ticketHold/ticketHold.module';
import { PlatformConfigModule } from '../platformConfig/platformConfig.module';
import { TicketOwnershipHistoryModule } from '../ticketOwnershipHistory/ticketOwnershipHistory.module';
import { UserTicketLogModule } from '../userTicketLog/userTicketLog.module';
import { MarketplaceListing } from '../marketplaceListing/marketplaceListing.entity';
import { MarketplaceTransaction } from '../marketplaceListing/marketplaceTransaction.entity';
import { MarketplaceCheckoutController } from './marketplaceCheckout.controller';
import { MarketplaceCheckoutService } from './marketplaceCheckout.service';
import { LoyaltyModule } from '../../services/loyalty/loyalty.module';

@Module({
    imports: [
        TicketHoldModule,
        PlatformConfigModule,
        TicketOwnershipHistoryModule,
        UserTicketLogModule,
        LoyaltyModule,
        TypeOrmModule.forFeature([MarketplaceListing, MarketplaceTransaction]),
    ],
    controllers: [MarketplaceCheckoutController],
    providers: [MarketplaceCheckoutService],
    exports: [MarketplaceCheckoutService],
})
export class MarketplaceCheckoutModule {}
