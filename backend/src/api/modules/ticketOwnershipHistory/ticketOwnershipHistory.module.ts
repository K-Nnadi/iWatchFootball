import { Module } from '@nestjs/common';
import { TicketOwnershipHistoryService } from './ticketOwnershipHistory.service';

@Module({
    providers: [TicketOwnershipHistoryService],
    exports: [TicketOwnershipHistoryService],
})
export class TicketOwnershipHistoryModule {}
