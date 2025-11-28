import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateManagerDTO, GetCountManagerParams, GetQueryManagerParams, Manager } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Manager
 */
export declare const createManager: (createManagerDTO: CreateManagerDTO) => Promise<Manager>;
export declare const getCreateManagerMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Manager, TError, {
        data: CreateManagerDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Manager, TError, {
    data: CreateManagerDTO;
}, TContext>;
export type CreateManagerMutationResult = NonNullable<Awaited<ReturnType<typeof createManager>>>;
export type CreateManagerMutationBody = CreateManagerDTO;
export type CreateManagerMutationError = void;
/**
* @summary Create Manager
*/
export declare const useCreateManager: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Manager, TError, {
        data: CreateManagerDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Manager, TError, {
    data: CreateManagerDTO;
}, TContext>;
/**
* @summary Get all Managers
*/
export declare const getAllManager: (signal?: AbortSignal) => Promise<Manager[]>;
export declare const getGetAllManagerQueryKey: () => readonly ["/manager"];
export declare const getGetAllManagerQueryOptions: <TData = Manager[], TError = void>(options?: {
    query?: UseQueryOptions<Manager[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Manager[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllManagerQueryResult = NonNullable<Awaited<ReturnType<typeof getAllManager>>>;
export type GetAllManagerQueryError = void;
/**
 * @summary Get all Managers
 */
export declare const useGetAllManager: <TData = Manager[], TError = void>(options?: {
    query?: UseQueryOptions<Manager[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Managers
 */
export declare const getQueryManager: (params?: GetQueryManagerParams, signal?: AbortSignal) => Promise<Manager[]>;
export declare const getGetQueryManagerQueryKey: (params?: GetQueryManagerParams) => readonly ["/manager/query", ...GetQueryManagerParams[]];
export declare const getGetQueryManagerQueryOptions: <TData = Manager[], TError = void>(params?: GetQueryManagerParams, options?: {
    query?: UseQueryOptions<Manager[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Manager[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryManagerQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryManager>>>;
export type GetQueryManagerQueryError = void;
/**
 * @summary Get all Managers
 */
export declare const useGetQueryManager: <TData = Manager[], TError = void>(params?: GetQueryManagerParams, options?: {
    query?: UseQueryOptions<Manager[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Managers
 */
export declare const getCountManager: (params?: GetCountManagerParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountManagerQueryKey: (params?: GetCountManagerParams) => readonly ["/manager/count", ...GetCountManagerParams[]];
export declare const getGetCountManagerQueryOptions: <TData = number, TError = void>(params?: GetCountManagerParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountManagerQueryResult = NonNullable<Awaited<ReturnType<typeof getCountManager>>>;
export type GetCountManagerQueryError = void;
/**
 * @summary Get count of Managers
 */
export declare const useGetCountManager: <TData = number, TError = void>(params?: GetCountManagerParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Manager
 */
export declare const getOneManager: (id: number, signal?: AbortSignal) => Promise<Manager>;
export declare const getGetOneManagerQueryKey: (id: number) => readonly [`/manager/${number}`];
export declare const getGetOneManagerQueryOptions: <TData = Manager, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Manager, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Manager, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneManagerQueryResult = NonNullable<Awaited<ReturnType<typeof getOneManager>>>;
export type GetOneManagerQueryError = void;
/**
 * @summary Get one Manager
 */
export declare const useGetOneManager: <TData = Manager, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Manager, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Manager
 */
export declare const updateOneManager: (id: number, manager: Manager) => Promise<void>;
export declare const getUpdateOneManagerMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Manager;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Manager;
}, TContext>;
export type UpdateOneManagerMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneManager>>>;
export type UpdateOneManagerMutationBody = Manager;
export type UpdateOneManagerMutationError = void;
/**
* @summary Update one Manager
*/
export declare const useUpdateOneManager: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Manager;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Manager;
}, TContext>;
/**
* @summary Delete one Manager
*/
export declare const deleteOneManager: (id: number) => Promise<void>;
export declare const getDeleteOneManagerMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneManagerMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneManager>>>;
export type DeleteOneManagerMutationError = void;
/**
* @summary Delete one Manager
*/
export declare const useDeleteOneManager: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Manager
*/
export declare const uploadManager: () => Promise<void>;
export declare const getUploadManagerMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadManagerMutationResult = NonNullable<Awaited<ReturnType<typeof uploadManager>>>;
export type UploadManagerMutationError = void;
/**
* @summary Upload a file for Manager
*/
export declare const useUploadManager: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Manager
*/
export declare const downloadManager: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadManagerQueryKey: (filename: string) => readonly [`/manager/download/${string}`];
export declare const getDownloadManagerQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadManagerQueryResult = NonNullable<Awaited<ReturnType<typeof downloadManager>>>;
export type DownloadManagerQueryError = void;
/**
 * @summary Download file related to Manager
 */
export declare const useDownloadManager: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
