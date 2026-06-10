import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { UserNotification } from './iWatchFootballAPI.schemas';
/**
 * @summary List recent in-app notifications
 */
export declare const notificationControllerList: (signal?: AbortSignal) => Promise<UserNotification[]>;
export declare const getNotificationControllerListQueryKey: () => readonly ["/notifications"];
export declare const getNotificationControllerListQueryOptions: <TData = UserNotification[], TError = void>(options?: {
    query?: UseQueryOptions<UserNotification[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<UserNotification[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type NotificationControllerListQueryResult = NonNullable<Awaited<ReturnType<typeof notificationControllerList>>>;
export type NotificationControllerListQueryError = void;
/**
 * @summary List recent in-app notifications
 */
export declare const useNotificationControllerList: <TData = UserNotification[], TError = void>(options?: {
    query?: UseQueryOptions<UserNotification[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Unread notification count
 */
export declare const notificationControllerUnreadCount: (signal?: AbortSignal) => Promise<void>;
export declare const getNotificationControllerUnreadCountQueryKey: () => readonly ["/notifications/unread-count"];
export declare const getNotificationControllerUnreadCountQueryOptions: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type NotificationControllerUnreadCountQueryResult = NonNullable<Awaited<ReturnType<typeof notificationControllerUnreadCount>>>;
export type NotificationControllerUnreadCountQueryError = void;
/**
 * @summary Unread notification count
 */
export declare const useNotificationControllerUnreadCount: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Mark one notification as read
 */
export declare const notificationControllerMarkRead: (id: number) => Promise<void>;
export declare const getNotificationControllerMarkReadMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type NotificationControllerMarkReadMutationResult = NonNullable<Awaited<ReturnType<typeof notificationControllerMarkRead>>>;
export type NotificationControllerMarkReadMutationError = void;
/**
* @summary Mark one notification as read
*/
export declare const useNotificationControllerMarkRead: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Mark all notifications as read
*/
export declare const notificationControllerMarkAllRead: () => Promise<void>;
export declare const getNotificationControllerMarkAllReadMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type NotificationControllerMarkAllReadMutationResult = NonNullable<Awaited<ReturnType<typeof notificationControllerMarkAllRead>>>;
export type NotificationControllerMarkAllReadMutationError = void;
/**
* @summary Mark all notifications as read
*/
export declare const useNotificationControllerMarkAllRead: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
