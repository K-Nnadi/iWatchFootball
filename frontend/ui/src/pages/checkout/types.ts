export interface CheckoutTicketDetails {
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
}

export interface PaymentProvider {
    id: number;
    name: string;
    slug: string;
    type: 'CARD' | 'WALLET' | 'BANK_TRANSFER' | 'CRYPTO';
    logoUrl?: string;
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

