import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateLoyaltySchemeDTO, GetCountLoyaltySchemeParams, GetQueryLoyaltySchemeParams, LoyaltyScheme } from './iWatchFootballAPI.schemas';
/**
 * @summary Create LoyaltyScheme
 */
export declare const createLoyaltyScheme: (createLoyaltySchemeDTO: CreateLoyaltySchemeDTO) => Promise<LoyaltyScheme>;
export declare const getCreateLoyaltySchemeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<LoyaltyScheme, TError, {
        data: CreateLoyaltySchemeDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<LoyaltyScheme, TError, {
    data: CreateLoyaltySchemeDTO;
}, TContext>;
export type CreateLoyaltySchemeMutationResult = NonNullable<Awaited<ReturnType<typeof createLoyaltyScheme>>>;
export type CreateLoyaltySchemeMutationBody = CreateLoyaltySchemeDTO;
export type CreateLoyaltySchemeMutationError = void;
/**
* @summary Create LoyaltyScheme
*/
export declare const useCreateLoyaltyScheme: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<LoyaltyScheme, TError, {
        data: CreateLoyaltySchemeDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<LoyaltyScheme, TError, {
    data: CreateLoyaltySchemeDTO;
}, TContext>;
/**
* @summary Get all LoyaltySchemes
*/
export declare const getAllLoyaltyScheme: (signal?: AbortSignal) => Promise<LoyaltyScheme[]>;
export declare const getGetAllLoyaltySchemeQueryKey: () => readonly ["/loyaltyScheme"];
export declare const getGetAllLoyaltySchemeQueryOptions: <TData = LoyaltyScheme[], TError = void>(options?: {
    query?: UseQueryOptions<LoyaltyScheme[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LoyaltyScheme[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllLoyaltySchemeQueryResult = NonNullable<Awaited<ReturnType<typeof getAllLoyaltyScheme>>>;
export type GetAllLoyaltySchemeQueryError = void;
/**
 * @summary Get all LoyaltySchemes
 */
export declare const useGetAllLoyaltyScheme: <TData = LoyaltyScheme[], TError = void>(options?: {
    query?: UseQueryOptions<LoyaltyScheme[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all LoyaltySchemes
 */
export declare const getQueryLoyaltyScheme: (params?: GetQueryLoyaltySchemeParams, signal?: AbortSignal) => Promise<LoyaltyScheme[]>;
export declare const getGetQueryLoyaltySchemeQueryKey: (params?: GetQueryLoyaltySchemeParams) => readonly ["/loyaltyScheme/query", ...GetQueryLoyaltySchemeParams[]];
export declare const getGetQueryLoyaltySchemeQueryOptions: <TData = LoyaltyScheme[], TError = void>(params?: GetQueryLoyaltySchemeParams, options?: {
    query?: UseQueryOptions<LoyaltyScheme[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LoyaltyScheme[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryLoyaltySchemeQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryLoyaltyScheme>>>;
export type GetQueryLoyaltySchemeQueryError = void;
/**
 * @summary Get all LoyaltySchemes
 */
export declare const useGetQueryLoyaltyScheme: <TData = LoyaltyScheme[], TError = void>(params?: GetQueryLoyaltySchemeParams, options?: {
    query?: UseQueryOptions<LoyaltyScheme[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of LoyaltySchemes
 */
export declare const getCountLoyaltyScheme: (params?: GetCountLoyaltySchemeParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountLoyaltySchemeQueryKey: (params?: GetCountLoyaltySchemeParams) => readonly ["/loyaltyScheme/count", ...GetCountLoyaltySchemeParams[]];
export declare const getGetCountLoyaltySchemeQueryOptions: <TData = number, TError = void>(params?: GetCountLoyaltySchemeParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountLoyaltySchemeQueryResult = NonNullable<Awaited<ReturnType<typeof getCountLoyaltyScheme>>>;
export type GetCountLoyaltySchemeQueryError = void;
/**
 * @summary Get count of LoyaltySchemes
 */
export declare const useGetCountLoyaltyScheme: <TData = number, TError = void>(params?: GetCountLoyaltySchemeParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one LoyaltyScheme
 */
export declare const getOneLoyaltyScheme: (id: number, signal?: AbortSignal) => Promise<LoyaltyScheme>;
export declare const getGetOneLoyaltySchemeQueryKey: (id: number) => readonly [`/loyaltyScheme/${number}`];
export declare const getGetOneLoyaltySchemeQueryOptions: <TData = LoyaltyScheme, TError = void>(id: number, options?: {
    query?: UseQueryOptions<LoyaltyScheme, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LoyaltyScheme, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneLoyaltySchemeQueryResult = NonNullable<Awaited<ReturnType<typeof getOneLoyaltyScheme>>>;
export type GetOneLoyaltySchemeQueryError = void;
/**
 * @summary Get one LoyaltyScheme
 */
export declare const useGetOneLoyaltyScheme: <TData = LoyaltyScheme, TError = void>(id: number, options?: {
    query?: UseQueryOptions<LoyaltyScheme, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one LoyaltyScheme
 */
export declare const updateOneLoyaltyScheme: (id: number, loyaltyScheme: LoyaltyScheme) => Promise<void>;
export declare const getUpdateOneLoyaltySchemeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: LoyaltyScheme;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: LoyaltyScheme;
}, TContext>;
export type UpdateOneLoyaltySchemeMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneLoyaltyScheme>>>;
export type UpdateOneLoyaltySchemeMutationBody = LoyaltyScheme;
export type UpdateOneLoyaltySchemeMutationError = void;
/**
* @summary Update one LoyaltyScheme
*/
export declare const useUpdateOneLoyaltyScheme: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: LoyaltyScheme;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: LoyaltyScheme;
}, TContext>;
/**
* @summary Delete one LoyaltyScheme
*/
export declare const deleteOneLoyaltyScheme: (id: number) => Promise<void>;
export declare const getDeleteOneLoyaltySchemeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneLoyaltySchemeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneLoyaltyScheme>>>;
export type DeleteOneLoyaltySchemeMutationError = void;
/**
* @summary Delete one LoyaltyScheme
*/
export declare const useDeleteOneLoyaltyScheme: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for LoyaltyScheme
*/
export declare const uploadLoyaltyScheme: () => Promise<void>;
export declare const getUploadLoyaltySchemeMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadLoyaltySchemeMutationResult = NonNullable<Awaited<ReturnType<typeof uploadLoyaltyScheme>>>;
export type UploadLoyaltySchemeMutationError = void;
/**
* @summary Upload a file for LoyaltyScheme
*/
export declare const useUploadLoyaltyScheme: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to LoyaltyScheme
*/
export declare const downloadLoyaltyScheme: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadLoyaltySchemeQueryKey: (filename: string) => readonly [`/loyaltyScheme/download/${string}`];
export declare const getDownloadLoyaltySchemeQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadLoyaltySchemeQueryResult = NonNullable<Awaited<ReturnType<typeof downloadLoyaltyScheme>>>;
export type DownloadLoyaltySchemeQueryError = void;
/**
 * @summary Download file related to LoyaltyScheme
 */
export declare const useDownloadLoyaltyScheme: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
