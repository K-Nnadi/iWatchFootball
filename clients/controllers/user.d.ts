import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateUserDTO, GetCountUserParams, GetQueryUserParams, User } from './iWatchFootballAPI.schemas';
/**
 * @summary Create User
 */
export declare const createUser: (createUserDTO: CreateUserDTO) => Promise<User>;
export declare const getCreateUserMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<User, TError, {
        data: CreateUserDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<User, TError, {
    data: CreateUserDTO;
}, TContext>;
export type CreateUserMutationResult = NonNullable<Awaited<ReturnType<typeof createUser>>>;
export type CreateUserMutationBody = CreateUserDTO;
export type CreateUserMutationError = void;
/**
* @summary Create User
*/
export declare const useCreateUser: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<User, TError, {
        data: CreateUserDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<User, TError, {
    data: CreateUserDTO;
}, TContext>;
/**
* @summary Get all Users
*/
export declare const getAllUser: (signal?: AbortSignal) => Promise<User[]>;
export declare const getGetAllUserQueryKey: () => readonly ["/user"];
export declare const getGetAllUserQueryOptions: <TData = User[], TError = void>(options?: {
    query?: UseQueryOptions<User[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<User[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllUserQueryResult = NonNullable<Awaited<ReturnType<typeof getAllUser>>>;
export type GetAllUserQueryError = void;
/**
 * @summary Get all Users
 */
export declare const useGetAllUser: <TData = User[], TError = void>(options?: {
    query?: UseQueryOptions<User[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Users
 */
export declare const getQueryUser: (params?: GetQueryUserParams, signal?: AbortSignal) => Promise<User[]>;
export declare const getGetQueryUserQueryKey: (params?: GetQueryUserParams) => readonly ["/user/query", ...GetQueryUserParams[]];
export declare const getGetQueryUserQueryOptions: <TData = User[], TError = void>(params?: GetQueryUserParams, options?: {
    query?: UseQueryOptions<User[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<User[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryUserQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryUser>>>;
export type GetQueryUserQueryError = void;
/**
 * @summary Get all Users
 */
export declare const useGetQueryUser: <TData = User[], TError = void>(params?: GetQueryUserParams, options?: {
    query?: UseQueryOptions<User[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Users
 */
export declare const getCountUser: (params?: GetCountUserParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountUserQueryKey: (params?: GetCountUserParams) => readonly ["/user/count", ...GetCountUserParams[]];
export declare const getGetCountUserQueryOptions: <TData = number, TError = void>(params?: GetCountUserParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountUserQueryResult = NonNullable<Awaited<ReturnType<typeof getCountUser>>>;
export type GetCountUserQueryError = void;
/**
 * @summary Get count of Users
 */
export declare const useGetCountUser: <TData = number, TError = void>(params?: GetCountUserParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one User
 */
export declare const getOneUser: (id: number, signal?: AbortSignal) => Promise<User>;
export declare const getGetOneUserQueryKey: (id: number) => readonly [`/user/${number}`];
export declare const getGetOneUserQueryOptions: <TData = User, TError = void>(id: number, options?: {
    query?: UseQueryOptions<User, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<User, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneUserQueryResult = NonNullable<Awaited<ReturnType<typeof getOneUser>>>;
export type GetOneUserQueryError = void;
/**
 * @summary Get one User
 */
export declare const useGetOneUser: <TData = User, TError = void>(id: number, options?: {
    query?: UseQueryOptions<User, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one User
 */
export declare const updateOneUser: (id: number, user: User) => Promise<void>;
export declare const getUpdateOneUserMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: User;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: User;
}, TContext>;
export type UpdateOneUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneUser>>>;
export type UpdateOneUserMutationBody = User;
export type UpdateOneUserMutationError = void;
/**
* @summary Update one User
*/
export declare const useUpdateOneUser: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: User;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: User;
}, TContext>;
/**
* @summary Delete one User
*/
export declare const deleteOneUser: (id: number) => Promise<void>;
export declare const getDeleteOneUserMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneUser>>>;
export type DeleteOneUserMutationError = void;
/**
* @summary Delete one User
*/
export declare const useDeleteOneUser: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for User
*/
export declare const uploadUser: () => Promise<void>;
export declare const getUploadUserMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadUserMutationResult = NonNullable<Awaited<ReturnType<typeof uploadUser>>>;
export type UploadUserMutationError = void;
/**
* @summary Upload a file for User
*/
export declare const useUploadUser: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to User
*/
export declare const downloadUser: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadUserQueryKey: (filename: string) => readonly [`/user/download/${string}`];
export declare const getDownloadUserQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadUserQueryResult = NonNullable<Awaited<ReturnType<typeof downloadUser>>>;
export type DownloadUserQueryError = void;
/**
 * @summary Download file related to User
 */
export declare const useDownloadUser: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
