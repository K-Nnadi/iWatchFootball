import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { StatsBombControllerGetAvailableMatches200, StatsBombControllerGetSyncStatus200, StatsBombControllerSyncData200, StatsBombControllerTestSyncEventsOnly200, StatsBombControllerTestSyncPlayersOnly200, StatsBombControllerTestSyncSingleMatch200, StatsBombControllerTestSyncTeamsOnly200, StatsBombControllerTestTeamCreation200, StatsBombControllerTestTeamTypeDetection200Item, StatsBombSyncOptionsDTO } from './iWatchFootballAPI.schemas';
/**
 * Fetches data from StatsBomb Open Data repository and syncs it with the local database
 * @summary Sync StatsBomb data to database
 */
export declare const statsBombControllerSyncData: (statsBombSyncOptionsDTO: StatsBombSyncOptionsDTO) => Promise<StatsBombControllerSyncData200>;
export declare const getStatsBombControllerSyncDataMutationOptions: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerSyncData200, TError, {
        data: StatsBombSyncOptionsDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<StatsBombControllerSyncData200, TError, {
    data: StatsBombSyncOptionsDTO;
}, TContext>;
export type StatsBombControllerSyncDataMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerSyncData>>>;
export type StatsBombControllerSyncDataMutationBody = StatsBombSyncOptionsDTO;
export type StatsBombControllerSyncDataMutationError = void;
/**
* @summary Sync StatsBomb data to database
*/
export declare const useStatsBombControllerSyncData: <TError = void, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerSyncData200, TError, {
        data: StatsBombSyncOptionsDTO;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<StatsBombControllerSyncData200, TError, {
    data: StatsBombSyncOptionsDTO;
}, TContext>;
/**
* Returns current database statistics and sync status
* @summary Get sync status and statistics
*/
export declare const statsBombControllerGetSyncStatus: (signal?: AbortSignal) => Promise<StatsBombControllerGetSyncStatus200>;
export declare const getStatsBombControllerGetSyncStatusQueryKey: () => readonly ["/statsbomb/status"];
export declare const getStatsBombControllerGetSyncStatusQueryOptions: <TData = StatsBombControllerGetSyncStatus200, TError = unknown>(options?: {
    query?: UseQueryOptions<StatsBombControllerGetSyncStatus200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<StatsBombControllerGetSyncStatus200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type StatsBombControllerGetSyncStatusQueryResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerGetSyncStatus>>>;
export type StatsBombControllerGetSyncStatusQueryError = unknown;
/**
 * @summary Get sync status and statistics
 */
export declare const useStatsBombControllerGetSyncStatus: <TData = StatsBombControllerGetSyncStatus200, TError = unknown>(options?: {
    query?: UseQueryOptions<StatsBombControllerGetSyncStatus200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Fetches and syncs only competition data from StatsBomb
 * @summary Sync competitions only
 */
export declare const statsBombControllerSyncCompetitions: () => Promise<void>;
export declare const getStatsBombControllerSyncCompetitionsMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type StatsBombControllerSyncCompetitionsMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerSyncCompetitions>>>;
export type StatsBombControllerSyncCompetitionsMutationError = unknown;
/**
* @summary Sync competitions only
*/
export declare const useStatsBombControllerSyncCompetitions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* Fetches and syncs only team and player data from StatsBomb
* @summary Sync teams and players only
*/
export declare const statsBombControllerSyncTeams: () => Promise<void>;
export declare const getStatsBombControllerSyncTeamsMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type StatsBombControllerSyncTeamsMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerSyncTeams>>>;
export type StatsBombControllerSyncTeamsMutationError = unknown;
/**
* @summary Sync teams and players only
*/
export declare const useStatsBombControllerSyncTeams: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* Fetches and syncs only fixture data from StatsBomb
* @summary Sync fixtures only
*/
export declare const statsBombControllerSyncFixtures: () => Promise<void>;
export declare const getStatsBombControllerSyncFixturesMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type StatsBombControllerSyncFixturesMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerSyncFixtures>>>;
export type StatsBombControllerSyncFixturesMutationError = unknown;
/**
* @summary Sync fixtures only
*/
export declare const useStatsBombControllerSyncFixtures: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* Tests the team type detection logic with sample data to verify it correctly identifies club vs country teams
* @summary Test team type detection
*/
export declare const statsBombControllerTestTeamTypeDetection: (signal?: AbortSignal) => Promise<StatsBombControllerTestTeamTypeDetection200Item[]>;
export declare const getStatsBombControllerTestTeamTypeDetectionQueryKey: () => readonly ["/statsbomb/test/team-types"];
export declare const getStatsBombControllerTestTeamTypeDetectionQueryOptions: <TData = StatsBombControllerTestTeamTypeDetection200Item[], TError = unknown>(options?: {
    query?: UseQueryOptions<StatsBombControllerTestTeamTypeDetection200Item[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<StatsBombControllerTestTeamTypeDetection200Item[], TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type StatsBombControllerTestTeamTypeDetectionQueryResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerTestTeamTypeDetection>>>;
export type StatsBombControllerTestTeamTypeDetectionQueryError = unknown;
/**
 * @summary Test team type detection
 */
export declare const useStatsBombControllerTestTeamTypeDetection: <TData = StatsBombControllerTestTeamTypeDetection200Item[], TError = unknown>(options?: {
    query?: UseQueryOptions<StatsBombControllerTestTeamTypeDetection200Item[], TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Tests the team creation functionality to verify it works correctly
 * @summary Test team creation
 */
export declare const statsBombControllerTestTeamCreation: () => Promise<StatsBombControllerTestTeamCreation200>;
export declare const getStatsBombControllerTestTeamCreationMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestTeamCreation200, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<StatsBombControllerTestTeamCreation200, TError, void, TContext>;
export type StatsBombControllerTestTeamCreationMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerTestTeamCreation>>>;
export type StatsBombControllerTestTeamCreationMutationError = unknown;
/**
* @summary Test team creation
*/
export declare const useStatsBombControllerTestTeamCreation: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestTeamCreation200, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<StatsBombControllerTestTeamCreation200, TError, void, TContext>;
/**
* Tests syncing only teams from StatsBomb data to verify the process works
* @summary Test sync teams only
*/
export declare const statsBombControllerTestSyncTeamsOnly: () => Promise<StatsBombControllerTestSyncTeamsOnly200>;
export declare const getStatsBombControllerTestSyncTeamsOnlyMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestSyncTeamsOnly200, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<StatsBombControllerTestSyncTeamsOnly200, TError, void, TContext>;
export type StatsBombControllerTestSyncTeamsOnlyMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerTestSyncTeamsOnly>>>;
export type StatsBombControllerTestSyncTeamsOnlyMutationError = unknown;
/**
* @summary Test sync teams only
*/
export declare const useStatsBombControllerTestSyncTeamsOnly: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestSyncTeamsOnly200, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<StatsBombControllerTestSyncTeamsOnly200, TError, void, TContext>;
/**
* Tests syncing only events from StatsBomb data to verify the process works
* @summary Test sync events only
*/
export declare const statsBombControllerTestSyncEventsOnly: () => Promise<StatsBombControllerTestSyncEventsOnly200>;
export declare const getStatsBombControllerTestSyncEventsOnlyMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestSyncEventsOnly200, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<StatsBombControllerTestSyncEventsOnly200, TError, void, TContext>;
export type StatsBombControllerTestSyncEventsOnlyMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerTestSyncEventsOnly>>>;
export type StatsBombControllerTestSyncEventsOnlyMutationError = unknown;
/**
* @summary Test sync events only
*/
export declare const useStatsBombControllerTestSyncEventsOnly: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestSyncEventsOnly200, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<StatsBombControllerTestSyncEventsOnly200, TError, void, TContext>;
/**
* Tests syncing only players from StatsBomb data to verify the process works
* @summary Test sync players only
*/
export declare const statsBombControllerTestSyncPlayersOnly: () => Promise<StatsBombControllerTestSyncPlayersOnly200>;
export declare const getStatsBombControllerTestSyncPlayersOnlyMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestSyncPlayersOnly200, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<StatsBombControllerTestSyncPlayersOnly200, TError, void, TContext>;
export type StatsBombControllerTestSyncPlayersOnlyMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerTestSyncPlayersOnly>>>;
export type StatsBombControllerTestSyncPlayersOnlyMutationError = unknown;
/**
* @summary Test sync players only
*/
export declare const useStatsBombControllerTestSyncPlayersOnly: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestSyncPlayersOnly200, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<StatsBombControllerTestSyncPlayersOnly200, TError, void, TContext>;
/**
* Tests syncing teams, players, and all events (goals, cards, substitutions) from a specific match ID to debug the process
* @summary Test sync complete match data from a single match
*/
export declare const statsBombControllerTestSyncSingleMatch: (matchId: number) => Promise<StatsBombControllerTestSyncSingleMatch200>;
export declare const getStatsBombControllerTestSyncSingleMatchMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestSyncSingleMatch200, TError, {
        matchId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<StatsBombControllerTestSyncSingleMatch200, TError, {
    matchId: number;
}, TContext>;
export type StatsBombControllerTestSyncSingleMatchMutationResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerTestSyncSingleMatch>>>;
export type StatsBombControllerTestSyncSingleMatchMutationError = unknown;
/**
* @summary Test sync complete match data from a single match
*/
export declare const useStatsBombControllerTestSyncSingleMatch: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<StatsBombControllerTestSyncSingleMatch200, TError, {
        matchId: number;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<StatsBombControllerTestSyncSingleMatch200, TError, {
    matchId: number;
}, TContext>;
/**
* Returns a list of available match IDs that can be used for single match testing
* @summary Get available match IDs for testing
*/
export declare const statsBombControllerGetAvailableMatches: (signal?: AbortSignal) => Promise<StatsBombControllerGetAvailableMatches200>;
export declare const getStatsBombControllerGetAvailableMatchesQueryKey: () => readonly ["/statsbomb/test/available-matches"];
export declare const getStatsBombControllerGetAvailableMatchesQueryOptions: <TData = StatsBombControllerGetAvailableMatches200, TError = unknown>(options?: {
    query?: UseQueryOptions<StatsBombControllerGetAvailableMatches200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<StatsBombControllerGetAvailableMatches200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type StatsBombControllerGetAvailableMatchesQueryResult = NonNullable<Awaited<ReturnType<typeof statsBombControllerGetAvailableMatches>>>;
export type StatsBombControllerGetAvailableMatchesQueryError = unknown;
/**
 * @summary Get available match IDs for testing
 */
export declare const useStatsBombControllerGetAvailableMatches: <TData = StatsBombControllerGetAvailableMatches200, TError = unknown>(options?: {
    query?: UseQueryOptions<StatsBombControllerGetAvailableMatches200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
