import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateManagerEmploymentDTO, GetCountManagerEmploymentParams, GetQueryManagerEmploymentParams, ManagerEmployment } from './iWatchFootballAPI.schemas';
/**
 * @summary Create ManagerEmployment
 */
export declare const createManagerEmployment: (createManagerEmploymentDTO: CreateManagerEmploymentDTO) => Promise<ManagerEmployment>;
export declare const getCreateManagerEmploymentMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<ManagerEmployment, TError, {
        data: CreateManagerEmploymentDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<ManagerEmployment, TError, {
    data: CreateManagerEmploymentDTO;
}, TContext>;
export type CreateManagerEmploymentMutationResult = NonNullable<Awaited<ReturnType<typeof createManagerEmployment>>>;
export type CreateManagerEmploymentMutationBody = CreateManagerEmploymentDTO;
export type CreateManagerEmploymentMutationError = void;
/**
* @summary Create ManagerEmployment
*/
export declare const useCreateManagerEmployment: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<ManagerEmployment, TError, {
        data: CreateManagerEmploymentDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<ManagerEmployment, TError, {
    data: CreateManagerEmploymentDTO;
}, TContext>;
/**
* @summary Get all ManagerEmployments
*/
export declare const getAllManagerEmployment: (signal?: AbortSignal) => Promise<ManagerEmployment[]>;
export declare const getGetAllManagerEmploymentQueryKey: () => readonly ["/managerEmployment"];
export declare const getGetAllManagerEmploymentQueryOptions: <TData = ManagerEmployment[], TError = void>(options?: {
    query?: UseQueryOptions<ManagerEmployment[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ManagerEmployment[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllManagerEmploymentQueryResult = NonNullable<Awaited<ReturnType<typeof getAllManagerEmployment>>>;
export type GetAllManagerEmploymentQueryError = void;
/**
 * @summary Get all ManagerEmployments
 */
export declare const useGetAllManagerEmployment: <TData = ManagerEmployment[], TError = void>(options?: {
    query?: UseQueryOptions<ManagerEmployment[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all ManagerEmployments
 */
export declare const getQueryManagerEmployment: (params?: GetQueryManagerEmploymentParams, signal?: AbortSignal) => Promise<ManagerEmployment[]>;
export declare const getGetQueryManagerEmploymentQueryKey: (params?: GetQueryManagerEmploymentParams) => readonly ["/managerEmployment/query", ...GetQueryManagerEmploymentParams[]];
export declare const getGetQueryManagerEmploymentQueryOptions: <TData = ManagerEmployment[], TError = void>(params?: GetQueryManagerEmploymentParams, options?: {
    query?: UseQueryOptions<ManagerEmployment[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ManagerEmployment[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryManagerEmploymentQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryManagerEmployment>>>;
export type GetQueryManagerEmploymentQueryError = void;
/**
 * @summary Get all ManagerEmployments
 */
export declare const useGetQueryManagerEmployment: <TData = ManagerEmployment[], TError = void>(params?: GetQueryManagerEmploymentParams, options?: {
    query?: UseQueryOptions<ManagerEmployment[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of ManagerEmployments
 */
export declare const getCountManagerEmployment: (params?: GetCountManagerEmploymentParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountManagerEmploymentQueryKey: (params?: GetCountManagerEmploymentParams) => readonly ["/managerEmployment/count", ...GetCountManagerEmploymentParams[]];
export declare const getGetCountManagerEmploymentQueryOptions: <TData = number, TError = void>(params?: GetCountManagerEmploymentParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountManagerEmploymentQueryResult = NonNullable<Awaited<ReturnType<typeof getCountManagerEmployment>>>;
export type GetCountManagerEmploymentQueryError = void;
/**
 * @summary Get count of ManagerEmployments
 */
export declare const useGetCountManagerEmployment: <TData = number, TError = void>(params?: GetCountManagerEmploymentParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one ManagerEmployment
 */
export declare const getOneManagerEmployment: (id: number, signal?: AbortSignal) => Promise<ManagerEmployment>;
export declare const getGetOneManagerEmploymentQueryKey: (id: number) => readonly [`/managerEmployment/${number}`];
export declare const getGetOneManagerEmploymentQueryOptions: <TData = ManagerEmployment, TError = void>(id: number, options?: {
    query?: UseQueryOptions<ManagerEmployment, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ManagerEmployment, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneManagerEmploymentQueryResult = NonNullable<Awaited<ReturnType<typeof getOneManagerEmployment>>>;
export type GetOneManagerEmploymentQueryError = void;
/**
 * @summary Get one ManagerEmployment
 */
export declare const useGetOneManagerEmployment: <TData = ManagerEmployment, TError = void>(id: number, options?: {
    query?: UseQueryOptions<ManagerEmployment, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one ManagerEmployment
 */
export declare const updateOneManagerEmployment: (id: number, managerEmployment: ManagerEmployment) => Promise<void>;
export declare const getUpdateOneManagerEmploymentMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: ManagerEmployment;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: ManagerEmployment;
}, TContext>;
export type UpdateOneManagerEmploymentMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneManagerEmployment>>>;
export type UpdateOneManagerEmploymentMutationBody = ManagerEmployment;
export type UpdateOneManagerEmploymentMutationError = void;
/**
* @summary Update one ManagerEmployment
*/
export declare const useUpdateOneManagerEmployment: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: ManagerEmployment;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: ManagerEmployment;
}, TContext>;
/**
* @summary Delete one ManagerEmployment
*/
export declare const deleteOneManagerEmployment: (id: number) => Promise<void>;
export declare const getDeleteOneManagerEmploymentMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneManagerEmploymentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneManagerEmployment>>>;
export type DeleteOneManagerEmploymentMutationError = void;
/**
* @summary Delete one ManagerEmployment
*/
export declare const useDeleteOneManagerEmployment: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for ManagerEmployment
*/
export declare const uploadManagerEmployment: () => Promise<void>;
export declare const getUploadManagerEmploymentMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadManagerEmploymentMutationResult = NonNullable<Awaited<ReturnType<typeof uploadManagerEmployment>>>;
export type UploadManagerEmploymentMutationError = void;
/**
* @summary Upload a file for ManagerEmployment
*/
export declare const useUploadManagerEmployment: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to ManagerEmployment
*/
export declare const downloadManagerEmployment: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadManagerEmploymentQueryKey: (filename: string) => readonly [`/managerEmployment/download/${string}`];
export declare const getDownloadManagerEmploymentQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadManagerEmploymentQueryResult = NonNullable<Awaited<ReturnType<typeof downloadManagerEmployment>>>;
export type DownloadManagerEmploymentQueryError = void;
/**
 * @summary Download file related to ManagerEmployment
 */
export declare const useDownloadManagerEmployment: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
