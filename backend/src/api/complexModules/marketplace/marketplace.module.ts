import { Module } from '@nestjs/common';
import { MarketplaceCheckoutModule } from './checkout/marketplaceCheckout.module';
import { MarketplaceListingModule } from '../../modules/marketplaceListing/marketplaceListing.module';
import { UserTicketLogModule } from '../../modules/userTicketLog/userTicketLog.module';

@Module({
    imports: [
        MarketplaceListingModule,
        MarketplaceCheckoutModule,
        UserTicketLogModule,
    ],
})
export class MarketplaceModule {}
