import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { PlatformConfigControllerGetFeatures200 } from './iWatchFootballAPI.schemas';
/**
 * @summary Public platform feature flags for client UI
 */
export declare const platformConfigControllerGetFeatures: (signal?: AbortSignal) => Promise<PlatformConfigControllerGetFeatures200>;
export declare const getPlatformConfigControllerGetFeaturesQueryKey: () => readonly ["/platform-config/features"];
export declare const getPlatformConfigControllerGetFeaturesQueryOptions: <TData = PlatformConfigControllerGetFeatures200, TError = void>(options?: {
    query?: UseQueryOptions<PlatformConfigControllerGetFeatures200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PlatformConfigControllerGetFeatures200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type PlatformConfigControllerGetFeaturesQueryResult = NonNullable<Awaited<ReturnType<typeof platformConfigControllerGetFeatures>>>;
export type PlatformConfigControllerGetFeaturesQueryError = void;
/**
 * @summary Public platform feature flags for client UI
 */
export declare const usePlatformConfigControllerGetFeatures: <TData = PlatformConfigControllerGetFeatures200, TError = void>(options?: {
    query?: UseQueryOptions<PlatformConfigControllerGetFeatures200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
