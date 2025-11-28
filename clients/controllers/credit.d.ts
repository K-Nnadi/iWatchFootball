import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateCreditDTO, Credit, GetCountCreditParams, GetQueryCreditParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Credit
 */
export declare const createCredit: (createCreditDTO: CreateCreditDTO) => Promise<Credit>;
export declare const getCreateCreditMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Credit, TError, {
        data: CreateCreditDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Credit, TError, {
    data: CreateCreditDTO;
}, TContext>;
export type CreateCreditMutationResult = NonNullable<Awaited<ReturnType<typeof createCredit>>>;
export type CreateCreditMutationBody = CreateCreditDTO;
export type CreateCreditMutationError = void;
/**
* @summary Create Credit
*/
export declare const useCreateCredit: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Credit, TError, {
        data: CreateCreditDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Credit, TError, {
    data: CreateCreditDTO;
}, TContext>;
/**
* @summary Get all Credits
*/
export declare const getAllCredit: (signal?: AbortSignal) => Promise<Credit[]>;
export declare const getGetAllCreditQueryKey: () => readonly ["/credit"];
export declare const getGetAllCreditQueryOptions: <TData = Credit[], TError = void>(options?: {
    query?: UseQueryOptions<Credit[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Credit[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllCreditQueryResult = NonNullable<Awaited<ReturnType<typeof getAllCredit>>>;
export type GetAllCreditQueryError = void;
/**
 * @summary Get all Credits
 */
export declare const useGetAllCredit: <TData = Credit[], TError = void>(options?: {
    query?: UseQueryOptions<Credit[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Credits
 */
export declare const getQueryCredit: (params?: GetQueryCreditParams, signal?: AbortSignal) => Promise<Credit[]>;
export declare const getGetQueryCreditQueryKey: (params?: GetQueryCreditParams) => readonly ["/credit/query", ...GetQueryCreditParams[]];
export declare const getGetQueryCreditQueryOptions: <TData = Credit[], TError = void>(params?: GetQueryCreditParams, options?: {
    query?: UseQueryOptions<Credit[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Credit[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryCreditQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryCredit>>>;
export type GetQueryCreditQueryError = void;
/**
 * @summary Get all Credits
 */
export declare const useGetQueryCredit: <TData = Credit[], TError = void>(params?: GetQueryCreditParams, options?: {
    query?: UseQueryOptions<Credit[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Credits
 */
export declare const getCountCredit: (params?: GetCountCreditParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountCreditQueryKey: (params?: GetCountCreditParams) => readonly ["/credit/count", ...GetCountCreditParams[]];
export declare const getGetCountCreditQueryOptions: <TData = number, TError = void>(params?: GetCountCreditParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountCreditQueryResult = NonNullable<Awaited<ReturnType<typeof getCountCredit>>>;
export type GetCountCreditQueryError = void;
/**
 * @summary Get count of Credits
 */
export declare const useGetCountCredit: <TData = number, TError = void>(params?: GetCountCreditParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Credit
 */
export declare const getOneCredit: (id: number, signal?: AbortSignal) => Promise<Credit>;
export declare const getGetOneCreditQueryKey: (id: number) => readonly [`/credit/${number}`];
export declare const getGetOneCreditQueryOptions: <TData = Credit, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Credit, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Credit, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneCreditQueryResult = NonNullable<Awaited<ReturnType<typeof getOneCredit>>>;
export type GetOneCreditQueryError = void;
/**
 * @summary Get one Credit
 */
export declare const useGetOneCredit: <TData = Credit, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Credit, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Credit
 */
export declare const updateOneCredit: (id: number, credit: Credit) => Promise<void>;
export declare const getUpdateOneCreditMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Credit;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Credit;
}, TContext>;
export type UpdateOneCreditMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneCredit>>>;
export type UpdateOneCreditMutationBody = Credit;
export type UpdateOneCreditMutationError = void;
/**
* @summary Update one Credit
*/
export declare const useUpdateOneCredit: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Credit;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Credit;
}, TContext>;
/**
* @summary Delete one Credit
*/
export declare const deleteOneCredit: (id: number) => Promise<void>;
export declare const getDeleteOneCreditMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneCreditMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneCredit>>>;
export type DeleteOneCreditMutationError = void;
/**
* @summary Delete one Credit
*/
export declare const useDeleteOneCredit: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Credit
*/
export declare const uploadCredit: () => Promise<void>;
export declare const getUploadCreditMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadCreditMutationResult = NonNullable<Awaited<ReturnType<typeof uploadCredit>>>;
export type UploadCreditMutationError = void;
/**
* @summary Upload a file for Credit
*/
export declare const useUploadCredit: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Credit
*/
export declare const downloadCredit: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadCreditQueryKey: (filename: string) => readonly [`/credit/download/${string}`];
export declare const getDownloadCreditQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadCreditQueryResult = NonNullable<Awaited<ReturnType<typeof downloadCredit>>>;
export type DownloadCreditQueryError = void;
/**
 * @summary Download file related to Credit
 */
export declare const useDownloadCredit: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
