import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { DiscountCodeControllerCreateBody, DiscountCodeControllerValidateParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Validate a discount code for current user & order total
 */
export declare const discountCodeControllerValidate: (code: string, params: DiscountCodeControllerValidateParams, signal?: AbortSignal) => Promise<void>;
export declare const getDiscountCodeControllerValidateQueryKey: (code: string, params: DiscountCodeControllerValidateParams) => readonly [`/discount-code/validate/${string}`, ...DiscountCodeControllerValidateParams[]];
export declare const getDiscountCodeControllerValidateQueryOptions: <TData = void, TError = void>(code: string, params: DiscountCodeControllerValidateParams, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DiscountCodeControllerValidateQueryResult = NonNullable<Awaited<ReturnType<typeof discountCodeControllerValidate>>>;
export type DiscountCodeControllerValidateQueryError = void;
/**
 * @summary Validate a discount code for current user & order total
 */
export declare const useDiscountCodeControllerValidate: <TData = void, TError = void>(code: string, params: DiscountCodeControllerValidateParams, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin: list all discount codes
 */
export declare const discountCodeControllerFindAll: (signal?: AbortSignal) => Promise<void>;
export declare const getDiscountCodeControllerFindAllQueryKey: () => readonly ["/discount-code"];
export declare const getDiscountCodeControllerFindAllQueryOptions: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DiscountCodeControllerFindAllQueryResult = NonNullable<Awaited<ReturnType<typeof discountCodeControllerFindAll>>>;
export type DiscountCodeControllerFindAllQueryError = void;
/**
 * @summary Admin: list all discount codes
 */
export declare const useDiscountCodeControllerFindAll: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Admin: create a discount code
 */
export declare const discountCodeControllerCreate: (discountCodeControllerCreateBody: DiscountCodeControllerCreateBody) => Promise<void>;
export declare const getDiscountCodeControllerCreateMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: DiscountCodeControllerCreateBody;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: DiscountCodeControllerCreateBody;
}, TContext>;
export type DiscountCodeControllerCreateMutationResult = NonNullable<Awaited<ReturnType<typeof discountCodeControllerCreate>>>;
export type DiscountCodeControllerCreateMutationBody = DiscountCodeControllerCreateBody;
export type DiscountCodeControllerCreateMutationError = void;
/**
* @summary Admin: create a discount code
*/
export declare const useDiscountCodeControllerCreate: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: DiscountCodeControllerCreateBody;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: DiscountCodeControllerCreateBody;
}, TContext>;
/**
* @summary Admin: toggle a discount code active/inactive
*/
export declare const discountCodeControllerToggle: (id: number) => Promise<void>;
export declare const getDiscountCodeControllerToggleMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DiscountCodeControllerToggleMutationResult = NonNullable<Awaited<ReturnType<typeof discountCodeControllerToggle>>>;
export type DiscountCodeControllerToggleMutationError = void;
/**
* @summary Admin: toggle a discount code active/inactive
*/
export declare const useDiscountCodeControllerToggle: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
