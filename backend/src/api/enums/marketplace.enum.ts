export enum MarketplaceListingStatus {
    ACTIVE = 'ACTIVE',
    SOLD = 'SOLD',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

export enum TicketTransferReason {
    /** Original purchase from the platform (primary market) */
    PRIMARY_PURCHASE = 'PRIMARY_PURCHASE',
    /** Ticket transferred to platform custody when a resale listing is created */
    MARKETPLACE_LISTED = 'MARKETPLACE_LISTED',
    /** Ticket transferred to buyer when a resale listing is sold */
    MARKETPLACE_SOLD = 'MARKETPLACE_SOLD',
    /** Ticket returned to seller when a listing is cancelled */
    MARKETPLACE_CANCELLED = 'MARKETPLACE_CANCELLED',
    /** Ticket returned to seller when a listing expires before kick-off */
    MARKETPLACE_EXPIRED = 'MARKETPLACE_EXPIRED',
}
