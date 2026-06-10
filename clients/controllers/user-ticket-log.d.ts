import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { UserTicketLog } from './iWatchFootballAPI.schemas';
/**
 * @summary Get all tickets currently in the logged-in user's wallet
 */
export declare const userTicketLogControllerGetMyLogs: (signal?: AbortSignal) => Promise<UserTicketLog[]>;
export declare const getUserTicketLogControllerGetMyLogsQueryKey: () => readonly ["/user-ticket-log/my"];
export declare const getUserTicketLogControllerGetMyLogsQueryOptions: <TData = UserTicketLog[], TError = void>(options?: {
    query?: UseQueryOptions<UserTicketLog[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<UserTicketLog[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type UserTicketLogControllerGetMyLogsQueryResult = NonNullable<Awaited<ReturnType<typeof userTicketLogControllerGetMyLogs>>>;
export type UserTicketLogControllerGetMyLogsQueryError = void;
/**
 * @summary Get all tickets currently in the logged-in user's wallet
 */
export declare const useUserTicketLogControllerGetMyLogs: <TData = UserTicketLog[], TError = void>(options?: {
    query?: UseQueryOptions<UserTicketLog[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
