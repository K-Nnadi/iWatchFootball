import axios from 'axios';

export interface TrackerEntitlements {
    plan: 'free' | 'premium';
    isPremium: boolean;
    freeVerifiedLimit: number;
    verifiedTotal: number;
    verifiedVisible: number;
    verifiedHidden: number;
    upgradeRequired: boolean;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
}

export interface LogHistoryEntry {
    id: number;
    userId: number;
    fixtureId: number;
    ticketNumber?: string;
    isVerified: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LogHistoryResponse {
    logs: LogHistoryEntry[];
    entitlements: TrackerEntitlements;
}

export interface SubscriptionEntitlements {
    plan: 'free' | 'premium';
    isPremium: boolean;
    freeVerifiedLimit: number;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd: boolean;
    status: string;
    checkoutAvailable?: boolean;
    checkoutUnavailableReason?: string;
}

export function extractApiErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string | string[] } | undefined;
        const msg = data?.message;
        if (typeof msg === 'string' && msg.length > 0) return msg;
        if (Array.isArray(msg) && msg.length > 0) return msg.join(', ');
        if (err.response?.status === 503) {
            return 'Premium checkout is not configured on the server yet.';
        }
    }
    if (err instanceof Error) return err.message;
    return 'Something went wrong';
}

export async function getMyLogHistory(): Promise<LogHistoryResponse> {
    const { data } = await axios.get<LogHistoryResponse>('/log/my-history');
    return data;
}

export async function getSubscriptionEntitlements(): Promise<SubscriptionEntitlements> {
    const { data } = await axios.get<SubscriptionEntitlements>('/subscriptions/entitlements');
    return data;
}

export async function createPremiumCheckout(successUrl: string, cancelUrl: string): Promise<{ url: string }> {
    const { data } = await axios.post<{ url: string }>('/subscriptions/checkout', {
        successUrl,
        cancelUrl,
    });
    return data;
}

export async function openSubscriptionPortal(returnUrl: string): Promise<{ url: string }> {
    const { data } = await axios.post<{ url: string }>('/subscriptions/portal', { returnUrl });
    return data;
}

export type TrackerVisibility = 'PRIVATE' | 'FRIENDS' | 'PUBLIC';

export interface PublicUserSummary {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    favouriteTeamId?: number;
}

export interface FriendListItem extends PublicUserSummary {
    connectionId: number;
    friendsSince: string;
}

export interface PendingFriendRequest {
    connectionId: number;
    user: PublicUserSummary;
    direction: 'incoming' | 'outgoing';
    requestedAt: string;
}

export interface FriendsListResponse {
    friends: FriendListItem[];
    pending: PendingFriendRequest[];
}

export interface TrackerSummary {
    totalMatches: number;
    verifiedMatches: number;
    uniqueStadiums: number;
    uniqueTeams: number;
    uniqueCompetitions: number;
}

export interface OverlapFixture {
    fixtureId: number;
    date: string;
    homeTeamId: number;
    awayTeamId: number;
    homeTeamName: string | null;
    awayTeamName: string | null;
    competitionId: number | null;
}

export interface CompareResult {
    me: PublicUserSummary & { stats: TrackerSummary };
    friend: PublicUserSummary & { stats: TrackerSummary };
    winners: Partial<Record<keyof TrackerSummary, 'me' | 'friend' | 'tie'>>;
    overlap: { count: number; fixtures: OverlapFixture[] };
    requiresPremium: boolean;
}

export interface TrackerPrivacySettings {
    trackerVisibility: TrackerVisibility;
    shareVerifiedOnly: boolean;
}

export async function getFriendsList(): Promise<FriendsListResponse> {
    const { data } = await axios.get<FriendsListResponse>('/social/friends');
    return data;
}

export async function searchUsers(q: string): Promise<PublicUserSummary[]> {
    const { data } = await axios.get<PublicUserSummary[]>('/social/users/search', { params: { q } });
    return data;
}

export async function sendFriendRequest(params: { userId?: number; userName?: string }): Promise<void> {
    await axios.post('/social/friends/request', params);
}

export async function acceptFriendRequest(connectionId: number): Promise<void> {
    await axios.post(`/social/friends/${connectionId}/accept`);
}

export async function declineFriendRequest(connectionId: number): Promise<void> {
    await axios.post(`/social/friends/${connectionId}/decline`);
}

export async function removeFriend(connectionId: number): Promise<void> {
    await axios.delete(`/social/friends/${connectionId}`);
}

export async function getTrackerPrivacy(): Promise<TrackerPrivacySettings> {
    const { data } = await axios.get<TrackerPrivacySettings>('/tracker/privacy');
    return data;
}

export async function updateTrackerPrivacy(body: Partial<TrackerPrivacySettings>): Promise<TrackerPrivacySettings> {
    const { data } = await axios.patch<TrackerPrivacySettings>('/tracker/privacy', body);
    return data;
}

export async function compareWithFriend(friendUserId: number): Promise<CompareResult> {
    const { data } = await axios.get<CompareResult>(`/tracker/compare/${friendUserId}`);
    return data;
}
