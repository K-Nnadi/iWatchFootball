import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { CreateTicketDTO, GetCountTicketParams, GetQueryTicketParams, Ticket } from './iWatchFootballAPI.schemas';
/**
 * @summary Create Ticket
 */
export declare const createTicket: (createTicketDTO: CreateTicketDTO) => Promise<Ticket>;
export declare const getCreateTicketMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Ticket, TError, {
        data: CreateTicketDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<Ticket, TError, {
    data: CreateTicketDTO;
}, TContext>;
export type CreateTicketMutationResult = NonNullable<Awaited<ReturnType<typeof createTicket>>>;
export type CreateTicketMutationBody = CreateTicketDTO;
export type CreateTicketMutationError = void;
/**
* @summary Create Ticket
*/
export declare const useCreateTicket: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Ticket, TError, {
        data: CreateTicketDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<Ticket, TError, {
    data: CreateTicketDTO;
}, TContext>;
/**
* @summary Get all Tickets
*/
export declare const getAllTicket: (signal?: AbortSignal) => Promise<Ticket[]>;
export declare const getGetAllTicketQueryKey: () => readonly ["/ticket"];
export declare const getGetAllTicketQueryOptions: <TData = Ticket[], TError = void>(options?: {
    query?: UseQueryOptions<Ticket[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Ticket[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetAllTicketQueryResult = NonNullable<Awaited<ReturnType<typeof getAllTicket>>>;
export type GetAllTicketQueryError = void;
/**
 * @summary Get all Tickets
 */
export declare const useGetAllTicket: <TData = Ticket[], TError = void>(options?: {
    query?: UseQueryOptions<Ticket[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get all Tickets
 */
export declare const getQueryTicket: (params?: GetQueryTicketParams, signal?: AbortSignal) => Promise<Ticket[]>;
export declare const getGetQueryTicketQueryKey: (params?: GetQueryTicketParams) => readonly ["/ticket/query", ...GetQueryTicketParams[]];
export declare const getGetQueryTicketQueryOptions: <TData = Ticket[], TError = void>(params?: GetQueryTicketParams, options?: {
    query?: UseQueryOptions<Ticket[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Ticket[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetQueryTicketQueryResult = NonNullable<Awaited<ReturnType<typeof getQueryTicket>>>;
export type GetQueryTicketQueryError = void;
/**
 * @summary Get all Tickets
 */
export declare const useGetQueryTicket: <TData = Ticket[], TError = void>(params?: GetQueryTicketParams, options?: {
    query?: UseQueryOptions<Ticket[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get count of Tickets
 */
export declare const getCountTicket: (params?: GetCountTicketParams, signal?: AbortSignal) => Promise<number>;
export declare const getGetCountTicketQueryKey: (params?: GetCountTicketParams) => readonly ["/ticket/count", ...GetCountTicketParams[]];
export declare const getGetCountTicketQueryOptions: <TData = number, TError = void>(params?: GetCountTicketParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<number, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetCountTicketQueryResult = NonNullable<Awaited<ReturnType<typeof getCountTicket>>>;
export type GetCountTicketQueryError = void;
/**
 * @summary Get count of Tickets
 */
export declare const useGetCountTicket: <TData = number, TError = void>(params?: GetCountTicketParams, options?: {
    query?: UseQueryOptions<number, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get one Ticket
 */
export declare const getOneTicket: (id: number, signal?: AbortSignal) => Promise<Ticket>;
export declare const getGetOneTicketQueryKey: (id: number) => readonly [`/ticket/${number}`];
export declare const getGetOneTicketQueryOptions: <TData = Ticket, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Ticket, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<Ticket, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type GetOneTicketQueryResult = NonNullable<Awaited<ReturnType<typeof getOneTicket>>>;
export type GetOneTicketQueryError = void;
/**
 * @summary Get one Ticket
 */
export declare const useGetOneTicket: <TData = Ticket, TError = void>(id: number, options?: {
    query?: UseQueryOptions<Ticket, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update one Ticket
 */
export declare const updateOneTicket: (id: number, ticket: Ticket) => Promise<void>;
export declare const getUpdateOneTicketMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Ticket;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
    data: Ticket;
}, TContext>;
export type UpdateOneTicketMutationResult = NonNullable<Awaited<ReturnType<typeof updateOneTicket>>>;
export type UpdateOneTicketMutationBody = Ticket;
export type UpdateOneTicketMutationError = void;
/**
* @summary Update one Ticket
*/
export declare const useUpdateOneTicket: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
        data: Ticket;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
    data: Ticket;
}, TContext>;
/**
* @summary Delete one Ticket
*/
export declare const deleteOneTicket: (id: number) => Promise<void>;
export declare const getDeleteOneTicketMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    id: number;
}, TContext>;
export type DeleteOneTicketMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOneTicket>>>;
export type DeleteOneTicketMutationError = void;
/**
* @summary Delete one Ticket
*/
export declare const useDeleteOneTicket: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        id: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    id: number;
}, TContext>;
/**
* @summary Upload a file for Ticket
*/
export declare const uploadTicket: () => Promise<void>;
export declare const getUploadTicketMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type UploadTicketMutationResult = NonNullable<Awaited<ReturnType<typeof uploadTicket>>>;
export type UploadTicketMutationError = void;
/**
* @summary Upload a file for Ticket
*/
export declare const useUploadTicket: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Download file related to Ticket
*/
export declare const downloadTicket: (filename: string, signal?: AbortSignal) => Promise<void>;
export declare const getDownloadTicketQueryKey: (filename: string) => readonly [`/ticket/download/${string}`];
export declare const getDownloadTicketQueryOptions: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DownloadTicketQueryResult = NonNullable<Awaited<ReturnType<typeof downloadTicket>>>;
export type DownloadTicketQueryError = void;
/**
 * @summary Download file related to Ticket
 */
export declare const useDownloadTicket: <TData = void, TError = void>(filename: string, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
