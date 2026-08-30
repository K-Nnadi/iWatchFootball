/** Lifecycle state of a platform-managed ticket row (one row = one seat). */
export enum TicketStatus {
    AVAILABLE = 'AVAILABLE',
    LISTED = 'LISTED',
    SOLD = 'SOLD',
    TRANSFERRED = 'TRANSFERRED',
}

/** How the ticket entered the user's custody. */
export enum TicketSource {
    PRIMARY = 'PRIMARY',
    RESALE = 'RESALE',
    EXTERNAL = 'EXTERNAL',
}
