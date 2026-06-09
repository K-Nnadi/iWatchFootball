/** Platform config keys for marketplace (see platformConfig table). */
export const MARKETPLACE_CONFIG = {
    ENABLED: 'marketplace_enabled',
    FEE_RATE: 'marketplace_fee_rate',
} as const;

export const MARKETPLACE_DEFAULTS = {
    ENABLED: false,
    FEE_RATE: 0.1,
} as const;
