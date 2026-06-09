import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateIntegrationDTO, GetCountIntegrationParams, GetQueryIntegrationParams, Integration } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Integration
 */
export declare const createIntegration: (createIntegrationDTO: CreateIntegrationDTO) => Promise<Integration>;
export declare const getCreateIntegrationMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Integration, TError, {
        data: CreateIntegrationDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Integration, TError, {
    data: CreateIntegrationDTO;
}, TContext>;
export type CreateIntegrationMutationResult = NonNullable<Awaited<ReturnType<typeof createIntegration>>>;
export type CreateIntegrationMutationBody = CreateIntegrationDTO;
export type CreateIntegrationMutationError = void;
/**
* @summary Create Integration
*/
export declare const useCreateIntegration: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Integration, TError, {
        data: CreateIntegrationDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Integration, TError, {
    data: CreateIntegrationDTO;
}, TContext>;
/**
* @summary Get all Integrations
*/
export declare const getAllIntegration: (signal?: AbortSignal) => Promise<Integration[]>;
export declare const getGetAllIntegrationQueryKey: () => readonly ["/integration"];
export declare const getGetAllIntegrationQueryOptions: <TData = Integration[], TError = void>(options?: {
    query?: UseQueryOptions<Integration[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Integration[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllIntegrationQueryResult = NonNullable<Awaited<ReturnType<typeof getAllIntegration>>>;
export type GetAllIntegrationQueryError = void;
/**
 * @summary Get all Integrations
 */
export declare const useGetAllIntegration: <TData = Integration[], TError = void>(options?: {
    query?: UseQueryOptions<Integration[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Integrations
 */
export declare const getQueryIntegration: (params?: GetQueryIntegrationParams, signal?: AbortSignal) => Promise<Integration[]>;
export declare const getGetQueryIntegrationQueryKey: (params?: GetQueryIntegrationParams) => readonly ["/integration/query", ...GetQueryIntegrationParams[]];
export declare const getGetQueryIntegrationQueryOptions: <TData = Integration[], TError = void>(params?: GetQueryIntegrationParams, options?: {
    query?: UseQueryOptions<Integration[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Integration[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryIntegrationQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryIntegration>>>;
export type GetQueryIntegrationQueryError = void;
/**
 * @summary Get all Integrations
 */
export declare const useGetQueryIntegration: <TData = Integration[], TError = void>(params?: GetQueryIntegrationParams, options?: {
    query?: UseQueryOptions<Integration[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Integrations
 */
export declare const getCountIntegration: (params?: GetCountIntegrationParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountIntegrationQueryKey: (params?: GetCountIntegrationParams) => readonly ["/integration/count", ...GetCountIntegrationParams[]];
export declare const getGetCountIntegrationQueryOptions: <TData = number, TError = void>(params?: GetCountIntegrationParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountIntegrationQueryResult = NonNullable<Awaited<ReturnType<typeof getCountIntegration>>>;
export type GetCountIntegrationQueryError = void;
/**
 * @summary Get count of Integrations
 */
export declare const useGetCountIntegration: <TData = number, TError = void>(params?: GetCountIntegrationParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Integration
 */
export declare const getOneIntegration: (id: number, signal?: AbortSignal) => Promise<Integration>;
export declare const getGetOneIntegrationQueryKey: (id: number) => readonly [`/integration/${number}`];
export declare const getGetOneIntegrationQueryOptions: <TData = Integration, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Integration, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Integration, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneIntegrationQueryResult = NonNullable<Awaited<ReturnType<typeof getOneIntegration>>>;
export type GetOneIntegrationQueryError = void;
/**
 * @summary Get one Integration
 */
export declare const useGetOneIntegration: <TData = Integration, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Integration, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Integration
 */
export declare const updateOneIntegration: (id: number, integration: Integration) => Promise<void>;
export declare const getUpdateOneIntegrationMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Integration;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Integration;
}, TContext>;
export type UpdateOneIntegrationMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneIntegration>>>;
export type UpdateOneIntegrationMutationBody = Integration;
export type UpdateOneIntegrationMutationError = void;
/**
* @summary Update one Integration
*/
export declare const useUpdateOneIntegration: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Integration;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Integration;
}, TContext>;
/**
* @summary Delete one Integration
*/
export declare const deleteOneIntegration: (id: number) => Promise<void>;
export declare const getDeleteOneIntegrationMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneIntegrationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneIntegration>>>;
export type DeleteOneIntegrationMutationError = void;
/**
* @summary Delete one Integration
*/
export declare const useDeleteOneIntegration: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Integration
*/
export declare const uploadIntegration: () => Promise<void>;
export declare const getUploadIntegrationMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadIntegrationMutationResult = NonNullable<Awaited<ReturnType<typeof uploadIntegration>>>;
export type UploadIntegrationMutationError = void;
/**
* @summary Upload a file for Integration
*/
export declare const useUploadIntegration: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Integration
*/
export declare const downloadIntegration: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadIntegrationQueryKey: (filename: string) => readonly [`/integration/download/${string}`];
export declare const getDownloadIntegrationQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadIntegrationQueryResult = NonNullable<Awaited<ReturnType<typeof downloadIntegration>>>;
export type DownloadIntegrationQueryError = void;
/**
 * @summary Download file related to Integration
 */
export declare const useDownloadIntegration: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
