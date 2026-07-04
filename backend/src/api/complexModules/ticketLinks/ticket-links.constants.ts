/** Platform config keys for ticket links (see platformConfig table). */
export const TICKET_LINKS_CONFIG = {
    ENABLED: 'ticket_links_enabled',
    AFFILIATE_ENABLED: 'affiliate_links_enabled',
    MATCHDAY_AFFILIATES_ENABLED: 'matchday_affiliates_enabled',
    HOSPITALITY_ENABLED: 'hospitality_links_enabled',
    SPONSORED_PLACEMENTS_ENABLED: 'sponsored_placements_enabled',
    TICKET_ALERTS_ENABLED: 'ticket_alerts_enabled',
    AFFILIATE_DISCLOSURE_ENABLED: 'affiliate_disclosure_enabled',
} as const;

export const TICKET_LINKS_DEFAULTS = {
    ENABLED: false,
    AFFILIATE_ENABLED: false,
    MATCHDAY_AFFILIATES_ENABLED: false,
    HOSPITALITY_ENABLED: false,
    SPONSORED_PLACEMENTS_ENABLED: false,
    TICKET_ALERTS_ENABLED: false,
    AFFILIATE_DISCLOSURE_ENABLED: true,
} as const;
