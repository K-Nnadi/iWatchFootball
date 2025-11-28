import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateTransferDTO, GetCountTransferParams, GetQueryTransferParams, Transfer } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Transfer
 */
export declare const createTransfer: (createTransferDTO: CreateTransferDTO) => Promise<Transfer>;
export declare const getCreateTransferMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Transfer, TError, {
        data: CreateTransferDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Transfer, TError, {
    data: CreateTransferDTO;
}, TContext>;
export type CreateTransferMutationResult = NonNullable<Awaited<ReturnType<typeof createTransfer>>>;
export type CreateTransferMutationBody = CreateTransferDTO;
export type CreateTransferMutationError = void;
/**
* @summary Create Transfer
*/
export declare const useCreateTransfer: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Transfer, TError, {
        data: CreateTransferDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Transfer, TError, {
    data: CreateTransferDTO;
}, TContext>;
/**
* @summary Get all Transfers
*/
export declare const getAllTransfer: (signal?: AbortSignal) => Promise<Transfer[]>;
export declare const getGetAllTransferQueryKey: () => readonly ["/transfer"];
export declare const getGetAllTransferQueryOptions: <TData = Transfer[], TError = void>(options?: {
    query?: UseQueryOptions<Transfer[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Transfer[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllTransferQueryResult = NonNullable<Awaited<ReturnType<typeof getAllTransfer>>>;
export type GetAllTransferQueryError = void;
/**
 * @summary Get all Transfers
 */
export declare const useGetAllTransfer: <TData = Transfer[], TError = void>(options?: {
    query?: UseQueryOptions<Transfer[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Transfers
 */
export declare const getQueryTransfer: (params?: GetQueryTransferParams, signal?: AbortSignal) => Promise<Transfer[]>;
export declare const getGetQueryTransferQueryKey: (params?: GetQueryTransferParams) => readonly ["/transfer/query", ...GetQueryTransferParams[]];
export declare const getGetQueryTransferQueryOptions: <TData = Transfer[], TError = void>(params?: GetQueryTransferParams, options?: {
    query?: UseQueryOptions<Transfer[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Transfer[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryTransferQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryTransfer>>>;
export type GetQueryTransferQueryError = void;
/**
 * @summary Get all Transfers
 */
export declare const useGetQueryTransfer: <TData = Transfer[], TError = void>(params?: GetQueryTransferParams, options?: {
    query?: UseQueryOptions<Transfer[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Transfers
 */
export declare const getCountTransfer: (params?: GetCountTransferParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountTransferQueryKey: (params?: GetCountTransferParams) => readonly ["/transfer/count", ...GetCountTransferParams[]];
export declare const getGetCountTransferQueryOptions: <TData = number, TError = void>(params?: GetCountTransferParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountTransferQueryResult = NonNullable<Awaited<ReturnType<typeof getCountTransfer>>>;
export type GetCountTransferQueryError = void;
/**
 * @summary Get count of Transfers
 */
export declare const useGetCountTransfer: <TData = number, TError = void>(params?: GetCountTransferParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Transfer
 */
export declare const getOneTransfer: (id: number, signal?: AbortSignal) => Promise<Transfer>;
export declare const getGetOneTransferQueryKey: (id: number) => readonly [`/transfer/${number}`];
export declare const getGetOneTransferQueryOptions: <TData = Transfer, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Transfer, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Transfer, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneTransferQueryResult = NonNullable<Awaited<ReturnType<typeof getOneTransfer>>>;
export type GetOneTransferQueryError = void;
/**
 * @summary Get one Transfer
 */
export declare const useGetOneTransfer: <TData = Transfer, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Transfer, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Transfer
 */
export declare const updateOneTransfer: (id: number, transfer: Transfer) => Promise<void>;
export declare const getUpdateOneTransferMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Transfer;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Transfer;
}, TContext>;
export type UpdateOneTransferMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneTransfer>>>;
export type UpdateOneTransferMutationBody = Transfer;
export type UpdateOneTransferMutationError = void;
/**
* @summary Update one Transfer
*/
export declare const useUpdateOneTransfer: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Transfer;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Transfer;
}, TContext>;
/**
* @summary Delete one Transfer
*/
export declare const deleteOneTransfer: (id: number) => Promise<void>;
export declare const getDeleteOneTransferMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneTransferMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneTransfer>>>;
export type DeleteOneTransferMutationError = void;
/**
* @summary Delete one Transfer
*/
export declare const useDeleteOneTransfer: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Transfer
*/
export declare const uploadTransfer: () => Promise<void>;
export declare const getUploadTransferMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadTransferMutationResult = NonNullable<Awaited<ReturnType<typeof uploadTransfer>>>;
export type UploadTransferMutationError = void;
/**
* @summary Upload a file for Transfer
*/
export declare const useUploadTransfer: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Transfer
*/
export declare const downloadTransfer: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadTransferQueryKey: (filename: string) => readonly [`/transfer/download/${string}`];
export declare const getDownloadTransferQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadTransferQueryResult = NonNullable<Awaited<ReturnType<typeof downloadTransfer>>>;
export type DownloadTransferQueryError = void;
/**
 * @summary Download file related to Transfer
 */
export declare const useDownloadTransfer: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
