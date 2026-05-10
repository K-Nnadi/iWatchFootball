import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../ticket/ticket.entity';
import { TicketOwnershipHistoryModule } from '../ticketOwnershipHistory/ticketOwnershipHistory.module';
import { UserTicketLogModule } from '../userTicketLog/userTicketLog.module';
import { MarketplaceListing } from './marketplaceListing.entity';
import { MarketplaceListingController } from './marketplaceListing.controller';
import { MarketplaceListingService } from './marketplaceListing.service';

@Module({
    imports: [
        TicketOwnershipHistoryModule,
        UserTicketLogModule,
        TypeOrmModule.forFeature([MarketplaceListing, Ticket]),
    ],
    controllers: [MarketplaceListingController],
    providers: [MarketplaceListingService],
    exports: [MarketplaceListingService],
})
export class MarketplaceListingModule {}
