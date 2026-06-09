import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { SendFriendRequestDto, SocialControllerSearchUsersParams } from './iWatchFootballAPI.schemas';
/**
 * @summary List accepted friends and pending requests
 */
export declare const socialControllerListFriends: (signal?: AbortSignal) => Promise<void>;
export declare const getSocialControllerListFriendsQueryKey: () => readonly ["/social/friends"];
export declare const getSocialControllerListFriendsQueryOptions: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type SocialControllerListFriendsQueryResult = NonNullable<Awaited<ReturnType<typeof socialControllerListFriends>>>;
export type SocialControllerListFriendsQueryError = void;
/**
 * @summary List accepted friends and pending requests
 */
export declare const useSocialControllerListFriends: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List accepted friends and pending requests
 */
export declare const socialControllerListFriends: (signal?: AbortSignal) => Promise<void>;
export declare const getSocialControllerListFriendsQueryKey: () => readonly ["/social/friends"];
export declare const getSocialControllerListFriendsQueryOptions: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type SocialControllerListFriendsQueryResult = NonNullable<Awaited<ReturnType<typeof socialControllerListFriends>>>;
export type SocialControllerListFriendsQueryError = void;
/**
 * @summary List accepted friends and pending requests
 */
export declare const useSocialControllerListFriends: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Search users by username or name (for adding friends)
 */
export declare const socialControllerSearchUsers: (params: SocialControllerSearchUsersParams, signal?: AbortSignal) => Promise<void>;
export declare const getSocialControllerSearchUsersQueryKey: (params: SocialControllerSearchUsersParams) => readonly ["/social/users/search", ...SocialControllerSearchUsersParams[]];
export declare const getSocialControllerSearchUsersQueryOptions: <TData = void, TError = void>(params: SocialControllerSearchUsersParams, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type SocialControllerSearchUsersQueryResult = NonNullable<Awaited<ReturnType<typeof socialControllerSearchUsers>>>;
export type SocialControllerSearchUsersQueryError = void;
/**
 * @summary Search users by username or name (for adding friends)
 */
export declare const useSocialControllerSearchUsers: <TData = void, TError = void>(params: SocialControllerSearchUsersParams, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Search users by username or name (for adding friends)
 */
export declare const socialControllerSearchUsers: (params: SocialControllerSearchUsersParams, signal?: AbortSignal) => Promise<void>;
export declare const getSocialControllerSearchUsersQueryKey: (params: SocialControllerSearchUsersParams) => readonly ["/social/users/search", ...SocialControllerSearchUsersParams[]];
export declare const getSocialControllerSearchUsersQueryOptions: <TData = void, TError = void>(params: SocialControllerSearchUsersParams, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type SocialControllerSearchUsersQueryResult = NonNullable<Awaited<ReturnType<typeof socialControllerSearchUsers>>>;
export type SocialControllerSearchUsersQueryError = void;
/**
 * @summary Search users by username or name (for adding friends)
 */
export declare const useSocialControllerSearchUsers: <TData = void, TError = void>(params: SocialControllerSearchUsersParams, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a friend request
 */
export declare const socialControllerSendRequest: (sendFriendRequestDto: SendFriendRequestDto) => Promise<void>;
export declare const getSocialControllerSendRequestMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: SendFriendRequestDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: SendFriendRequestDto;
}, TContext>;
export type SocialControllerSendRequestMutationResult = NonNullable<Awaited<ReturnType<typeof socialControllerSendRequest>>>;
export type SocialControllerSendRequestMutationBody = SendFriendRequestDto;
export type SocialControllerSendRequestMutationError = void;
/**
* @summary Send a friend request
*/
export declare const useSocialControllerSendRequest: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: SendFriendRequestDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: SendFriendRequestDto;
}, TContext>;
/**
* @summary Send a friend request
*/
export declare const socialControllerSendRequest: (sendFriendRequestDto: SendFriendRequestDto) => Promise<void>;
export declare const getSocialControllerSendRequestMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: SendFriendRequestDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: SendFriendRequestDto;
}, TContext>;
export type SocialControllerSendRequestMutationResult = NonNullable<Awaited<ReturnType<typeof socialControllerSendRequest>>>;
export type SocialControllerSendRequestMutationBody = SendFriendRequestDto;
export type SocialControllerSendRequestMutationError = void;
/**
* @summary Send a friend request
*/
export declare const useSocialControllerSendRequest: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: SendFriendRequestDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: SendFriendRequestDto;
}, TContext>;
/**
* @summary Accept an incoming friend request
*/
export declare const socialControllerAccept: (connectionId: number) => Promise<void>;
export declare const getSocialControllerAcceptMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    connectionId: number;
}, TContext>;
export type SocialControllerAcceptMutationResult = NonNullable<Awaited<ReturnType<typeof socialControllerAccept>>>;
export type SocialControllerAcceptMutationError = void;
/**
* @summary Accept an incoming friend request
*/
export declare const useSocialControllerAccept: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    connectionId: number;
}, TContext>;
/**
* @summary Accept an incoming friend request
*/
export declare const socialControllerAccept: (connectionId: number) => Promise<void>;
export declare const getSocialControllerAcceptMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    connectionId: number;
}, TContext>;
export type SocialControllerAcceptMutationResult = NonNullable<Awaited<ReturnType<typeof socialControllerAccept>>>;
export type SocialControllerAcceptMutationError = void;
/**
* @summary Accept an incoming friend request
*/
export declare const useSocialControllerAccept: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    connectionId: number;
}, TContext>;
/**
* @summary Decline an incoming friend request
*/
export declare const socialControllerDecline: (connectionId: number) => Promise<void>;
export declare const getSocialControllerDeclineMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    connectionId: number;
}, TContext>;
export type SocialControllerDeclineMutationResult = NonNullable<Awaited<ReturnType<typeof socialControllerDecline>>>;
export type SocialControllerDeclineMutationError = void;
/**
* @summary Decline an incoming friend request
*/
export declare const useSocialControllerDecline: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    connectionId: number;
}, TContext>;
/**
* @summary Decline an incoming friend request
*/
export declare const socialControllerDecline: (connectionId: number) => Promise<void>;
export declare const getSocialControllerDeclineMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    connectionId: number;
}, TContext>;
export type SocialControllerDeclineMutationResult = NonNullable<Awaited<ReturnType<typeof socialControllerDecline>>>;
export type SocialControllerDeclineMutationError = void;
/**
* @summary Decline an incoming friend request
*/
export declare const useSocialControllerDecline: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    connectionId: number;
}, TContext>;
/**
* @summary Remove an accepted friend
*/
export declare const socialControllerRemove: (connectionId: number) => Promise<void>;
export declare const getSocialControllerRemoveMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    connectionId: number;
}, TContext>;
export type SocialControllerRemoveMutationResult = NonNullable<Awaited<ReturnType<typeof socialControllerRemove>>>;
export type SocialControllerRemoveMutationError = void;
/**
* @summary Remove an accepted friend
*/
export declare const useSocialControllerRemove: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    connectionId: number;
}, TContext>;
/**
* @summary Remove an accepted friend
*/
export declare const socialControllerRemove: (connectionId: number) => Promise<void>;
export declare const getSocialControllerRemoveMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    connectionId: number;
}, TContext>;
export type SocialControllerRemoveMutationResult = NonNullable<Awaited<ReturnType<typeof socialControllerRemove>>>;
export type SocialControllerRemoveMutationError = void;
/**
* @summary Remove an accepted friend
*/
export declare const useSocialControllerRemove: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        connectionId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    connectionId: number;
}, TContext>;
