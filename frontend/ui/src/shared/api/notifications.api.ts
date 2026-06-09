import axios from 'axios';

export type NotificationType = 'FRIEND_REQUEST_RECEIVED' | 'FRIEND_REQUEST_ACCEPTED';

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
