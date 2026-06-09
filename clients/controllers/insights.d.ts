import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { StreamFixtureInsightDto } from './iWatchFootballAPI.schemas';
/**
 * @summary List configured LLM integrations (staff)
 */
export declare const insightsControllerListLlm: (signal?: AbortSignal) => Promise<void>;
export declare const getInsightsControllerListLlmQueryKey: () => readonly ["/insights/integrations/llm"];
export declare const getInsightsControllerListLlmQueryOptions: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<void, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type InsightsControllerListLlmQueryResult = NonNullable<Awaited<ReturnType<typeof insightsControllerListLlm>>>;
export type InsightsControllerListLlmQueryError = unknown;
/**
 * @summary List configured LLM integrations (staff)
 */
export declare const useInsightsControllerListLlm: <TData = void, TError = unknown>(options?: {
    query?: UseQueryOptions<void, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Stream AI match insight as SSE
 */
export declare const insightsControllerStreamFixtureInsight: (fixtureId: number, streamFixtureInsightDto?: StreamFixtureInsightDto) => Promise<void>;
export declare const getInsightsControllerStreamFixtureInsightMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        fixtureId: number;
        data: StreamFixtureInsightDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    fixtureId: number;
    data: StreamFixtureInsightDto;
}, TContext>;
export type InsightsControllerStreamFixtureInsightMutationResult = NonNullable<Awaited<ReturnType<typeof insightsControllerStreamFixtureInsight>>>;
export type InsightsControllerStreamFixtureInsightMutationBody = StreamFixtureInsightDto;
export type InsightsControllerStreamFixtureInsightMutationError = unknown;
/**
* @summary Stream AI match insight as SSE
*/
export declare const useInsightsControllerStreamFixtureInsight: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        fixtureId: number;
        data: StreamFixtureInsightDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    fixtureId: number;
    data: StreamFixtureInsightDto;
}, TContext>;
