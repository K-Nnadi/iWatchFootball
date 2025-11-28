import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreatePaymentProviderDTO, GetCountPaymentProviderParams, GetQueryPaymentProviderParams, PaymentProvider } from './iWatchFootballAPI.schemas';
/**
 * @summary Create PaymentProvider
 */
export declare const createPaymentProvider: (createPaymentProviderDTO: CreatePaymentProviderDTO) => Promise<PaymentProvider>;
export declare const getCreatePaymentProviderMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<PaymentProvider, TError, {
        data: CreatePaymentProviderDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<PaymentProvider, TError, {
    data: CreatePaymentProviderDTO;
}, TContext>;
export type CreatePaymentProviderMutationResult = NonNullable<Awaited<ReturnType<typeof createPaymentProvider>>>;
export type CreatePaymentProviderMutationBody = CreatePaymentProviderDTO;
export type CreatePaymentProviderMutationError = void;
/**
* @summary Create PaymentProvider
*/
export declare const useCreatePaymentProvider: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<PaymentProvider, TError, {
        data: CreatePaymentProviderDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<PaymentProvider, TError, {
    data: CreatePaymentProviderDTO;
}, TContext>;
/**
* @summary Get all PaymentProviders
*/
export declare const getAllPaymentProvider: (signal?: AbortSignal) => Promise<PaymentProvider[]>;
export declare const getGetAllPaymentProviderQueryKey: () => readonly ["/paymentProvider"];
export declare const getGetAllPaymentProviderQueryOptions: <TData = PaymentProvider[], TError = void>(options?: {
    query?: UseQueryOptions<PaymentProvider[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PaymentProvider[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllPaymentProviderQueryResult = NonNullable<Awaited<ReturnType<typeof getAllPaymentProvider>>>;
export type GetAllPaymentProviderQueryError = void;
/**
 * @summary Get all PaymentProviders
 */
export declare const useGetAllPaymentProvider: <TData = PaymentProvider[], TError = void>(options?: {
    query?: UseQueryOptions<PaymentProvider[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all PaymentProviders
 */
export declare const getQueryPaymentProvider: (params?: GetQueryPaymentProviderParams, signal?: AbortSignal) => Promise<PaymentProvider[]>;
export declare const getGetQueryPaymentProviderQueryKey: (params?: GetQueryPaymentProviderParams) => readonly ["/paymentProvider/query", ...GetQueryPaymentProviderParams[]];
export declare const getGetQueryPaymentProviderQueryOptions: <TData = PaymentProvider[], TError = void>(params?: GetQueryPaymentProviderParams, options?: {
    query?: UseQueryOptions<PaymentProvider[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PaymentProvider[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryPaymentProviderQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryPaymentProvider>>>;
export type GetQueryPaymentProviderQueryError = void;
/**
 * @summary Get all PaymentProviders
 */
export declare const useGetQueryPaymentProvider: <TData = PaymentProvider[], TError = void>(params?: GetQueryPaymentProviderParams, options?: {
    query?: UseQueryOptions<PaymentProvider[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of PaymentProviders
 */
export declare const getCountPaymentProvider: (params?: GetCountPaymentProviderParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountPaymentProviderQueryKey: (params?: GetCountPaymentProviderParams) => readonly ["/paymentProvider/count", ...GetCountPaymentProviderParams[]];
export declare const getGetCountPaymentProviderQueryOptions: <TData = number, TError = void>(params?: GetCountPaymentProviderParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountPaymentProviderQueryResult = NonNullable<Awaited<ReturnType<typeof getCountPaymentProvider>>>;
export type GetCountPaymentProviderQueryError = void;
/**
 * @summary Get count of PaymentProviders
 */
export declare const useGetCountPaymentProvider: <TData = number, TError = void>(params?: GetCountPaymentProviderParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one PaymentProvider
 */
export declare const getOnePaymentProvider: (id: number, signal?: AbortSignal) => Promise<PaymentProvider>;
export declare const getGetOnePaymentProviderQueryKey: (id: number) => readonly [`/paymentProvider/${number}`];
export declare const getGetOnePaymentProviderQueryOptions: <TData = PaymentProvider, TError = void>(id: number, options?: {
    query?: UseQueryOptions<PaymentProvider, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<PaymentProvider, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOnePaymentProviderQueryResult = NonNullable<Awaited<ReturnType<typeof getOnePaymentProvider>>>;
export type GetOnePaymentProviderQueryError = void;
/**
 * @summary Get one PaymentProvider
 */
export declare const useGetOnePaymentProvider: <TData = PaymentProvider, TError = void>(id: number, options?: {
    query?: UseQueryOptions<PaymentProvider, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one PaymentProvider
 */
export declare const updateOnePaymentProvider: (id: number, paymentProvider: PaymentProvider) => Promise<void>;
export declare const getUpdateOnePaymentProviderMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: PaymentProvider;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: PaymentProvider;
}, TContext>;
export type UpdateOnePaymentProviderMutationResult = NonNullable<Awaited<ReturnType<typeof updateOnePaymentProvider>>>;
export type UpdateOnePaymentProviderMutationBody = PaymentProvider;
export type UpdateOnePaymentProviderMutationError = void;
/**
* @summary Update one PaymentProvider
*/
export declare const useUpdateOnePaymentProvider: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: PaymentProvider;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: PaymentProvider;
}, TContext>;
/**
* @summary Delete one PaymentProvider
*/
export declare const deleteOnePaymentProvider: (id: number) => Promise<void>;
export declare const getDeleteOnePaymentProviderMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOnePaymentProviderMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOnePaymentProvider>>>;
export type DeleteOnePaymentProviderMutationError = void;
/**
* @summary Delete one PaymentProvider
*/
export declare const useDeleteOnePaymentProvider: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for PaymentProvider
*/
export declare const uploadPaymentProvider: () => Promise<void>;
export declare const getUploadPaymentProviderMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadPaymentProviderMutationResult = NonNullable<Awaited<ReturnType<typeof uploadPaymentProvider>>>;
export type UploadPaymentProviderMutationError = void;
/**
* @summary Upload a file for PaymentProvider
*/
export declare const useUploadPaymentProvider: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to PaymentProvider
*/
export declare const downloadPaymentProvider: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadPaymentProviderQueryKey: (filename: string) => readonly [`/paymentProvider/download/${string}`];
export declare const getDownloadPaymentProviderQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadPaymentProviderQueryResult = NonNullable<Awaited<ReturnType<typeof downloadPaymentProvider>>>;
export type DownloadPaymentProviderQueryError = void;
/**
 * @summary Download file related to PaymentProvider
 */
export declare const useDownloadPaymentProvider: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
