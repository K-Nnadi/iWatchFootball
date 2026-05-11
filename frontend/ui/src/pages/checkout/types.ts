/** Router state passed to `/thank-you` after successful checkout (primary or resale). */
export interface ThankYouPageState {
    /** Fixture line — team names joined, or resale `fixtureLabel` */
    headline: string;
    /** Formatted kickoff — empty if unknown/unparseable */
    dateLine: string | null;
    stadium?: string;
}

export function buildThankYouPageState(
    details: CheckoutTicketDetails | null,
    listingHydrate?: { venue?: string; fixtureLabel?: string },
): ThankYouPageState {
    if (!details) {
        return { headline: 'Your tickets are confirmed.', dateLine: null };
    }
    const venue = (details.venue || listingHydrate?.venue)?.trim() || undefined;
    const fixtureLabel = (details.fixtureLabel || listingHydrate?.fixtureLabel)?.trim();

    const h = (details.homeTeam || '').trim();
    const a = (details.awayTeam || '').trim();
    const resalePlaceholder = h.toLowerCase() === 'resale listing' && !a;

    let headline: string;
    if (fixtureLabel && (resalePlaceholder || (!h && !a))) {
        headline = fixtureLabel;
    } else if (h && a) {
        headline = `${h} vs ${a}`;
    } else if (h || a) {
        headline = `${h} ${a}`.trim();
    } else {
        headline = fixtureLabel ?? 'Your tickets are confirmed.';
    }

    const rawDate = (details.date || '').trim();
    let dateLine: string | null = null;
    if (rawDate) {
        const d = new Date(rawDate);
        dateLine = Number.isNaN(d.getTime())
            ? rawDate
            : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }

    return { headline, dateLine, stadium: venue };
}

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
    /** Seller ask (excl. platform fee) — from fee preview */
    marketplaceSellerAskPrice?: number;
    /** Platform service fee (GBP) — from fee preview */
    marketplacePlatformFee?: number;
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

