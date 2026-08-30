import { Injectable, Logger } from '@nestjs/common';
import { FixtureStatus } from '../../enums/fixture.enum';
import { TicketInterestService } from '../../modules/ticketInterest/ticketInterest.service';
import { AttendanceService } from '../../modules/attendanceRecord/attendanceRecord.service';
import { MarketplaceListingService } from '../../modules/marketplaceListing/marketplaceListing.service';
import { TicketHoldService } from '../../modules/ticketHold/ticketHold.service';
import { NotificationService } from '../../modules/notification/notification.service';
import {
    notificationForAbandonedStatus,
    shouldRunFixtureLifecycleCascade,
    toInvalidationReason,
} from './fixture-lifecycle.rules';

export type FixtureLifecycleResult = {
    ran: boolean;
    interestsCancelled: number;
    attendanceFlagged: number;
    listingsExpired: number;
    holdsReleased: number;
    notified: number;
};

@Injectable()
export class FixtureLifecycleService {
    private readonly logger = new Logger(FixtureLifecycleService.name);

    constructor(
        private readonly ticketInterestService: TicketInterestService,
        private readonly attendanceService: AttendanceService,
        private readonly marketplaceListingService: MarketplaceListingService,
        private readonly ticketHoldService: TicketHoldService,
        private readonly notificationService: NotificationService,
    ) {}

    /**
     * Apply the documented state machine when a fixture is postponed, cancelled, or suspended.
     * Safe to call on every fixture update — no-ops when status is unchanged or not abandoned.
     */
    async onStatusChange(
        fixtureId: number,
        previousStatus: FixtureStatus | string | undefined,
        nextStatus: FixtureStatus | string | undefined,
    ): Promise<FixtureLifecycleResult> {
        const empty: FixtureLifecycleResult = {
            ran: false,
            interestsCancelled: 0,
            attendanceFlagged: 0,
            listingsExpired: 0,
            holdsReleased: 0,
            notified: 0,
        };

        if (!shouldRunFixtureLifecycleCascade(previousStatus, nextStatus) || nextStatus == null) {
            return empty;
        }

        const reason = toInvalidationReason(nextStatus);
        if (!reason) {
            return empty;
        }

        this.logger.log(
            `Fixture ${fixtureId} ${String(previousStatus)} → ${String(nextStatus)}; running lifecycle cascade`,
        );

        const [interests, attendance, listings, holdsReleased] = await Promise.all([
            this.ticketInterestService.cancelAllForFixture(fixtureId),
            this.attendanceService.flagForFixtureLifecycle(fixtureId, reason),
            this.marketplaceListingService.expireListingsForFixture(fixtureId),
            this.ticketHoldService.releaseAllForFixture(fixtureId),
        ]);

        const userIds = new Set<number>([
            ...interests.userIds,
            ...attendance.userIds,
            ...listings.sellerIds,
        ]);

        const copy = notificationForAbandonedStatus(nextStatus);
        let notified = 0;
        for (const userId of userIds) {
            try {
                await this.notificationService.createIfAllowed({
                    userId,
                    type: copy.type,
                    title: copy.title,
                    message: copy.message,
                    metadata: { fixtureId, previousStatus, nextStatus },
                });
                notified += 1;
            } catch (err) {
                this.logger.warn(
                    `Failed to notify user ${userId} for fixture ${fixtureId}: ${err instanceof Error ? err.message : err}`,
                );
            }
        }

        const result: FixtureLifecycleResult = {
            ran: true,
            interestsCancelled: interests.cancelled,
            attendanceFlagged: attendance.flagged,
            listingsExpired: listings.expired,
            holdsReleased,
            notified,
        };
        this.logger.log(`Fixture ${fixtureId} cascade: ${JSON.stringify(result)}`);
        return result;
    }
}
