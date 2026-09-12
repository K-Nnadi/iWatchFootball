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
    buyerId?: number;
    askPrice: number;
    status: 'ACTIVE' | 'SOLD' | 'CANCELLED' | 'EXPIRED';
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
    transferInitiatedAt?: string | null;
    receiptConfirmedAt?: string | null;
    ticket?: MarketplaceTicket;
}

export interface FeePreview {
    askPrice: number;
    adminFee: number;
    adminFeeRate: number;
    totalBuyerPays: number;
    sellerFeeRate?: number;
    sellerNetPayout?: number;
    escrowHeld?: boolean;
}

export interface SellerConnectStatus {
    configured: boolean;
    stripeConnectAccountId: string | null;
    onboardingComplete: boolean;
    payoutsEnabled: boolean;
    canList: boolean;
}

export interface SellerPayoutEstimate {
    grossAmount: number;
    platformFee: number;
    netPayout: number;
}

export interface EscrowHoldView {
    id: number;
    marketplaceTransactionId: number;
    amount: number;
    currency: string;
    status: 'HELD' | 'RELEASED' | 'REFUNDED';
    heldAt: string;
    releasedAt?: string | null;
    refundedAt?: string | null;
}

export interface UserTrustSummary {
    userId: number;
    averageRating: number;
    totalTransactions: number;
    trustScore: number;
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
    paymentProcessorId?: number;
    providerPaymentRef?: string;
    idempotencyKey?: string;
}): Promise<{ marketplaceTransactionId: number; ticketId: number }> {
    const { data } = await axios.post<{ marketplaceTransactionId: number; ticketId: number }>(
        '/marketplace/checkout/confirm',
        body,
    );
    return data;
}

export async function getMarketplaceFees(): Promise<{ buyerFeeRate: number; sellerFeeRate: number }> {
    const { data } = await axios.get<{ buyerFeeRate: number; sellerFeeRate: number }>('/marketplace/fees');
    return data;
}

export async function getSellerPayoutPreview(askPrice: number): Promise<SellerPayoutEstimate> {
    const { data } = await axios.get<SellerPayoutEstimate>('/marketplace/fees/payout-preview', {
        params: { askPrice },
    });
    return data;
}

export async function getSellerConnectStatus(): Promise<SellerConnectStatus> {
    const { data } = await axios.get<SellerConnectStatus>('/seller/connect/status');
    return data;
}

export async function startSellerConnectOnboarding(): Promise<{ url: string }> {
    const { data } = await axios.post<{ url: string }>('/seller/connect/onboard');
    return data;
}

export async function getListingEscrow(listingId: number): Promise<EscrowHoldView | null> {
    const { data } = await axios.get<EscrowHoldView | null>(`/marketplace/listings/${listingId}/escrow`);
    return data;
}

export async function refundMarketplaceEscrow(transactionId: number): Promise<EscrowHoldView> {
    const { data } = await axios.post<EscrowHoldView>(`/marketplace/payments/refund/${transactionId}`);
    return data;
}

export async function confirmListingTransfer(listingId: number): Promise<void> {
    await axios.post(`/marketplace/listings/${listingId}/confirm-transfer`);
}

export async function getUserTrustSummary(userId: number): Promise<UserTrustSummary> {
    const { data } = await axios.get<UserTrustSummary>(`/ratings/${userId}/summary`);
    return data;
}

export async function getMyListingRating(listingId: number): Promise<{ score: number } | null> {
    const { data } = await axios.get<{ score: number } | null>(`/ratings/listing/${listingId}`);
    return data;
}

export async function submitListingRating(body: {
    listingId: number;
    targetUserId: number;
    raterRole: 'BUYER' | 'SELLER';
    score: number;
    comment?: string;
}): Promise<void> {
    await axios.post('/ratings', body);
}
