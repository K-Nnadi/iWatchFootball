import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
/**
 * @summary Health check endpoint
 */
export declare const healthControllerCheck: (signal?: AbortSignal) => Promise<void>;
export declare const getHealthControllerCheckQueryKey: () => readonly ["/health"];
export declare const getHealthControllerCheckQueryOptions: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type HealthControllerCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthControllerCheck>>>;
export type HealthControllerCheckQueryError = unknown;
/**
 * @summary Health check endpoint
 */
export declare const useHealthControllerCheck: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Readiness check endpoint
 */
export declare const healthControllerReady: (signal?: AbortSignal) => Promise<void>;
export declare const getHealthControllerReadyQueryKey: () => readonly ["/health/ready"];
export declare const getHealthControllerReadyQueryOptions: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type HealthControllerReadyQueryResult = NonNullable<Awaited<ReturnType<typeof healthControllerReady>>>;
export type HealthControllerReadyQueryError = unknown;
/**
 * @summary Readiness check endpoint
 */
export declare const useHealthControllerReady: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Liveness check endpoint
 */
export declare const healthControllerLive: (signal?: AbortSignal) => Promise<void>;
export declare const getHealthControllerLiveQueryKey: () => readonly ["/health/live"];
export declare const getHealthControllerLiveQueryOptions: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type HealthControllerLiveQueryResult = NonNullable<Awaited<ReturnType<typeof healthControllerLive>>>;
export type HealthControllerLiveQueryError = unknown;
/**
 * @summary Liveness check endpoint
 */
export declare const useHealthControllerLive: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
