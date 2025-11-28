import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
/**
 * @summary Manually trigger news aggregation
 */
export declare const newsAggregatorControllerTriggerAggregation: () => Promise<void>;
export declare const getNewsAggregatorControllerTriggerAggregationMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type NewsAggregatorControllerTriggerAggregationMutationResult = NonNullable<Awaited<ReturnType<typeof newsAggregatorControllerTriggerAggregation>>>;
export type NewsAggregatorControllerTriggerAggregationMutationError = unknown;
/**
* @summary Manually trigger news aggregation
*/
export declare const useNewsAggregatorControllerTriggerAggregation: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Manually trigger news aggregation for a specific feed
*/
export declare const newsAggregatorControllerTriggerFeedAggregation: (feedName: string) => Promise<void>;
export declare const getNewsAggregatorControllerTriggerFeedAggregationMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        feedName: string;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    feedName: string;
}, TContext>;
export type NewsAggregatorControllerTriggerFeedAggregationMutationResult = NonNullable<Awaited<ReturnType<typeof newsAggregatorControllerTriggerFeedAggregation>>>;
export type NewsAggregatorControllerTriggerFeedAggregationMutationError = unknown;
/**
* @summary Manually trigger news aggregation for a specific feed
*/
export declare const useNewsAggregatorControllerTriggerFeedAggregation: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        feedName: string;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    feedName: string;
}, TContext>;
/**
* @summary Get news aggregation status
*/
export declare const newsAggregatorControllerGetStatus: (signal?: AbortSignal) => Promise<void>;
export declare const getNewsAggregatorControllerGetStatusQueryKey: () => readonly ["/newsAggregation/status"];
export declare const getNewsAggregatorControllerGetStatusQueryOptions: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type NewsAggregatorControllerGetStatusQueryResult = NonNullable<Awaited<ReturnType<typeof newsAggregatorControllerGetStatus>>>;
export type NewsAggregatorControllerGetStatusQueryError = unknown;
/**
 * @summary Get news aggregation status
 */
export declare const useNewsAggregatorControllerGetStatus: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
