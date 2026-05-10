import { Module } from '@nestjs/common';
import { MarketplaceCheckoutModule } from '../marketplaceCheckout/marketplaceCheckout.module';
import { MarketplaceListingModule } from '../marketplaceListing/marketplaceListing.module';
import { UserTicketLogModule } from '../userTicketLog/userTicketLog.module';

@Module({
    imports: [
        MarketplaceListingModule,
        MarketplaceCheckoutModule,
        UserTicketLogModule,
    ],
})
export class MarketplaceModule {}
