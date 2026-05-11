import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketOwnershipHistory } from './ticketOwnershipHistory.entity';
import { TicketOwnershipHistoryService } from './ticketOwnershipHistory.service';

@Module({
    imports: [TypeOrmModule.forFeature([TicketOwnershipHistory])],
    providers: [TicketOwnershipHistoryService],
    exports: [TicketOwnershipHistoryService],
})
export class TicketOwnershipHistoryModule {}
