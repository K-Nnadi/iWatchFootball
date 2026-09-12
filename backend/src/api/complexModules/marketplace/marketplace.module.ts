import { Module } from '@nestjs/common';
import { MarketplaceCheckoutModule } from './checkout/marketplaceCheckout.module';
import { MarketplaceListingModule } from '../../modules/marketplaceListing/marketplaceListing.module';
import { UserTicketLogModule } from '../../modules/userTicketLog/userTicketLog.module';
import { MarketplacePayoutModule } from './marketplace-payout.module';

@Module({
    imports: [
        MarketplaceListingModule,
        MarketplaceCheckoutModule,
        MarketplacePayoutModule,
        UserTicketLogModule,
    ],
})
export class MarketplaceModule {}
