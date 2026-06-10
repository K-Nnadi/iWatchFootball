import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ConfirmMarketplacePurchaseDto, CreateListingDto, MarketplaceCheckoutControllerConfirmPurchase200, MarketplaceCheckoutControllerGetFeePreview200, MarketplaceCheckoutControllerHoldListing200, MarketplaceListingControllerCancelListing200, MarketplaceListingControllerGetListings200, MarketplaceListingControllerGetListingsParams, UpdatePlatformConfigDto } from './iWatchFootballAPI.schemas';
/**
 * @summary Browse active marketplace listings
 */
export declare const marketplaceListingControllerGetListings: (params?: MarketplaceListingControllerGetListingsParams, signal?: AbortSignal) => Promise<MarketplaceListingControllerGetListings200>;
export declare const getMarketplaceListingControllerGetListingsQueryKey: (params?: MarketplaceListingControllerGetListingsParams) => readonly ["/marketplace/listings", ...MarketplaceListingControllerGetListingsParams[]];
export declare const getMarketplaceListingControllerGetListingsQueryOptions: <TData = MarketplaceListingControllerGetListings200, TError = void>(params?: MarketplaceListingControllerGetListingsParams, options?: {
    query?: UseQueryOptions<MarketplaceListingControllerGetListings200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<MarketplaceListingControllerGetListings200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type MarketplaceListingControllerGetListingsQueryResult = NonNullable<Awaited<ReturnType<typeof marketplaceListingControllerGetListings>>>;
export type MarketplaceListingControllerGetListingsQueryError = void;
/**
 * @summary Browse active marketplace listings
 */
export declare const useMarketplaceListingControllerGetListings: <TData = MarketplaceListingControllerGetListings200, TError = void>(params?: MarketplaceListingControllerGetListingsParams, options?: {
    query?: UseQueryOptions<MarketplaceListingControllerGetListings200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List an owned ticket for resale
 */
export declare const marketplaceListingControllerCreateListing: (createListingDto: CreateListingDto) => Promise<void>;
export declare const getMarketplaceListingControllerCreateListingMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: CreateListingDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: CreateListingDto;
}, TContext>;
export type MarketplaceListingControllerCreateListingMutationResult = NonNullable<Awaited<ReturnType<typeof marketplaceListingControllerCreateListing>>>;
export type MarketplaceListingControllerCreateListingMutationBody = CreateListingDto;
export type MarketplaceListingControllerCreateListingMutationError = void;
/**
* @summary List an owned ticket for resale
*/
export declare const useMarketplaceListingControllerCreateListing: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: CreateListingDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: CreateListingDto;
}, TContext>;
/**
* @summary Get the authenticated user's own listings
*/
export declare const marketplaceListingControllerGetMyListings: (signal?: AbortSignal) => Promise<void>;
export declare const getMarketplaceListingControllerGetMyListingsQueryKey: () => readonly ["/marketplace/listings/my"];
export declare const getMarketplaceListingControllerGetMyListingsQueryOptions: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type MarketplaceListingControllerGetMyListingsQueryResult = NonNullable<Awaited<ReturnType<typeof marketplaceListingControllerGetMyListings>>>;
export type MarketplaceListingControllerGetMyListingsQueryError = void;
/**
 * @summary Get the authenticated user's own listings
 */
export declare const useMarketplaceListingControllerGetMyListings: <TData = void, TError = void>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a single marketplace listing by id
 */
export declare const marketplaceListingControllerGetListing: (id: number, signal?: AbortSignal) => Promise<void>;
export declare const getMarketplaceListingControllerGetListingQueryKey: (id: number) => readonly [`/marketplace/listings/${number}`];
export declare const getMarketplaceListingControllerGetListingQueryOptions: <TData = void, TError = void>(id: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type MarketplaceListingControllerGetListingQueryResult = NonNullable<Awaited<ReturnType<typeof marketplaceListingControllerGetListing>>>;
export type MarketplaceListingControllerGetListingQueryError = void;
/**
 * @summary Get a single marketplace listing by id
 */
export declare const useMarketplaceListingControllerGetListing: <TData = void, TError = void>(id: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Cancel an active listing (seller only). Ticket returned to seller.
 */
export declare const marketplaceListingControllerCancelListing: (id: number) => Promise<MarketplaceListingControllerCancelListing200>;
export declare const getMarketplaceListingControllerCancelListingMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<MarketplaceListingControllerCancelListing200, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<MarketplaceListingControllerCancelListing200, TError, {
    id: number;
}, TContext>;
export type MarketplaceListingControllerCancelListingMutationResult = NonNullable<Awaited<ReturnType<typeof marketplaceListingControllerCancelListing>>>;
export type MarketplaceListingControllerCancelListingMutationError = void;
/**
* @summary Cancel an active listing (seller only). Ticket returned to seller.
*/
export declare const useMarketplaceListingControllerCancelListing: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<MarketplaceListingControllerCancelListing200, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<MarketplaceListingControllerCancelListing200, TError, {
    id: number;
}, TContext>;
/**
* @summary Reserve a listing exclusively before payment (15 min hold)
*/
export declare const marketplaceCheckoutControllerHoldListing: (listingId: number) => Promise<MarketplaceCheckoutControllerHoldListing200>;
export declare const getMarketplaceCheckoutControllerHoldListingMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<MarketplaceCheckoutControllerHoldListing200, TError, {
        listingId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<MarketplaceCheckoutControllerHoldListing200, TError, {
    listingId: number;
}, TContext>;
export type MarketplaceCheckoutControllerHoldListingMutationResult = NonNullable<Awaited<ReturnType<typeof marketplaceCheckoutControllerHoldListing>>>;
export type MarketplaceCheckoutControllerHoldListingMutationError = void;
/**
* @summary Reserve a listing exclusively before payment (15 min hold)
*/
export declare const useMarketplaceCheckoutControllerHoldListing: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<MarketplaceCheckoutControllerHoldListing200, TError, {
        listingId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<MarketplaceCheckoutControllerHoldListing200, TError, {
    listingId: number;
}, TContext>;
/**
* @summary Get the fee breakdown for a listing before purchasing
*/
export declare const marketplaceCheckoutControllerGetFeePreview: (listingId: number, signal?: AbortSignal) => Promise<MarketplaceCheckoutControllerGetFeePreview200>;
export declare const getMarketplaceCheckoutControllerGetFeePreviewQueryKey: (listingId: number) => readonly [`/marketplace/listings/${number}/fee-preview`];
export declare const getMarketplaceCheckoutControllerGetFeePreviewQueryOptions: <TData = MarketplaceCheckoutControllerGetFeePreview200, TError = void>(listingId: number, options?: {
    query?: UseQueryOptions<MarketplaceCheckoutControllerGetFeePreview200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<MarketplaceCheckoutControllerGetFeePreview200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type MarketplaceCheckoutControllerGetFeePreviewQueryResult = NonNullable<Awaited<ReturnType<typeof marketplaceCheckoutControllerGetFeePreview>>>;
export type MarketplaceCheckoutControllerGetFeePreviewQueryError = void;
/**
 * @summary Get the fee breakdown for a listing before purchasing
 */
export declare const useMarketplaceCheckoutControllerGetFeePreview: <TData = MarketplaceCheckoutControllerGetFeePreview200, TError = void>(listingId: number, options?: {
    query?: UseQueryOptions<MarketplaceCheckoutControllerGetFeePreview200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Complete a marketplace ticket purchase (atomic: payment + ticket transfer + seller credit)
 */
export declare const marketplaceCheckoutControllerConfirmPurchase: (confirmMarketplacePurchaseDto: ConfirmMarketplacePurchaseDto) => Promise<MarketplaceCheckoutControllerConfirmPurchase200>;
export declare const getMarketplaceCheckoutControllerConfirmPurchaseMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<MarketplaceCheckoutControllerConfirmPurchase200, TError, {
        data: ConfirmMarketplacePurchaseDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<MarketplaceCheckoutControllerConfirmPurchase200, TError, {
    data: ConfirmMarketplacePurchaseDto;
}, TContext>;
export type MarketplaceCheckoutControllerConfirmPurchaseMutationResult = NonNullable<Awaited<ReturnType<typeof marketplaceCheckoutControllerConfirmPurchase>>>;
export type MarketplaceCheckoutControllerConfirmPurchaseMutationBody = ConfirmMarketplacePurchaseDto;
export type MarketplaceCheckoutControllerConfirmPurchaseMutationError = void;
/**
* @summary Complete a marketplace ticket purchase (atomic: payment + ticket transfer + seller credit)
*/
export declare const useMarketplaceCheckoutControllerConfirmPurchase: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<MarketplaceCheckoutControllerConfirmPurchase200, TError, {
        data: ConfirmMarketplacePurchaseDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<MarketplaceCheckoutControllerConfirmPurchase200, TError, {
    data: ConfirmMarketplacePurchaseDto;
}, TContext>;
/**
* @summary Update a platform config value (admin only)
*/
export declare const marketplaceCheckoutControllerUpdateConfig: (key: string, updatePlatformConfigDto: UpdatePlatformConfigDto) => Promise<void>;
export declare const getMarketplaceCheckoutControllerUpdateConfigMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        key: string;
        data: UpdatePlatformConfigDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    key: string;
    data: UpdatePlatformConfigDto;
}, TContext>;
export type MarketplaceCheckoutControllerUpdateConfigMutationResult = NonNullable<Awaited<ReturnType<typeof marketplaceCheckoutControllerUpdateConfig>>>;
export type MarketplaceCheckoutControllerUpdateConfigMutationBody = UpdatePlatformConfigDto;
export type MarketplaceCheckoutControllerUpdateConfigMutationError = void;
/**
* @summary Update a platform config value (admin only)
*/
export declare const useMarketplaceCheckoutControllerUpdateConfig: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        key: string;
        data: UpdatePlatformConfigDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    key: string;
    data: UpdatePlatformConfigDto;
}, TContext>;
