export interface CheckoutTicketDetails {
    /** Marketplace: full match line for summary (e.g. "Arsenal vs Chelsea") */
    fixtureLabel?: string;

    matchId: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    price: number;
    competition?: string;
    section?: string;
    row?: string;
    fanSide?: 'Home' | 'Away' | 'Neutral';
    seatsTogether?: number;
    ticketType?: 'E-Ticket' | 'Print at Home';
    unrestrictedView?: boolean;
    quantity?: number;
    imageUrl?: string;
    /** Server-enforced hold (fixture id / offer key / session holder) */
    fixtureId?: number;
    offerKey?: string;
    holderId?: string;
    holdExpiresAt?: string;
    /** Stored on Ticket rows after purchase */
    category?: string;
    /** Marketplace listing fields — present only for resale purchases */
    listingId?: number;
    marketplaceHolderId?: string;
}

export interface PaymentProvider {
    id: number;
    name: string;
    slug: string;
    type: 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'CRYPTO' | 'CREDIT';
    logoUrl?: string;
    /** Only set for the platform credit option */
    creditBalance?: number;
    disabled?: boolean;
}

export interface UserDetails {
    email: string;
    confirmEmail: string;
    phone: string;
    phoneCountryCode: string;
    firstName: string;
    lastName: string;
    address: string;
    addressLine2: string;
    postcode: string;
    townCity: string;
    country: string;
    regionState: string;
    addressType: 'Personal' | 'Business';
}

export interface AdditionalInfo {
    agreeToTerms: boolean;
    agreeToMarketing: boolean;
}

export interface PaymentInfo {
    name: string;
    cardNumber: string;
    expiration: string;
    cvv: string;
    email: string;
}

export interface CheckoutErrors {
    email: string;
    confirmEmail: string;
    phone: string;
    firstName: string;
    lastName: string;
    address: string;
    postcode: string;
    townCity: string;
    country: string;
    name: string;
    cardNumber: string;
    expiration: string;
    cvv: string;
    agreeToTerms: string;
}

