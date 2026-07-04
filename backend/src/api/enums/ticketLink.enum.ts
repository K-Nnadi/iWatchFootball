export enum TicketLinkType {
    // Tickets
    OFFICIAL_CLUB = 'OFFICIAL_CLUB',
    COMPETITION = 'COMPETITION',
    AWAY_FANS = 'AWAY_FANS',
    TICKET_EXCHANGE = 'TICKET_EXCHANGE',
    // Hospitality
    HOSPITALITY = 'HOSPITALITY',
    HOSPITALITY_PARTNER = 'HOSPITALITY_PARTNER',
    // Membership
    MEMBERSHIP = 'MEMBERSHIP',
    // Matchday planning
    TRAVEL = 'TRAVEL',
    PARKING = 'PARKING',
    HOTEL = 'HOTEL',
    MERCHANDISE = 'MERCHANDISE',
    STADIUM_TOUR = 'STADIUM_TOUR',
    // Generic / legacy
    APPROVED_PARTNER = 'APPROVED_PARTNER',
    AFFILIATE = 'AFFILIATE',
}

export enum TicketLinkCategory {
    TICKETS = 'TICKETS',
    HOSPITALITY = 'HOSPITALITY',
    MEMBERSHIP = 'MEMBERSHIP',
    MATCHDAY_PLANNING = 'MATCHDAY_PLANNING',
    SPONSORED = 'SPONSORED',
}

export enum AffiliateUrlFormat {
    /** Append affiliateTag as a raw query string: url?affiliateTag or url&affiliateTag */
    QUERY_PARAM = 'QUERY_PARAM',
    /** Append affiliateTag as a URL path segment, e.g. url/r/iwf */
    PATH_SEGMENT = 'PATH_SEGMENT',
    /** Append affiliateTag as a subid query param: url?subid=affiliateTag */
    SUBID = 'SUBID',
    /** affiliateTag is a redirect template URL; replace {url} with encoded target */
    REDIRECT_URL = 'REDIRECT_URL',
}

export type ClickSource = 'WEB' | 'MOBILE';
