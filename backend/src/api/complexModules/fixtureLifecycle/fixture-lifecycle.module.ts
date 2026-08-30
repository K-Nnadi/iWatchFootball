import { Module } from '@nestjs/common';
import { TicketInterestModule } from '../../modules/ticketInterest/ticketInterest.module';
import { AttendanceRecordModule } from '../../modules/attendanceRecord/attendanceRecord.module';
import { MarketplaceListingModule } from '../../modules/marketplaceListing/marketplaceListing.module';
import { TicketHoldModule } from '../../modules/ticketHold/ticketHold.module';
import { NotificationModule } from '../../modules/notification/notification.module';
import { FixtureLifecycleService } from './fixture-lifecycle.service';

@Module({
    imports: [
        TicketInterestModule,
        AttendanceRecordModule,
        MarketplaceListingModule,
        TicketHoldModule,
        NotificationModule,
    ],
    providers: [FixtureLifecycleService],
    exports: [FixtureLifecycleService],
})
export class FixtureLifecycleModule {}
