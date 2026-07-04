export enum MarketplaceListingStatus {
    DRAFT = 'DRAFT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    ACTIVE = 'ACTIVE',
    REJECTED = 'REJECTED',
    SOLD = 'SOLD',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

export enum TicketType {
    PHYSICAL = 'PHYSICAL',
    PDF = 'PDF',
    MOBILE_APP = 'MOBILE_APP',
    CLUB_TRANSFER = 'CLUB_TRANSFER',
}

export enum DeliveryMethod {
    EMAIL_PDF = 'EMAIL_PDF',
    CLUB_APP_TRANSFER = 'CLUB_APP_TRANSFER',
    PHYSICAL_POST = 'PHYSICAL_POST',
    IN_PERSON = 'IN_PERSON',
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
    /** Listing rejected by admin — ticket returned to seller */
    MARKETPLACE_REJECTED = 'MARKETPLACE_REJECTED',
}

export enum DisputeStatus {
    OPEN = 'OPEN',
    RESOLVED_BUYER = 'RESOLVED_BUYER',
    RESOLVED_SELLER = 'RESOLVED_SELLER',
    ESCALATED = 'ESCALATED',
}
