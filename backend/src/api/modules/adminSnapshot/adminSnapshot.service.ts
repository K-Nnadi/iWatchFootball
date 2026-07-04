import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fixture } from '../fixture/fixture.entity';
import { AttendanceRecord } from '../attendanceRecord/attendanceRecord.entity';
import { TicketLink } from '../ticketLink/ticketLink.entity';
import { TicketLinkClick } from '../ticketLink/ticketLinkClick.entity';
import { MarketplaceListing } from '../marketplaceListing/marketplaceListing.entity';
import { TicketInterest } from '../ticketInterest/ticketInterest.entity';
import { FixtureHighlight } from '../fixtureHighlight/fixtureHighlight.entity';
import { FixtureStatus } from '../../enums/fixture.enum';
import { MarketplaceListingStatus } from '../../enums/marketplace.enum';

export interface AdminSnapshotDto {
    fixtures: {
        total: number;
        scheduled: number;
        live: number;
        completed: number;
        postponedOrCancelled: number;
    };
    attendance: {
        totalRecords: number;
        withTicket: number;
    };
    ticketLinks: {
        active: number;
        clicks: number;
    };
    marketplace: {
        active: number;
        sold: number;
        pendingReview: number;
    };
    community: {
        ticketDemandSignals: number;
        highlights: number;
    };
}

@Injectable()
export class AdminSnapshotService {
    constructor(
        @InjectRepository(Fixture)
        private readonly fixtureRepo: Repository<Fixture>,
        @InjectRepository(AttendanceRecord)
        private readonly attendanceRepo: Repository<AttendanceRecord>,
        @InjectRepository(TicketLink)
        private readonly ticketLinkRepo: Repository<TicketLink>,
        @InjectRepository(TicketLinkClick)
        private readonly ticketLinkClickRepo: Repository<TicketLinkClick>,
        @InjectRepository(MarketplaceListing)
        private readonly listingRepo: Repository<MarketplaceListing>,
        @InjectRepository(TicketInterest)
        private readonly interestRepo: Repository<TicketInterest>,
        @InjectRepository(FixtureHighlight)
        private readonly highlightRepo: Repository<FixtureHighlight>,
    ) {}

    async getSnapshot(): Promise<AdminSnapshotDto> {
        const [
            fixtureTotal,
            fixtureScheduled,
            fixtureLive,
            fixtureCompleted,
            fixturePostponedOrCancelled,
            attendanceTotal,
            attendanceWithTicket,
            ticketLinkActive,
            ticketLinkClicks,
            listingActive,
            listingSold,
            listingPendingReview,
            demandSignals,
            highlights,
        ] = await Promise.all([
            this.fixtureRepo.count(),
            this.fixtureRepo.count({ where: { status: FixtureStatus.SCHEDULED } }),
            this.fixtureRepo.count({ where: { status: FixtureStatus.LIVE } }),
            this.fixtureRepo.count({ where: { status: FixtureStatus.COMPLETED } }),
            this.fixtureRepo
                .createQueryBuilder('f')
                .where('f.status IN (:...statuses)', {
                    statuses: [FixtureStatus.POSTPONED, FixtureStatus.CANCELLED, FixtureStatus.SUSPENDED],
                })
                .andWhere('f.deletedAt IS NULL')
                .getCount(),
            this.attendanceRepo.count(),
            this.attendanceRepo.count({ where: { hasTicket: true } }),
            this.ticketLinkRepo.count(),
            this.ticketLinkClickRepo.count(),
            this.listingRepo.count({ where: { status: MarketplaceListingStatus.ACTIVE } }),
            this.listingRepo.count({ where: { status: MarketplaceListingStatus.SOLD } }),
            this.listingRepo.count({ where: { status: MarketplaceListingStatus.PENDING_REVIEW } }),
            this.interestRepo.count(),
            this.highlightRepo.count(),
        ]);

        return {
            fixtures: {
                total: fixtureTotal,
                scheduled: fixtureScheduled,
                live: fixtureLive,
                completed: fixtureCompleted,
                postponedOrCancelled: fixturePostponedOrCancelled,
            },
            attendance: {
                totalRecords: attendanceTotal,
                withTicket: attendanceWithTicket,
            },
            ticketLinks: {
                active: ticketLinkActive,
                clicks: ticketLinkClicks,
            },
            marketplace: {
                active: listingActive,
                sold: listingSold,
                pendingReview: listingPendingReview,
            },
            community: {
                ticketDemandSignals: demandSignals,
                highlights,
            },
        };
    }
}
