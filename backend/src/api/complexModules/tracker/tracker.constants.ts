/** Platform config keys for tracker freemium (see platformConfig table). */
export const TRACKER_CONFIG = {
    FREE_VERIFIED_LIMIT: 'tracker_free_verified_limit',
    FREE_UNVERIFIED_LIMIT: 'tracker_free_unverified_limit',
    STRIPE_PREMIUM_MONTHLY_PRICE_ID: 'stripe_premium_monthly_price_id',
} as const;

export const TRACKER_DEFAULTS = {
    FREE_VERIFIED_LIMIT: 5,
    FREE_UNVERIFIED_LIMIT: 10,
} as const;
