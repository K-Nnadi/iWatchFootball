import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateNewsArticleDTO, GetCountNewsArticleParams, GetQueryNewsArticleParams, NewsArticle } from './iWatchFootballAPI.schemas';
/**
 * @summary Create NewsArticle
 */
export declare const createNewsArticle: (createNewsArticleDTO: CreateNewsArticleDTO) => Promise<NewsArticle>;
export declare const getCreateNewsArticleMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<NewsArticle, TError, {
        data: CreateNewsArticleDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<NewsArticle, TError, {
    data: CreateNewsArticleDTO;
}, TContext>;
export type CreateNewsArticleMutationResult = NonNullable<Awaited<ReturnType<typeof createNewsArticle>>>;
export type CreateNewsArticleMutationBody = CreateNewsArticleDTO;
export type CreateNewsArticleMutationError = void;
/**
* @summary Create NewsArticle
*/
export declare const useCreateNewsArticle: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<NewsArticle, TError, {
        data: CreateNewsArticleDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<NewsArticle, TError, {
    data: CreateNewsArticleDTO;
}, TContext>;
/**
* @summary Get all NewsArticles
*/
export declare const getAllNewsArticle: (signal?: AbortSignal) => Promise<NewsArticle[]>;
export declare const getGetAllNewsArticleQueryKey: () => readonly ["/newsArticle"];
export declare const getGetAllNewsArticleQueryOptions: <TData = NewsArticle[], TError = void>(options?: {
    query?: UseQueryOptions<NewsArticle[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<NewsArticle[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllNewsArticleQueryResult = NonNullable<Awaited<ReturnType<typeof getAllNewsArticle>>>;
export type GetAllNewsArticleQueryError = void;
/**
 * @summary Get all NewsArticles
 */
export declare const useGetAllNewsArticle: <TData = NewsArticle[], TError = void>(options?: {
    query?: UseQueryOptions<NewsArticle[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all NewsArticles
 */
export declare const getQueryNewsArticle: (params?: GetQueryNewsArticleParams, signal?: AbortSignal) => Promise<NewsArticle[]>;
export declare const getGetQueryNewsArticleQueryKey: (params?: GetQueryNewsArticleParams) => readonly ["/newsArticle/query", ...GetQueryNewsArticleParams[]];
export declare const getGetQueryNewsArticleQueryOptions: <TData = NewsArticle[], TError = void>(params?: GetQueryNewsArticleParams, options?: {
    query?: UseQueryOptions<NewsArticle[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<NewsArticle[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryNewsArticleQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryNewsArticle>>>;
export type GetQueryNewsArticleQueryError = void;
/**
 * @summary Get all NewsArticles
 */
export declare const useGetQueryNewsArticle: <TData = NewsArticle[], TError = void>(params?: GetQueryNewsArticleParams, options?: {
    query?: UseQueryOptions<NewsArticle[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of NewsArticles
 */
export declare const getCountNewsArticle: (params?: GetCountNewsArticleParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountNewsArticleQueryKey: (params?: GetCountNewsArticleParams) => readonly ["/newsArticle/count", ...GetCountNewsArticleParams[]];
export declare const getGetCountNewsArticleQueryOptions: <TData = number, TError = void>(params?: GetCountNewsArticleParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountNewsArticleQueryResult = NonNullable<Awaited<ReturnType<typeof getCountNewsArticle>>>;
export type GetCountNewsArticleQueryError = void;
/**
 * @summary Get count of NewsArticles
 */
export declare const useGetCountNewsArticle: <TData = number, TError = void>(params?: GetCountNewsArticleParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one NewsArticle
 */
export declare const getOneNewsArticle: (id: number, signal?: AbortSignal) => Promise<NewsArticle>;
export declare const getGetOneNewsArticleQueryKey: (id: number) => readonly [`/newsArticle/${number}`];
export declare const getGetOneNewsArticleQueryOptions: <TData = NewsArticle, TError = void>(id: number, options?: {
    query?: UseQueryOptions<NewsArticle, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<NewsArticle, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneNewsArticleQueryResult = NonNullable<Awaited<ReturnType<typeof getOneNewsArticle>>>;
export type GetOneNewsArticleQueryError = void;
/**
 * @summary Get one NewsArticle
 */
export declare const useGetOneNewsArticle: <TData = NewsArticle, TError = void>(id: number, options?: {
    query?: UseQueryOptions<NewsArticle, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one NewsArticle
 */
export declare const updateOneNewsArticle: (id: number, newsArticle: NewsArticle) => Promise<void>;
export declare const getUpdateOneNewsArticleMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: NewsArticle;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: NewsArticle;
}, TContext>;
export type UpdateOneNewsArticleMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneNewsArticle>>>;
export type UpdateOneNewsArticleMutationBody = NewsArticle;
export type UpdateOneNewsArticleMutationError = void;
/**
* @summary Update one NewsArticle
*/
export declare const useUpdateOneNewsArticle: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: NewsArticle;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: NewsArticle;
}, TContext>;
/**
* @summary Delete one NewsArticle
*/
export declare const deleteOneNewsArticle: (id: number) => Promise<void>;
export declare const getDeleteOneNewsArticleMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneNewsArticleMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneNewsArticle>>>;
export type DeleteOneNewsArticleMutationError = void;
/**
* @summary Delete one NewsArticle
*/
export declare const useDeleteOneNewsArticle: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for NewsArticle
*/
export declare const uploadNewsArticle: () => Promise<void>;
export declare const getUploadNewsArticleMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadNewsArticleMutationResult = NonNullable<Awaited<ReturnType<typeof uploadNewsArticle>>>;
export type UploadNewsArticleMutationError = void;
/**
* @summary Upload a file for NewsArticle
*/
export declare const useUploadNewsArticle: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to NewsArticle
*/
export declare const downloadNewsArticle: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadNewsArticleQueryKey: (filename: string) => readonly [`/newsArticle/download/${string}`];
export declare const getDownloadNewsArticleQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadNewsArticleQueryResult = NonNullable<Awaited<ReturnType<typeof downloadNewsArticle>>>;
export type DownloadNewsArticleQueryError = void;
/**
 * @summary Download file related to NewsArticle
 */
export declare const useDownloadNewsArticle: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
