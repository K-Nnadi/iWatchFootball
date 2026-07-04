import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fixture } from '../fixture/fixture.entity';
import { AttendanceRecord } from '../attendanceRecord/attendanceRecord.entity';
import { TicketLink } from '../ticketLink/ticketLink.entity';
import { TicketLinkClick } from '../ticketLink/ticketLinkClick.entity';
import { MarketplaceListing } from '../marketplaceListing/marketplaceListing.entity';
import { TicketInterest } from '../ticketInterest/ticketInterest.entity';
import { FixtureHighlight } from '../fixtureHighlight/fixtureHighlight.entity';
import { AdminSnapshotService } from './adminSnapshot.service';
import { AdminSnapshotController } from './adminSnapshot.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Fixture,
            AttendanceRecord,
            TicketLink,
            TicketLinkClick,
            MarketplaceListing,
            TicketInterest,
            FixtureHighlight,
        ]),
    ],
    controllers: [AdminSnapshotController],
    providers: [AdminSnapshotService],
})
export class AdminSnapshotModule {}
