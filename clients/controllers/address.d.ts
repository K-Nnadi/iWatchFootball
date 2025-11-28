import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Address, CreateAddressDTO, GetCountAddressParams, GetQueryAddressParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Address
 */
export declare const createAddress: (createAddressDTO: CreateAddressDTO) => Promise<Address>;
export declare const getCreateAddressMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Address, TError, {
        data: CreateAddressDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Address, TError, {
    data: CreateAddressDTO;
}, TContext>;
export type CreateAddressMutationResult = NonNullable<Awaited<ReturnType<typeof createAddress>>>;
export type CreateAddressMutationBody = CreateAddressDTO;
export type CreateAddressMutationError = void;
/**
* @summary Create Address
*/
export declare const useCreateAddress: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Address, TError, {
        data: CreateAddressDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Address, TError, {
    data: CreateAddressDTO;
}, TContext>;
/**
* @summary Get all Addresss
*/
export declare const getAllAddress: (signal?: AbortSignal) => Promise<Address[]>;
export declare const getGetAllAddressQueryKey: () => readonly ["/address"];
export declare const getGetAllAddressQueryOptions: <TData = Address[], TError = void>(options?: {
    query?: UseQueryOptions<Address[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Address[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllAddressQueryResult = NonNullable<Awaited<ReturnType<typeof getAllAddress>>>;
export type GetAllAddressQueryError = void;
/**
 * @summary Get all Addresss
 */
export declare const useGetAllAddress: <TData = Address[], TError = void>(options?: {
    query?: UseQueryOptions<Address[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Addresss
 */
export declare const getQueryAddress: (params?: GetQueryAddressParams, signal?: AbortSignal) => Promise<Address[]>;
export declare const getGetQueryAddressQueryKey: (params?: GetQueryAddressParams) => readonly ["/address/query", ...GetQueryAddressParams[]];
export declare const getGetQueryAddressQueryOptions: <TData = Address[], TError = void>(params?: GetQueryAddressParams, options?: {
    query?: UseQueryOptions<Address[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Address[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryAddressQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryAddress>>>;
export type GetQueryAddressQueryError = void;
/**
 * @summary Get all Addresss
 */
export declare const useGetQueryAddress: <TData = Address[], TError = void>(params?: GetQueryAddressParams, options?: {
    query?: UseQueryOptions<Address[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Addresss
 */
export declare const getCountAddress: (params?: GetCountAddressParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountAddressQueryKey: (params?: GetCountAddressParams) => readonly ["/address/count", ...GetCountAddressParams[]];
export declare const getGetCountAddressQueryOptions: <TData = number, TError = void>(params?: GetCountAddressParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountAddressQueryResult = NonNullable<Awaited<ReturnType<typeof getCountAddress>>>;
export type GetCountAddressQueryError = void;
/**
 * @summary Get count of Addresss
 */
export declare const useGetCountAddress: <TData = number, TError = void>(params?: GetCountAddressParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Address
 */
export declare const getOneAddress: (id: number, signal?: AbortSignal) => Promise<Address>;
export declare const getGetOneAddressQueryKey: (id: number) => readonly [`/address/${number}`];
export declare const getGetOneAddressQueryOptions: <TData = Address, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Address, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Address, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneAddressQueryResult = NonNullable<Awaited<ReturnType<typeof getOneAddress>>>;
export type GetOneAddressQueryError = void;
/**
 * @summary Get one Address
 */
export declare const useGetOneAddress: <TData = Address, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Address, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Address
 */
export declare const updateOneAddress: (id: number, address: Address) => Promise<void>;
export declare const getUpdateOneAddressMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Address;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Address;
}, TContext>;
export type UpdateOneAddressMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneAddress>>>;
export type UpdateOneAddressMutationBody = Address;
export type UpdateOneAddressMutationError = void;
/**
* @summary Update one Address
*/
export declare const useUpdateOneAddress: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Address;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Address;
}, TContext>;
/**
* @summary Delete one Address
*/
export declare const deleteOneAddress: (id: number) => Promise<void>;
export declare const getDeleteOneAddressMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneAddressMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneAddress>>>;
export type DeleteOneAddressMutationError = void;
/**
* @summary Delete one Address
*/
export declare const useDeleteOneAddress: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Address
*/
export declare const uploadAddress: () => Promise<void>;
export declare const getUploadAddressMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadAddressMutationResult = NonNullable<Awaited<ReturnType<typeof uploadAddress>>>;
export type UploadAddressMutationError = void;
/**
* @summary Upload a file for Address
*/
export declare const useUploadAddress: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Address
*/
export declare const downloadAddress: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadAddressQueryKey: (filename: string) => readonly [`/address/download/${string}`];
export declare const getDownloadAddressQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadAddressQueryResult = NonNullable<Awaited<ReturnType<typeof downloadAddress>>>;
export type DownloadAddressQueryError = void;
/**
 * @summary Download file related to Address
 */
export declare const useDownloadAddress: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
