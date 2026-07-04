export const MARKETPLACE_FEES_CONFIG = {
    BUYER_FEE_RATE: 'marketplace_fee_rate',
    SELLER_FEE_RATE: 'marketplace_seller_fee_rate',
} as const;

export const MARKETPLACE_FEES_DEFAULTS = {
    BUYER_FEE_RATE: 0.10,
    SELLER_FEE_RATE: 0.05,
} as const;
