import { FixtureInvalidationReason, FixtureStatus } from '../../enums/fixture.enum';
import { NotificationType } from '../../enums/notification.enum';

const ABANDONED = new Set<FixtureStatus>([
    FixtureStatus.POSTPONED,
    FixtureStatus.CANCELLED,
    FixtureStatus.SUSPENDED,
]);

export function isAbandonedFixtureStatus(status: FixtureStatus | string | undefined): boolean {
    return status != null && ABANDONED.has(status as FixtureStatus);
}

/**
 * Run cascades only when the fixture newly enters (or switches between) abandoned states.
 * Reschedule (POSTPONED → SCHEDULED) does not auto-restore interest, attendance, or listings.
 */
export function shouldRunFixtureLifecycleCascade(
    previous: FixtureStatus | string | undefined,
    next: FixtureStatus | string | undefined,
): boolean {
    if (!isAbandonedFixtureStatus(next)) {
        return false;
    }
    return previous !== next;
}

export function toInvalidationReason(
    status: FixtureStatus | string,
): FixtureInvalidationReason | null {
    switch (status) {
        case FixtureStatus.POSTPONED:
            return FixtureInvalidationReason.POSTPONED;
        case FixtureStatus.CANCELLED:
            return FixtureInvalidationReason.CANCELLED;
        case FixtureStatus.SUSPENDED:
            return FixtureInvalidationReason.SUSPENDED;
        default:
            return null;
    }
}

export function notificationForAbandonedStatus(status: FixtureStatus | string): {
    type: NotificationType;
    title: string;
    message: string;
} {
    if (status === FixtureStatus.CANCELLED) {
        return {
            type: NotificationType.MATCH_CANCELLED,
            title: 'Match cancelled',
            message: 'A match you were following has been cancelled. Related ticket interest, listings, and holds have been cleared.',
        };
    }
    if (status === FixtureStatus.SUSPENDED) {
        return {
            type: NotificationType.MATCH_SUSPENDED,
            title: 'Match suspended',
            message: 'A match you were following has been suspended. Related ticket interest, listings, and holds have been cleared.',
        };
    }
    return {
        type: NotificationType.MATCH_POSTPONED,
        title: 'Match postponed',
        message: 'A match you were following has been postponed. Related ticket interest, listings, and holds have been cleared.',
    };
}
