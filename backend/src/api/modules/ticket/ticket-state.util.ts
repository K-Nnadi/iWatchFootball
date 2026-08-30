import { TicketSource, TicketStatus } from '../../enums/ticket.enum';

/** Ticket row after primary-market purchase or return from cancelled/expired listing. */
export function ticketAvailableInWallet(source: TicketSource = TicketSource.PRIMARY) {
    return {
        status: TicketStatus.AVAILABLE,
        source,
        activeListingId: null as number | null,
    };
}

/** Ticket row while held in platform custody for an active marketplace listing. */
export function ticketListedState(listingId: number) {
    return {
        status: TicketStatus.LISTED,
        activeListingId: listingId,
        userId: null as null,
    };
}

/** Ticket row after a completed marketplace sale to the buyer. */
export function ticketAfterResalePurchase(buyerId: number) {
    return {
        status: TicketStatus.AVAILABLE,
        source: TicketSource.RESALE,
        activeListingId: null as number | null,
        userId: buyerId,
    };
}
