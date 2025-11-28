import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateFixtureDTO, Fixture, GetCountFixtureParams, GetQueryFixtureParams } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Fixture
 */
export declare const createFixture: (createFixtureDTO: CreateFixtureDTO) => Promise<Fixture>;
export declare const getCreateFixtureMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Fixture, TError, {
        data: CreateFixtureDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Fixture, TError, {
    data: CreateFixtureDTO;
}, TContext>;
export type CreateFixtureMutationResult = NonNullable<Awaited<ReturnType<typeof createFixture>>>;
export type CreateFixtureMutationBody = CreateFixtureDTO;
export type CreateFixtureMutationError = void;
/**
* @summary Create Fixture
*/
export declare const useCreateFixture: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Fixture, TError, {
        data: CreateFixtureDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Fixture, TError, {
    data: CreateFixtureDTO;
}, TContext>;
/**
* @summary Get all Fixtures
*/
export declare const getAllFixture: (signal?: AbortSignal) => Promise<Fixture[]>;
export declare const getGetAllFixtureQueryKey: () => readonly ["/fixture"];
export declare const getGetAllFixtureQueryOptions: <TData = Fixture[], TError = void>(options?: {
    query?: UseQueryOptions<Fixture[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Fixture[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllFixtureQueryResult = NonNullable<Awaited<ReturnType<typeof getAllFixture>>>;
export type GetAllFixtureQueryError = void;
/**
 * @summary Get all Fixtures
 */
export declare const useGetAllFixture: <TData = Fixture[], TError = void>(options?: {
    query?: UseQueryOptions<Fixture[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Fixtures
 */
export declare const getQueryFixture: (params?: GetQueryFixtureParams, signal?: AbortSignal) => Promise<Fixture[]>;
export declare const getGetQueryFixtureQueryKey: (params?: GetQueryFixtureParams) => readonly ["/fixture/query", ...GetQueryFixtureParams[]];
export declare const getGetQueryFixtureQueryOptions: <TData = Fixture[], TError = void>(params?: GetQueryFixtureParams, options?: {
    query?: UseQueryOptions<Fixture[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Fixture[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryFixtureQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryFixture>>>;
export type GetQueryFixtureQueryError = void;
/**
 * @summary Get all Fixtures
 */
export declare const useGetQueryFixture: <TData = Fixture[], TError = void>(params?: GetQueryFixtureParams, options?: {
    query?: UseQueryOptions<Fixture[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Fixtures
 */
export declare const getCountFixture: (params?: GetCountFixtureParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountFixtureQueryKey: (params?: GetCountFixtureParams) => readonly ["/fixture/count", ...GetCountFixtureParams[]];
export declare const getGetCountFixtureQueryOptions: <TData = number, TError = void>(params?: GetCountFixtureParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountFixtureQueryResult = NonNullable<Awaited<ReturnType<typeof getCountFixture>>>;
export type GetCountFixtureQueryError = void;
/**
 * @summary Get count of Fixtures
 */
export declare const useGetCountFixture: <TData = number, TError = void>(params?: GetCountFixtureParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Fixture
 */
export declare const getOneFixture: (id: number, signal?: AbortSignal) => Promise<Fixture>;
export declare const getGetOneFixtureQueryKey: (id: number) => readonly [`/fixture/${number}`];
export declare const getGetOneFixtureQueryOptions: <TData = Fixture, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Fixture, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Fixture, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneFixtureQueryResult = NonNullable<Awaited<ReturnType<typeof getOneFixture>>>;
export type GetOneFixtureQueryError = void;
/**
 * @summary Get one Fixture
 */
export declare const useGetOneFixture: <TData = Fixture, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Fixture, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Fixture
 */
export declare const updateOneFixture: (id: number, fixture: Fixture) => Promise<void>;
export declare const getUpdateOneFixtureMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Fixture;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Fixture;
}, TContext>;
export type UpdateOneFixtureMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneFixture>>>;
export type UpdateOneFixtureMutationBody = Fixture;
export type UpdateOneFixtureMutationError = void;
/**
* @summary Update one Fixture
*/
export declare const useUpdateOneFixture: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Fixture;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Fixture;
}, TContext>;
/**
* @summary Delete one Fixture
*/
export declare const deleteOneFixture: (id: number) => Promise<void>;
export declare const getDeleteOneFixtureMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneFixtureMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneFixture>>>;
export type DeleteOneFixtureMutationError = void;
/**
* @summary Delete one Fixture
*/
export declare const useDeleteOneFixture: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Fixture
*/
export declare const uploadFixture: () => Promise<void>;
export declare const getUploadFixtureMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadFixtureMutationResult = NonNullable<Awaited<ReturnType<typeof uploadFixture>>>;
export type UploadFixtureMutationError = void;
/**
* @summary Upload a file for Fixture
*/
export declare const useUploadFixture: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Fixture
*/
export declare const downloadFixture: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadFixtureQueryKey: (filename: string) => readonly [`/fixture/download/${string}`];
export declare const getDownloadFixtureQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadFixtureQueryResult = NonNullable<Awaited<ReturnType<typeof downloadFixture>>>;
export type DownloadFixtureQueryError = void;
/**
 * @summary Download file related to Fixture
 */
export declare const useDownloadFixture: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
