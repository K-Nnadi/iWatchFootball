import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketHold } from './ticketHold.entity';
import { TicketHoldService } from './ticketHold.service';
import { TicketHoldController } from './ticketHold.controller';
import { PlatformConfigModule } from '../platformConfig/platformConfig.module';

@Module({
    imports: [TypeOrmModule.forFeature([TicketHold]), PlatformConfigModule],
    controllers: [TicketHoldController],
    providers: [TicketHoldService],
    exports: [TicketHoldService],
})
export class TicketHoldModule {}
