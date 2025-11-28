import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateInjuryDTO, GetCountInjuryParams, GetQueryInjuryParams, Injury } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Injury
 */
export declare const createInjury: (createInjuryDTO: CreateInjuryDTO) => Promise<Injury>;
export declare const getCreateInjuryMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Injury, TError, {
        data: CreateInjuryDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Injury, TError, {
    data: CreateInjuryDTO;
}, TContext>;
export type CreateInjuryMutationResult = NonNullable<Awaited<ReturnType<typeof createInjury>>>;
export type CreateInjuryMutationBody = CreateInjuryDTO;
export type CreateInjuryMutationError = void;
/**
* @summary Create Injury
*/
export declare const useCreateInjury: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Injury, TError, {
        data: CreateInjuryDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Injury, TError, {
    data: CreateInjuryDTO;
}, TContext>;
/**
* @summary Get all Injurys
*/
export declare const getAllInjury: (signal?: AbortSignal) => Promise<Injury[]>;
export declare const getGetAllInjuryQueryKey: () => readonly ["/injury"];
export declare const getGetAllInjuryQueryOptions: <TData = Injury[], TError = void>(options?: {
    query?: UseQueryOptions<Injury[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Injury[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllInjuryQueryResult = NonNullable<Awaited<ReturnType<typeof getAllInjury>>>;
export type GetAllInjuryQueryError = void;
/**
 * @summary Get all Injurys
 */
export declare const useGetAllInjury: <TData = Injury[], TError = void>(options?: {
    query?: UseQueryOptions<Injury[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Injurys
 */
export declare const getQueryInjury: (params?: GetQueryInjuryParams, signal?: AbortSignal) => Promise<Injury[]>;
export declare const getGetQueryInjuryQueryKey: (params?: GetQueryInjuryParams) => readonly ["/injury/query", ...GetQueryInjuryParams[]];
export declare const getGetQueryInjuryQueryOptions: <TData = Injury[], TError = void>(params?: GetQueryInjuryParams, options?: {
    query?: UseQueryOptions<Injury[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Injury[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryInjuryQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryInjury>>>;
export type GetQueryInjuryQueryError = void;
/**
 * @summary Get all Injurys
 */
export declare const useGetQueryInjury: <TData = Injury[], TError = void>(params?: GetQueryInjuryParams, options?: {
    query?: UseQueryOptions<Injury[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Injurys
 */
export declare const getCountInjury: (params?: GetCountInjuryParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountInjuryQueryKey: (params?: GetCountInjuryParams) => readonly ["/injury/count", ...GetCountInjuryParams[]];
export declare const getGetCountInjuryQueryOptions: <TData = number, TError = void>(params?: GetCountInjuryParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountInjuryQueryResult = NonNullable<Awaited<ReturnType<typeof getCountInjury>>>;
export type GetCountInjuryQueryError = void;
/**
 * @summary Get count of Injurys
 */
export declare const useGetCountInjury: <TData = number, TError = void>(params?: GetCountInjuryParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Injury
 */
export declare const getOneInjury: (id: number, signal?: AbortSignal) => Promise<Injury>;
export declare const getGetOneInjuryQueryKey: (id: number) => readonly [`/injury/${number}`];
export declare const getGetOneInjuryQueryOptions: <TData = Injury, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Injury, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Injury, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneInjuryQueryResult = NonNullable<Awaited<ReturnType<typeof getOneInjury>>>;
export type GetOneInjuryQueryError = void;
/**
 * @summary Get one Injury
 */
export declare const useGetOneInjury: <TData = Injury, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Injury, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Injury
 */
export declare const updateOneInjury: (id: number, injury: Injury) => Promise<void>;
export declare const getUpdateOneInjuryMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Injury;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Injury;
}, TContext>;
export type UpdateOneInjuryMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneInjury>>>;
export type UpdateOneInjuryMutationBody = Injury;
export type UpdateOneInjuryMutationError = void;
/**
* @summary Update one Injury
*/
export declare const useUpdateOneInjury: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Injury;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Injury;
}, TContext>;
/**
* @summary Delete one Injury
*/
export declare const deleteOneInjury: (id: number) => Promise<void>;
export declare const getDeleteOneInjuryMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneInjuryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneInjury>>>;
export type DeleteOneInjuryMutationError = void;
/**
* @summary Delete one Injury
*/
export declare const useDeleteOneInjury: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Injury
*/
export declare const uploadInjury: () => Promise<void>;
export declare const getUploadInjuryMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadInjuryMutationResult = NonNullable<Awaited<ReturnType<typeof uploadInjury>>>;
export type UploadInjuryMutationError = void;
/**
* @summary Upload a file for Injury
*/
export declare const useUploadInjury: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Injury
*/
export declare const downloadInjury: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadInjuryQueryKey: (filename: string) => readonly [`/injury/download/${string}`];
export declare const getDownloadInjuryQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadInjuryQueryResult = NonNullable<Awaited<ReturnType<typeof downloadInjury>>>;
export type DownloadInjuryQueryError = void;
/**
 * @summary Download file related to Injury
 */
export declare const useDownloadInjury: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
