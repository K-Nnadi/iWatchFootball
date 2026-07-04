import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketInterest } from './ticketInterest.entity';
import { TicketInterestService } from './ticketInterest.service';
import { TicketInterestController } from './ticketInterest.controller';
import { TicketDemandFeatureModule } from '../../complexModules/ticketDemand/ticket-demand-feature.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TicketInterest]),
        TicketDemandFeatureModule,
        NotificationModule,
    ],
    controllers: [TicketInterestController],
    providers: [TicketInterestService],
    exports: [TicketInterestService],
})
export class TicketInterestModule {}
