import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AcquireTicketHoldDto, ReleaseTicketHoldDto, TicketHoldControllerAcquire200, TicketHoldControllerVerifyParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Reserve a listing exclusively until expiry or checkout
 */
export declare const ticketHoldControllerAcquire: (acquireTicketHoldDto: AcquireTicketHoldDto) => Promise<TicketHoldControllerAcquire200>;
export declare const getTicketHoldControllerAcquireMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<TicketHoldControllerAcquire200, TError, {
        data: AcquireTicketHoldDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<TicketHoldControllerAcquire200, TError, {
    data: AcquireTicketHoldDto;
}, TContext>;
export type TicketHoldControllerAcquireMutationResult = NonNullable<Awaited<ReturnType<typeof ticketHoldControllerAcquire>>>;
export type TicketHoldControllerAcquireMutationBody = AcquireTicketHoldDto;
export type TicketHoldControllerAcquireMutationError = void;
/**
* @summary Reserve a listing exclusively until expiry or checkout
*/
export declare const useTicketHoldControllerAcquire: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<TicketHoldControllerAcquire200, TError, {
        data: AcquireTicketHoldDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<TicketHoldControllerAcquire200, TError, {
    data: AcquireTicketHoldDto;
}, TContext>;
/**
* @summary Cancel reservation (timeout or user abandoned)
*/
export declare const ticketHoldControllerRelease: (releaseTicketHoldDto: ReleaseTicketHoldDto) => Promise<void>;
export declare const getTicketHoldControllerReleaseMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ReleaseTicketHoldDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: ReleaseTicketHoldDto;
}, TContext>;
export type TicketHoldControllerReleaseMutationResult = NonNullable<Awaited<ReturnType<typeof ticketHoldControllerRelease>>>;
export type TicketHoldControllerReleaseMutationBody = ReleaseTicketHoldDto;
export type TicketHoldControllerReleaseMutationError = void;
/**
* @summary Cancel reservation (timeout or user abandoned)
*/
export declare const useTicketHoldControllerRelease: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ReleaseTicketHoldDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: ReleaseTicketHoldDto;
}, TContext>;
/**
* @summary Check reservation is still valid during checkout
*/
export declare const ticketHoldControllerVerify: (params: TicketHoldControllerVerifyParams, signal?: AbortSignal) => Promise<void>;
export declare const getTicketHoldControllerVerifyQueryKey: (params: TicketHoldControllerVerifyParams) => readonly ["/ticket-hold/verify", ...TicketHoldControllerVerifyParams[]];
export declare const getTicketHoldControllerVerifyQueryOptions: <TData = void, TError = void>(params: TicketHoldControllerVerifyParams, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type TicketHoldControllerVerifyQueryResult = NonNullable<Awaited<ReturnType<typeof ticketHoldControllerVerify>>>;
export type TicketHoldControllerVerifyQueryError = void;
/**
 * @summary Check reservation is still valid during checkout
 */
export declare const useTicketHoldControllerVerify: <TData = void, TError = void>(params: TicketHoldControllerVerifyParams, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
