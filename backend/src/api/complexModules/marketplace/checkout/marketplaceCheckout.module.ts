import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketHoldModule } from '../../../modules/ticketHold/ticketHold.module';
import { MarketplaceFeatureModule } from '../marketplace-feature.module';
import { PlatformConfigModule } from '../../../modules/platformConfig/platformConfig.module';
import { TicketOwnershipHistoryModule } from '../../../modules/ticketOwnershipHistory/ticketOwnershipHistory.module';
import { UserTicketLogModule } from '../../../modules/userTicketLog/userTicketLog.module';
import { MarketplaceListing } from '../../../modules/marketplaceListing/marketplaceListing.entity';
import { MarketplaceTransaction } from '../../../modules/marketplaceListing/marketplaceTransaction.entity';
import { MarketplaceCheckoutController } from './marketplaceCheckout.controller';
import { MarketplaceCheckoutService } from './marketplaceCheckout.service';
import { LoyaltyModule } from '../../loyalty/loyalty.module';
import { LogModule } from '../../../modules/log/log.module';

@Module({
    imports: [
        MarketplaceFeatureModule,
        TicketHoldModule,
        PlatformConfigModule,
        TicketOwnershipHistoryModule,
        UserTicketLogModule,
        LoyaltyModule,
        LogModule,
        TypeOrmModule.forFeature([MarketplaceListing, MarketplaceTransaction]),
    ],
    controllers: [MarketplaceCheckoutController],
    providers: [MarketplaceCheckoutService],
    exports: [MarketplaceCheckoutService],
})
export class MarketplaceCheckoutModule {}
