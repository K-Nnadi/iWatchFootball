import axios from 'axios';

export interface MarketplaceTicket {
    id: number;
    category: string;
    price: number;
    fixtureId: number;
    /** "Home vs Away" from API when available */
    fixtureLabel?: string;
    /** Kick-off time ISO string */
    fixtureDate?: string;
    /** Venue name when linked fixture has a stadium */
    stadiumName?: string;
    metadata?: Record<string, unknown>;
}

export interface MarketplaceListing {
    id: number;
    ticketId: number;
    sellerId: number;
    askPrice: number;
    status: 'ACTIVE' | 'SOLD' | 'CANCELLED' | 'EXPIRED';
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    ticket?: MarketplaceTicket;
}

export interface FeePreview {
    askPrice: number;
    adminFee: number;
    adminFeeRate: number;
    totalBuyerPays: number;
}

export interface ListingsResponse {
    listings: MarketplaceListing[];
    total: number;
}

export type MarketplacePaymentMethod = 'CreditCard' | 'PayPal' | 'PlatformCredit';

export async function getActiveListings(params?: {
    fixtureId?: number;
    maxPrice?: number;
    /** Home or away team name substring */
    team?: string;
    page?: number;
}): Promise<ListingsResponse> {
    const { data } = await axios.get<ListingsResponse>('/marketplace/listings', {
        params,
    });
    return {
        listings: Array.isArray(data?.listings) ? data.listings : [],
        total: typeof data?.total === 'number' ? data.total : 0,
    };
}

export async function getListing(id: number): Promise<MarketplaceListing> {
    const { data } = await axios.get<MarketplaceListing>(`/marketplace/listings/${id}`);
    return data;
}

export async function getMyListings(): Promise<MarketplaceListing[]> {
    const { data } = await axios.get<MarketplaceListing[]>('/marketplace/listings/my');
    return data;
}

export async function createListing(body: {
    ticketId: number;
    askPrice: number;
}): Promise<MarketplaceListing> {
    const { data } = await axios.post<MarketplaceListing>('/marketplace/listings', body);
    return data;
}

export async function cancelListing(id: number): Promise<void> {
    await axios.delete(`/marketplace/listings/${id}`);
}

export async function holdListing(listingId: number): Promise<{ expiresAt: string; holderId: string; holdMinutes: number }> {
    const { data } = await axios.post<{ expiresAt: string; holderId: string; holdMinutes: number }>(
        `/marketplace/hold/${listingId}`,
    );
    return data;
}

export async function getFeePreview(listingId: number): Promise<FeePreview> {
    const { data } = await axios.get<FeePreview>(
        `/marketplace/listings/${listingId}/fee-preview`,
    );
    return data;
}

export async function confirmMarketplacePurchase(body: {
    listingId: number;
    holderId: string;
    paymentMethod: MarketplacePaymentMethod;
    paymentProviderId?: number;
    providerPaymentRef?: string;
    idempotencyKey?: string;
}): Promise<{ marketplaceTransactionId: number; ticketId: number }> {
    const { data } = await axios.post<{ marketplaceTransactionId: number; ticketId: number }>(
        '/marketplace/checkout/confirm',
        body,
    );
    return data;
}
