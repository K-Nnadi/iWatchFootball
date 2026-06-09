import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
/**
 * @summary Seed teams data
 */
export declare const seedTeams: () => Promise<void>;
export declare const getSeedTeamsMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type SeedTeamsMutationResult = NonNullable<Awaited<ReturnType<typeof seedTeams>>>;
export type SeedTeamsMutationError = unknown;
/**
* @summary Seed teams data
*/
export declare const useSeedTeams: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Seed leagues data
*/
export declare const seedLeagues: () => Promise<void>;
export declare const getSeedLeaguesMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type SeedLeaguesMutationResult = NonNullable<Awaited<ReturnType<typeof seedLeagues>>>;
export type SeedLeaguesMutationError = unknown;
/**
* @summary Seed leagues data
*/
export declare const useSeedLeagues: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Seed fixtures data
*/
export declare const seedFixtures: () => Promise<void>;
export declare const getSeedFixturesMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type SeedFixturesMutationResult = NonNullable<Awaited<ReturnType<typeof seedFixtures>>>;
export type SeedFixturesMutationError = unknown;
/**
* @summary Seed fixtures data
*/
export declare const useSeedFixtures: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Seed standings data
*/
export declare const seedStandings: () => Promise<void>;
export declare const getSeedStandingsMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type SeedStandingsMutationResult = NonNullable<Awaited<ReturnType<typeof seedStandings>>>;
export type SeedStandingsMutationError = unknown;
/**
* @summary Seed standings data
*/
export declare const useSeedStandings: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
/**
* @summary Seed players data
*/
export declare const seedPlayers: () => Promise<void>;
export declare const getSeedPlayersMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, void, TContext>;
export type SeedPlayersMutationResult = NonNullable<Awaited<ReturnType<typeof seedPlayers>>>;
export type SeedPlayersMutationError = unknown;
/**
* @summary Seed players data
*/
export declare const useSeedPlayers: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, void, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, void, TContext>;
