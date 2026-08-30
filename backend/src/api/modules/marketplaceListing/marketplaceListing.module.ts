import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Ticket } from '../ticket/ticket.entity';
import { TicketOwnershipHistoryModule } from '../ticketOwnershipHistory/ticketOwnershipHistory.module';
import { UserTicketLogModule } from '../userTicketLog/userTicketLog.module';
import { MarketplaceFeatureModule } from '../../complexModules/marketplace/marketplace-feature.module';
import { NotificationModule } from '../notification/notification.module';
import { MarketplaceDispute } from '../marketplaceDispute/marketplaceDispute.entity';
import { MarketplaceListing } from './marketplaceListing.entity';
import { MarketplaceListingController } from './marketplaceListing.controller';
import { MarketplaceListingService } from './marketplaceListing.service';

@Module({
    imports: [
        MarketplaceFeatureModule,
        TicketOwnershipHistoryModule,
        UserTicketLogModule,
        NotificationModule,
        MulterModule.register({}),
        TypeOrmModule.forFeature([MarketplaceListing, Ticket, MarketplaceDispute]),
    ],
    controllers: [MarketplaceListingController],
    providers: [MarketplaceListingService],
    exports: [MarketplaceListingService],
})
export class MarketplaceListingModule {}
