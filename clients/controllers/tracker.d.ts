import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { UpdateTrackerPrivacyDto } from './iWatchFootballAPI.schemas';
/**
 * @summary Get tracker privacy settings for the current user
 */
export declare const trackerControllerGetPrivacy: (signal?: AbortSignal) => Promise<void>;
export declare const getTrackerControllerGetPrivacyQueryKey: () => readonly ["/tracker/privacy"];
export declare const getTrackerControllerGetPrivacyQueryOptions: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type TrackerControllerGetPrivacyQueryResult = NonNullable<Awaited<ReturnType<typeof trackerControllerGetPrivacy>>>;
export type TrackerControllerGetPrivacyQueryError = void;
/**
 * @summary Get tracker privacy settings for the current user
 */
export declare const useTrackerControllerGetPrivacy: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update tracker privacy settings
 */
export declare const trackerControllerUpdatePrivacy: (updateTrackerPrivacyDto: UpdateTrackerPrivacyDto) => Promise<void>;
export declare const getTrackerControllerUpdatePrivacyMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: UpdateTrackerPrivacyDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: UpdateTrackerPrivacyDto;
}, TContext>;
export type TrackerControllerUpdatePrivacyMutationResult = NonNullable<Awaited<ReturnType<typeof trackerControllerUpdatePrivacy>>>;
export type TrackerControllerUpdatePrivacyMutationBody = UpdateTrackerPrivacyDto;
export type TrackerControllerUpdatePrivacyMutationError = void;
/**
* @summary Update tracker privacy settings
*/
export declare const useTrackerControllerUpdatePrivacy: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: UpdateTrackerPrivacyDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: UpdateTrackerPrivacyDto;
}, TContext>;
/**
* @summary Get aggregate tracker stats for a user (privacy-gated)
*/
export declare const trackerControllerGetStats: (userId: number, signal?: AbortSignal) => Promise<void>;
export declare const getTrackerControllerGetStatsQueryKey: (userId: number) => readonly [`/tracker/stats/${number}`];
export declare const getTrackerControllerGetStatsQueryOptions: <TData = void, TError = void>(userId: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type TrackerControllerGetStatsQueryResult = NonNullable<Awaited<ReturnType<typeof trackerControllerGetStats>>>;
export type TrackerControllerGetStatsQueryError = void;
/**
 * @summary Get aggregate tracker stats for a user (privacy-gated)
 */
export declare const useTrackerControllerGetStats: <TData = void, TError = void>(userId: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Compare tracker stats with a friend (premium)
 */
export declare const trackerControllerCompare: (friendUserId: number, signal?: AbortSignal) => Promise<void>;
export declare const getTrackerControllerCompareQueryKey: (friendUserId: number) => readonly [`/tracker/compare/${number}`];
export declare const getTrackerControllerCompareQueryOptions: <TData = void, TError = void>(friendUserId: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type TrackerControllerCompareQueryResult = NonNullable<Awaited<ReturnType<typeof trackerControllerCompare>>>;
export type TrackerControllerCompareQueryError = void;
/**
 * @summary Compare tracker stats with a friend (premium)
 */
export declare const useTrackerControllerCompare: <TData = void, TError = void>(friendUserId: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
