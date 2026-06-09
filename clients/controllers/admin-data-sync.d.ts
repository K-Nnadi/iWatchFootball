import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { DataSyncRunDto } from './iWatchFootballAPI.schemas';
/**
 * Runs StatsBomb (optional) then API-Sports steps under a shared maxApiRequests budget. When Redis is configured, defaults to async (BullMQ) to avoid HTTP timeouts; poll GET /admin/data-sync/jobs/:id. Use resumeJobId to continue checkpoints after partial runs or crashes.
 * @summary One-click bulk sync (StatsBomb + budgeted API-Sports)
 */
export declare const dataSyncControllerRun: (dataSyncRunDto: DataSyncRunDto) => Promise<void>;
export declare const getDataSyncControllerRunMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: DataSyncRunDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: DataSyncRunDto;
}, TContext>;
export type DataSyncControllerRunMutationResult = NonNullable<Awaited<ReturnType<typeof dataSyncControllerRun>>>;
export type DataSyncControllerRunMutationBody = DataSyncRunDto;
export type DataSyncControllerRunMutationError = unknown;
/**
* @summary One-click bulk sync (StatsBomb + budgeted API-Sports)
*/
export declare const useDataSyncControllerRun: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: DataSyncRunDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: DataSyncRunDto;
}, TContext>;
/**
* @summary Get sync job, steps, and cursors
*/
export declare const dataSyncControllerGetJob: (id: number, signal?: AbortSignal) => Promise<void>;
export declare const getDataSyncControllerGetJobQueryKey: (id: number) => readonly [`/admin/data-sync/jobs/${number}`];
export declare const getDataSyncControllerGetJobQueryOptions: <TData = void, TError = unknown>(id: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type DataSyncControllerGetJobQueryResult = NonNullable<Awaited<ReturnType<typeof dataSyncControllerGetJob>>>;
export type DataSyncControllerGetJobQueryError = unknown;
/**
 * @summary Get sync job, steps, and cursors
 */
export declare const useDataSyncControllerGetJob: <TData = void, TError = unknown>(id: number, options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
