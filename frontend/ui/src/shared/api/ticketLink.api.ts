import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export type TicketLinkType =
    | 'OFFICIAL_CLUB'
    | 'COMPETITION'
    | 'AWAY_FANS'
    | 'TICKET_EXCHANGE'
    | 'HOSPITALITY'
    | 'HOSPITALITY_PARTNER'
    | 'MEMBERSHIP'
    | 'TRAVEL'
    | 'PARKING'
    | 'HOTEL'
    | 'MERCHANDISE'
    | 'STADIUM_TOUR'
    | 'APPROVED_PARTNER'
    | 'AFFILIATE';

export type TicketLinkCategory =
    | 'TICKETS'
    | 'HOSPITALITY'
    | 'MEMBERSHIP'
    | 'MATCHDAY_PLANNING'
    | 'SPONSORED';

export type AffiliateUrlFormat =
    | 'QUERY_PARAM'
    | 'PATH_SEGMENT'
    | 'SUBID'
    | 'REDIRECT_URL';

export interface SaleInfo {
    requiresMembership?: boolean;
    membershipName?: string;
    membersSaleDate?: string;
    generalSaleDate?: string;
    awayFanProcess?: string;
    notes?: string;
    lastVerified?: string;
}

export interface TicketLink {
    id: number;
    fixtureId?: number;
    teamId?: number;
    competitionId?: number;
    url: string;
    label: string;
    linkType: TicketLinkType;
    linkCategory: TicketLinkCategory;
    isAffiliate: boolean;
    isSponsored: boolean;
    sponsorLabel?: string;
    badgeText?: string;
    priority: number;
    expiresAt?: string;
    saleInfo?: SaleInfo;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTicketLinkPayload {
    fixtureId?: number;
    teamId?: number;
    competitionId?: number;
    url: string;
    label: string;
    linkType: TicketLinkType;
    linkCategory: TicketLinkCategory;
    isAffiliate: boolean;
    affiliateTag?: string;
    affiliateUrlFormat?: AffiliateUrlFormat;
    partnerId?: number;
    isSponsored?: boolean;
    sponsorLabel?: string;
    badgeText?: string;
    priority?: number;
    expiresAt?: string;
    saleInfo?: SaleInfo;
}

export interface UpdateTicketLinkPayload extends Partial<CreateTicketLinkPayload> {}

export async function queryTicketLinks(params: {
    fixtureId?: number;
    teamId?: number;
    competitionId?: number;
}): Promise<TicketLink[]> {
    const { data } = await axios.get<TicketLink[]>('/ticket-link/query', { params });
    return data;
}

export async function getTicketLink(id: number): Promise<TicketLink> {
    const { data } = await axios.get<TicketLink>(`/ticket-link/${id}`);
    return data;
}

export async function recordTicketLinkClick(
    id: number,
    opts?: { source?: 'WEB' | 'MOBILE'; fixtureId?: number },
): Promise<void> {
    const params: Record<string, string | number> = { source: opts?.source ?? 'WEB' };
    if (opts?.fixtureId) params.fixtureId = opts.fixtureId;
    await axios.post(`/ticket-link/${id}/click`, undefined, { params }).catch(() => {
        // fire-and-forget, swallow errors
    });
}

export async function adminListTicketLinks(): Promise<TicketLink[]> {
    const { data } = await axios.get<TicketLink[]>('/ticket-link');
    return data;
}

export async function adminCreateTicketLink(payload: CreateTicketLinkPayload): Promise<TicketLink> {
    const { data } = await axios.post<TicketLink>('/ticket-link', payload);
    return data;
}

export async function adminUpdateTicketLink(id: number, payload: UpdateTicketLinkPayload): Promise<TicketLink> {
    const { data } = await axios.patch<TicketLink>(`/ticket-link/${id}`, payload);
    return data;
}

export async function adminDeleteTicketLink(id: number): Promise<void> {
    await axios.delete(`/ticket-link/${id}`);
}

// ─── Affiliate Partner API ───────────────────────────────────────────────────

export type PartnerType =
    | 'TICKETING'
    | 'HOSPITALITY'
    | 'TRAVEL'
    | 'PARKING'
    | 'HOTEL'
    | 'MERCHANDISE'
    | 'GAMBLING'
    | 'OTHER';

export type PlacementType =
    | 'MATCH_PREVIEW'
    | 'ODDS_TAB'
    | 'STATS_SIDEBAR'
    | 'PREDICTIONS_PAGE'
    | 'NEWSLETTER';

export interface AffiliatePartner {
    id: number;
    name: string;
    partnerType: PartnerType;
    network?: string;
    defaultAffiliateTag?: string;
    affiliateUrlFormat?: AffiliateUrlFormat;
    commissionRatePercent?: number;
    isActive: boolean;
    campaignStartDate?: string;
    campaignEndDate?: string;
    notes?: string;
    minimumAge?: number;
    allowedCountries?: string[];
    blockedCountries?: string[];
    requiresUserConsent: boolean;
    requiresRGMessage: boolean;
    disclosureText?: string;
    allowedPlacements?: PlacementType[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateAffiliatePartnerPayload {
    name: string;
    partnerType?: PartnerType;
    network?: string;
    defaultAffiliateTag?: string;
    affiliateUrlFormat?: AffiliateUrlFormat;
    commissionRatePercent?: number;
    isActive?: boolean;
    campaignStartDate?: string;
    campaignEndDate?: string;
    notes?: string;
    minimumAge?: number;
    allowedCountries?: string[];
    blockedCountries?: string[];
    requiresUserConsent?: boolean;
    requiresRGMessage?: boolean;
    disclosureText?: string;
    allowedPlacements?: PlacementType[];
}

export async function adminListAffiliatePartners(): Promise<AffiliatePartner[]> {
    const { data } = await axios.get<AffiliatePartner[]>('/admin/affiliate-partners');
    return data;
}

export async function adminCreateAffiliatePartner(payload: CreateAffiliatePartnerPayload): Promise<AffiliatePartner> {
    const { data } = await axios.post<AffiliatePartner>('/admin/affiliate-partners', payload);
    return data;
}

export async function adminUpdateAffiliatePartner(
    id: number,
    payload: Partial<CreateAffiliatePartnerPayload>,
): Promise<AffiliatePartner> {
    const { data } = await axios.patch<AffiliatePartner>(`/admin/affiliate-partners/${id}`, payload);
    return data;
}

export async function adminDeleteAffiliatePartner(id: number): Promise<void> {
    await axios.delete(`/admin/affiliate-partners/${id}`);
}

export function useAffiliatePartners() {
    return useQuery({
        queryKey: ['admin', 'affiliate-partners'],
        queryFn: adminListAffiliatePartners,
    });
}

// ─── Analytics API ───────────────────────────────────────────────────────────

export interface TicketLinkAnalyticsSummary {
    totalClicks: number;
    clicksLast7Days: number;
    clicksLast30Days: number;
    totalConversions: number;
    activeLinks: number;
    affiliateLinks: number;
}

export interface ClicksByLink {
    ticketLinkId: number;
    label?: string;
    totalClicks: number;
    clicksLast7Days: number;
    clicksLast30Days: number;
}

export interface ClicksByFixture {
    fixtureId?: number;
    totalClicks: number;
}

export async function fetchAnalyticsSummary(): Promise<TicketLinkAnalyticsSummary> {
    const { data } = await axios.get<TicketLinkAnalyticsSummary>('/admin/ticket-link-analytics/summary');
    return data;
}

export async function fetchClicksByLink(): Promise<ClicksByLink[]> {
    const { data } = await axios.get<ClicksByLink[]>('/admin/ticket-link-analytics/by-link');
    return data;
}

export async function fetchClicksByFixture(): Promise<ClicksByFixture[]> {
    const { data } = await axios.get<ClicksByFixture[]>('/admin/ticket-link-analytics/by-fixture');
    return data;
}

export function useTicketLinkAnalytics() {
    const summary = useQuery({ queryKey: ['admin', 'tla', 'summary'], queryFn: fetchAnalyticsSummary });
    const byLink = useQuery({ queryKey: ['admin', 'tla', 'by-link'], queryFn: fetchClicksByLink });
    const byFixture = useQuery({ queryKey: ['admin', 'tla', 'by-fixture'], queryFn: fetchClicksByFixture });
    return { summary, byLink, byFixture };
}
