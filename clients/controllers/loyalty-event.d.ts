import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateLoyaltyEventDTO, GetCountLoyaltyEventParams, GetQueryLoyaltyEventParams, LoyaltyEvent } from './iWatchFootballAPI.schemas';
/**
 * @summary Create LoyaltyEvent
 */
export declare const createLoyaltyEvent: (createLoyaltyEventDTO: CreateLoyaltyEventDTO) => Promise<LoyaltyEvent>;
export declare const getCreateLoyaltyEventMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<LoyaltyEvent, TError, {
        data: CreateLoyaltyEventDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<LoyaltyEvent, TError, {
    data: CreateLoyaltyEventDTO;
}, TContext>;
export type CreateLoyaltyEventMutationResult = NonNullable<Awaited<ReturnType<typeof createLoyaltyEvent>>>;
export type CreateLoyaltyEventMutationBody = CreateLoyaltyEventDTO;
export type CreateLoyaltyEventMutationError = void;
/**
* @summary Create LoyaltyEvent
*/
export declare const useCreateLoyaltyEvent: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<LoyaltyEvent, TError, {
        data: CreateLoyaltyEventDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<LoyaltyEvent, TError, {
    data: CreateLoyaltyEventDTO;
}, TContext>;
/**
* @summary Get all LoyaltyEvents
*/
export declare const getAllLoyaltyEvent: (signal?: AbortSignal) => Promise<LoyaltyEvent[]>;
export declare const getGetAllLoyaltyEventQueryKey: () => readonly ["/loyaltyEvent"];
export declare const getGetAllLoyaltyEventQueryOptions: <TData = LoyaltyEvent[], TError = void>(options?: {
    query?: UseQueryOptions<LoyaltyEvent[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LoyaltyEvent[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllLoyaltyEventQueryResult = NonNullable<Awaited<ReturnType<typeof getAllLoyaltyEvent>>>;
export type GetAllLoyaltyEventQueryError = void;
/**
 * @summary Get all LoyaltyEvents
 */
export declare const useGetAllLoyaltyEvent: <TData = LoyaltyEvent[], TError = void>(options?: {
    query?: UseQueryOptions<LoyaltyEvent[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all LoyaltyEvents
 */
export declare const getQueryLoyaltyEvent: (params?: GetQueryLoyaltyEventParams, signal?: AbortSignal) => Promise<LoyaltyEvent[]>;
export declare const getGetQueryLoyaltyEventQueryKey: (params?: GetQueryLoyaltyEventParams) => readonly ["/loyaltyEvent/query", ...GetQueryLoyaltyEventParams[]];
export declare const getGetQueryLoyaltyEventQueryOptions: <TData = LoyaltyEvent[], TError = void>(params?: GetQueryLoyaltyEventParams, options?: {
    query?: UseQueryOptions<LoyaltyEvent[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LoyaltyEvent[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryLoyaltyEventQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryLoyaltyEvent>>>;
export type GetQueryLoyaltyEventQueryError = void;
/**
 * @summary Get all LoyaltyEvents
 */
export declare const useGetQueryLoyaltyEvent: <TData = LoyaltyEvent[], TError = void>(params?: GetQueryLoyaltyEventParams, options?: {
    query?: UseQueryOptions<LoyaltyEvent[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of LoyaltyEvents
 */
export declare const getCountLoyaltyEvent: (params?: GetCountLoyaltyEventParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountLoyaltyEventQueryKey: (params?: GetCountLoyaltyEventParams) => readonly ["/loyaltyEvent/count", ...GetCountLoyaltyEventParams[]];
export declare const getGetCountLoyaltyEventQueryOptions: <TData = number, TError = void>(params?: GetCountLoyaltyEventParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountLoyaltyEventQueryResult = NonNullable<Awaited<ReturnType<typeof getCountLoyaltyEvent>>>;
export type GetCountLoyaltyEventQueryError = void;
/**
 * @summary Get count of LoyaltyEvents
 */
export declare const useGetCountLoyaltyEvent: <TData = number, TError = void>(params?: GetCountLoyaltyEventParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one LoyaltyEvent
 */
export declare const getOneLoyaltyEvent: (id: number, signal?: AbortSignal) => Promise<LoyaltyEvent>;
export declare const getGetOneLoyaltyEventQueryKey: (id: number) => readonly [`/loyaltyEvent/${number}`];
export declare const getGetOneLoyaltyEventQueryOptions: <TData = LoyaltyEvent, TError = void>(id: number, options?: {
    query?: UseQueryOptions<LoyaltyEvent, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<LoyaltyEvent, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneLoyaltyEventQueryResult = NonNullable<Awaited<ReturnType<typeof getOneLoyaltyEvent>>>;
export type GetOneLoyaltyEventQueryError = void;
/**
 * @summary Get one LoyaltyEvent
 */
export declare const useGetOneLoyaltyEvent: <TData = LoyaltyEvent, TError = void>(id: number, options?: {
    query?: UseQueryOptions<LoyaltyEvent, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one LoyaltyEvent
 */
export declare const updateOneLoyaltyEvent: (id: number, loyaltyEvent: LoyaltyEvent) => Promise<void>;
export declare const getUpdateOneLoyaltyEventMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: LoyaltyEvent;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: LoyaltyEvent;
}, TContext>;
export type UpdateOneLoyaltyEventMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneLoyaltyEvent>>>;
export type UpdateOneLoyaltyEventMutationBody = LoyaltyEvent;
export type UpdateOneLoyaltyEventMutationError = void;
/**
* @summary Update one LoyaltyEvent
*/
export declare const useUpdateOneLoyaltyEvent: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: LoyaltyEvent;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: LoyaltyEvent;
}, TContext>;
/**
* @summary Delete one LoyaltyEvent
*/
export declare const deleteOneLoyaltyEvent: (id: number) => Promise<void>;
export declare const getDeleteOneLoyaltyEventMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneLoyaltyEventMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneLoyaltyEvent>>>;
export type DeleteOneLoyaltyEventMutationError = void;
/**
* @summary Delete one LoyaltyEvent
*/
export declare const useDeleteOneLoyaltyEvent: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for LoyaltyEvent
*/
export declare const uploadLoyaltyEvent: () => Promise<void>;
export declare const getUploadLoyaltyEventMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadLoyaltyEventMutationResult = NonNullable<Awaited<ReturnType<typeof uploadLoyaltyEvent>>>;
export type UploadLoyaltyEventMutationError = void;
/**
* @summary Upload a file for LoyaltyEvent
*/
export declare const useUploadLoyaltyEvent: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to LoyaltyEvent
*/
export declare const downloadLoyaltyEvent: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadLoyaltyEventQueryKey: (filename: string) => readonly [`/loyaltyEvent/download/${string}`];
export declare const getDownloadLoyaltyEventQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadLoyaltyEventQueryResult = NonNullable<Awaited<ReturnType<typeof downloadLoyaltyEvent>>>;
export type DownloadLoyaltyEventQueryError = void;
/**
 * @summary Download file related to LoyaltyEvent
 */
export declare const useDownloadLoyaltyEvent: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
