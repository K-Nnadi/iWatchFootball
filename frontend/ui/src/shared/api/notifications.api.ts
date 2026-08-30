import axios from 'axios';

export type NotificationType =
    | 'FRIEND_REQUEST_RECEIVED'
    | 'FRIEND_REQUEST_ACCEPTED'
    | 'TICKET_RESALE_AVAILABLE'
    | 'LISTING_APPROVED'
    | 'LISTING_REJECTED'
    | 'PURCHASE_REQUESTED'
    | 'TRANSFER_INITIATED'
    | 'TRANSFER_CONFIRMED'
    | 'DISPUTE_RAISED'
    | 'MATCH_REMINDER'
    | 'MATCH_CANCELLED'
    | 'MATCH_POSTPONED'
    | 'MATCH_SUSPENDED';

export interface UserNotificationItem {
    id: number;
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    readAt?: string | null;
    createdAt: string;
    metadata?: {
        connectionId?: number;
        actorUserId?: number;
        actorUserName?: string;
        fixtureId?: number;
        listingId?: number;
        previousStatus?: string;
        nextStatus?: string;
    };
}

export async function getNotifications(): Promise<UserNotificationItem[]> {
    const { data } = await axios.get<UserNotificationItem[]>('/notifications');
    return data;
}

export async function getUnreadNotificationCount(): Promise<number> {
    const { data } = await axios.get<{ count: number }>('/notifications/unread-count');
    return data.count;
}

export async function markNotificationRead(id: number): Promise<void> {
    await axios.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
    await axios.post('/notifications/read-all');
}
