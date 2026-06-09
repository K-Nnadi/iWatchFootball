import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ApiSportsControllerDiscoverCountries200, ApiSportsControllerDiscoverCountriesParams, ApiSportsControllerDiscoverFixtures200, ApiSportsControllerDiscoverFixturesParams, ApiSportsControllerDiscoverLeagueById200, ApiSportsControllerDiscoverLeagues200, ApiSportsControllerDiscoverLeaguesParams, ApiSportsControllerDiscoverLiveFixtures200, ApiSportsControllerDiscoverTeams200, ApiSportsControllerDiscoverTeamsParams, ApiSportsEnrichPlayersDto, ApiSportsImportFixturesDto, ApiSportsImportLeaguesDto, ApiSportsImportPlayersDto, ApiSportsSyncPrimaryVenuesDto, ApiSportsSyncStandingsDto, ApiSportsSyncTransfersDto } from './iWatchFootballAPI.schemas';
/**
 * Either pass `country` + `season` (fetches live) or paste `response` from discover. Upserts competitions/seasons. By default, also runs up to `maxStandingsRequests` GET /standings calls (one per league) to upsert teams, competitionStanding, and teamCompetitionSeason — skipping cups and leagues without standings coverage to limit API usage.
 * @summary Import competitions + seasons from API-Sports /leagues
 */
export declare const apiSportsControllerImportLeagues: (apiSportsImportLeaguesDto: ApiSportsImportLeaguesDto) => Promise<void>;
export declare const getApiSportsControllerImportLeaguesMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsImportLeaguesDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: ApiSportsImportLeaguesDto;
}, TContext>;
export type ApiSportsControllerImportLeaguesMutationResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerImportLeagues>>>;
export type ApiSportsControllerImportLeaguesMutationBody = ApiSportsImportLeaguesDto;
export type ApiSportsControllerImportLeaguesMutationError = unknown;
/**
* @summary Import competitions + seasons from API-Sports /leagues
*/
export declare const useApiSportsControllerImportLeagues: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsImportLeaguesDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: ApiSportsImportLeaguesDto;
}, TContext>;
/**
* Requires API key (API_SPORTS_KEY or FOOTBALLAPISPORTS_API_KEY). Maps teams by metadata.providers.apisports.externalId.
* @summary Sync league standings from API-Sports
*/
export declare const apiSportsControllerSyncStandings: (apiSportsSyncStandingsDto: ApiSportsSyncStandingsDto) => Promise<void>;
export declare const getApiSportsControllerSyncStandingsMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsSyncStandingsDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: ApiSportsSyncStandingsDto;
}, TContext>;
export type ApiSportsControllerSyncStandingsMutationResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerSyncStandings>>>;
export type ApiSportsControllerSyncStandingsMutationBody = ApiSportsSyncStandingsDto;
export type ApiSportsControllerSyncStandingsMutationError = unknown;
/**
* @summary Sync league standings from API-Sports
*/
export declare const useApiSportsControllerSyncStandings: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsSyncStandingsDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: ApiSportsSyncStandingsDto;
}, TContext>;
/**
* Only processes players with metadata.providers.apisports.externalId (or metadata.apisportsPlayerId).
* @summary Enrich player DOB, nationality, height from API-Sports
*/
export declare const apiSportsControllerEnrichPlayers: (apiSportsEnrichPlayersDto: ApiSportsEnrichPlayersDto) => Promise<void>;
export declare const getApiSportsControllerEnrichPlayersMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsEnrichPlayersDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: ApiSportsEnrichPlayersDto;
}, TContext>;
export type ApiSportsControllerEnrichPlayersMutationResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerEnrichPlayers>>>;
export type ApiSportsControllerEnrichPlayersMutationBody = ApiSportsEnrichPlayersDto;
export type ApiSportsControllerEnrichPlayersMutationError = unknown;
/**
* @summary Enrich player DOB, nationality, height from API-Sports
*/
export declare const useApiSportsControllerEnrichPlayers: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsEnrichPlayersDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: ApiSportsEnrichPlayersDto;
}, TContext>;
/**
* Upserts `fixture` rows by `metadata.providers.apisports.externalId`, or merges into an existing same-competition fixture when kickoff differs by ≤6h and teams match (and both sides agree on score when finalized). Requires competition + season (yearStart/yearEnd) and teams already linked for that league. **`syncStandingsAfter`: true** adds one **`/standings`** call; **`recomputeStandingsFromFixturesAfter`: true** rebuilds ladder from scored fixtures (+0 requests). **`syncPrimaryVenuesAfter`: true** runs paged **`GET /teams`** and links each club **`venue`** to **`teamStadium`** as primary home (not match venue). Fixture upserts use **`fixtureUpsertConcurrency`**. With `from`/`to`, API-Football returns all fixtures in one call and rejects `page`; `allPages`/`maxPages` here are ignored.
* @summary Import fixtures into DB (API-Football /fixtures)
*/
export declare const apiSportsControllerImportFixtures: (apiSportsImportFixturesDto: ApiSportsImportFixturesDto) => Promise<void>;
export declare const getApiSportsControllerImportFixturesMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsImportFixturesDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: ApiSportsImportFixturesDto;
}, TContext>;
export type ApiSportsControllerImportFixturesMutationResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerImportFixtures>>>;
export type ApiSportsControllerImportFixturesMutationBody = ApiSportsImportFixturesDto;
export type ApiSportsControllerImportFixturesMutationError = unknown;
/**
* @summary Import fixtures into DB (API-Football /fixtures)
*/
export declare const useApiSportsControllerImportFixtures: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsImportFixturesDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: ApiSportsImportFixturesDto;
}, TContext>;
/**
* One **`GET /teams?league=&season=`** (no `page` — API-Football rejects `page` with this filter and returns all teams in one response). For each row, resolves the local team by `metadata.providers.apisports.externalId`, upserts `stadium` from the club **`venue`**, and upserts **`teamStadium`** with `metadata.relationship: primary_home` and `source: api-sports-teams`.
* @summary Link primary stadiums from API-Football GET /teams
*/
export declare const apiSportsControllerImportTeamPrimaryVenues: (apiSportsSyncPrimaryVenuesDto: ApiSportsSyncPrimaryVenuesDto) => Promise<void>;
export declare const getApiSportsControllerImportTeamPrimaryVenuesMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsSyncPrimaryVenuesDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: ApiSportsSyncPrimaryVenuesDto;
}, TContext>;
export type ApiSportsControllerImportTeamPrimaryVenuesMutationResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerImportTeamPrimaryVenues>>>;
export type ApiSportsControllerImportTeamPrimaryVenuesMutationBody = ApiSportsSyncPrimaryVenuesDto;
export type ApiSportsControllerImportTeamPrimaryVenuesMutationError = unknown;
/**
* @summary Link primary stadiums from API-Football GET /teams
*/
export declare const useApiSportsControllerImportTeamPrimaryVenues: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsSyncPrimaryVenuesDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: ApiSportsSyncPrimaryVenuesDto;
}, TContext>;
/**
* Creates players when missing, deduping by API-Sports id first, then strict name+DOB match. Caps pages/requests to protect daily quota.
* @summary Import missing players from API-Sports /players (league+season)
*/
export declare const apiSportsControllerImportPlayers: (apiSportsImportPlayersDto: ApiSportsImportPlayersDto) => Promise<void>;
export declare const getApiSportsControllerImportPlayersMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsImportPlayersDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: ApiSportsImportPlayersDto;
}, TContext>;
export type ApiSportsControllerImportPlayersMutationResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerImportPlayers>>>;
export type ApiSportsControllerImportPlayersMutationBody = ApiSportsImportPlayersDto;
export type ApiSportsControllerImportPlayersMutationError = unknown;
/**
* @summary Import missing players from API-Sports /players (league+season)
*/
export declare const useApiSportsControllerImportPlayers: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsImportPlayersDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: ApiSportsImportPlayersDto;
}, TContext>;
/**
* Resolves players and teams via metadata.providers.apisports.externalId. Skips rows that cannot be mapped.
* @summary Import transfers for an API-Sports team
*/
export declare const apiSportsControllerSyncTransfers: (apiSportsSyncTransfersDto: ApiSportsSyncTransfersDto) => Promise<void>;
export declare const getApiSportsControllerSyncTransfersMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsSyncTransfersDto;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<void, TError, {
    data: ApiSportsSyncTransfersDto;
}, TContext>;
export type ApiSportsControllerSyncTransfersMutationResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerSyncTransfers>>>;
export type ApiSportsControllerSyncTransfersMutationBody = ApiSportsSyncTransfersDto;
export type ApiSportsControllerSyncTransfersMutationError = unknown;
/**
* @summary Import transfers for an API-Sports team
*/
export declare const useApiSportsControllerSyncTransfers: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<void, TError, {
        data: ApiSportsSyncTransfersDto;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<void, TError, {
    data: ApiSportsSyncTransfersDto;
}, TContext>;
/**
* Proxies GET /leagues. See API-Football leagues docs for full filter list.
* @summary List/search leagues from API-Sports
*/
export declare const apiSportsControllerDiscoverLeagues: (params?: ApiSportsControllerDiscoverLeaguesParams, signal?: AbortSignal) => Promise<ApiSportsControllerDiscoverLeagues200>;
export declare const getApiSportsControllerDiscoverLeaguesQueryKey: (params?: ApiSportsControllerDiscoverLeaguesParams) => readonly ["/api-sports/discover/leagues", ...ApiSportsControllerDiscoverLeaguesParams[]];
export declare const getApiSportsControllerDiscoverLeaguesQueryOptions: <TData = ApiSportsControllerDiscoverLeagues200, TError = unknown>(params?: ApiSportsControllerDiscoverLeaguesParams, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverLeagues200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ApiSportsControllerDiscoverLeagues200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type ApiSportsControllerDiscoverLeaguesQueryResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerDiscoverLeagues>>>;
export type ApiSportsControllerDiscoverLeaguesQueryError = unknown;
/**
 * @summary List/search leagues from API-Sports
 */
export declare const useApiSportsControllerDiscoverLeagues: <TData = ApiSportsControllerDiscoverLeagues200, TError = unknown>(params?: ApiSportsControllerDiscoverLeaguesParams, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverLeagues200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Proxies GET /leagues?id={id}. Use `response[0].seasons` for valid `season` years for standings.
 * @summary One league + seasons coverage
 */
export declare const apiSportsControllerDiscoverLeagueById: (id: number, signal?: AbortSignal) => Promise<ApiSportsControllerDiscoverLeagueById200>;
export declare const getApiSportsControllerDiscoverLeagueByIdQueryKey: (id: number) => readonly [`/api-sports/discover/league/${number}`];
export declare const getApiSportsControllerDiscoverLeagueByIdQueryOptions: <TData = ApiSportsControllerDiscoverLeagueById200, TError = unknown>(id: number, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverLeagueById200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ApiSportsControllerDiscoverLeagueById200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type ApiSportsControllerDiscoverLeagueByIdQueryResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerDiscoverLeagueById>>>;
export type ApiSportsControllerDiscoverLeagueByIdQueryError = unknown;
/**
 * @summary One league + seasons coverage
 */
export declare const useApiSportsControllerDiscoverLeagueById: <TData = ApiSportsControllerDiscoverLeagueById200, TError = unknown>(id: number, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverLeagueById200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Proxies **GET /fixtures** — see [API-Football documentation v3](https://www.api-football.com/documentation-v3). **Efficient:** `date=YYYY-MM-DD` (+ optional `timezone` for “today”); narrow with `league`+`season`; batch with `ids=id1-id2`; use **GET /api-sports/discover/fixtures/live** for all live matches in one call. **allPages=true** merges pagination server-side (multiple upstream requests, capped by `maxPages`).
 * @summary Fixtures from API-Sports (API-Football v3)
 */
export declare const apiSportsControllerDiscoverFixtures: (params?: ApiSportsControllerDiscoverFixturesParams, signal?: AbortSignal) => Promise<ApiSportsControllerDiscoverFixtures200>;
export declare const getApiSportsControllerDiscoverFixturesQueryKey: (params?: ApiSportsControllerDiscoverFixturesParams) => readonly ["/api-sports/discover/fixtures", ...ApiSportsControllerDiscoverFixturesParams[]];
export declare const getApiSportsControllerDiscoverFixturesQueryOptions: <TData = ApiSportsControllerDiscoverFixtures200, TError = unknown>(params?: ApiSportsControllerDiscoverFixturesParams, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverFixtures200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ApiSportsControllerDiscoverFixtures200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type ApiSportsControllerDiscoverFixturesQueryResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerDiscoverFixtures>>>;
export type ApiSportsControllerDiscoverFixturesQueryError = unknown;
/**
 * @summary Fixtures from API-Sports (API-Football v3)
 */
export declare const useApiSportsControllerDiscoverFixtures: <TData = ApiSportsControllerDiscoverFixtures200, TError = unknown>(params?: ApiSportsControllerDiscoverFixturesParams, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverFixtures200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Proxies **GET /fixtures?live=all** — preferred over polling `/fixtures/events` per fixture. See [API-Football v3](https://www.api-football.com/documentation-v3).
 * @summary Live fixtures + events (one API call)
 */
export declare const apiSportsControllerDiscoverLiveFixtures: (signal?: AbortSignal) => Promise<ApiSportsControllerDiscoverLiveFixtures200>;
export declare const getApiSportsControllerDiscoverLiveFixturesQueryKey: () => readonly ["/api-sports/discover/fixtures/live"];
export declare const getApiSportsControllerDiscoverLiveFixturesQueryOptions: <TData = ApiSportsControllerDiscoverLiveFixtures200, TError = unknown>(options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverLiveFixtures200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ApiSportsControllerDiscoverLiveFixtures200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type ApiSportsControllerDiscoverLiveFixturesQueryResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerDiscoverLiveFixtures>>>;
export type ApiSportsControllerDiscoverLiveFixturesQueryError = unknown;
/**
 * @summary Live fixtures + events (one API call)
 */
export declare const useApiSportsControllerDiscoverLiveFixtures: <TData = ApiSportsControllerDiscoverLiveFixtures200, TError = unknown>(options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverLiveFixtures200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Proxies **GET /teams** — each entry includes **`team`** and **`venue`** (registered home ground). See [API-Football documentation v3](https://www.api-football.com/documentation-v3). Typical: `league` + `season`, or `id` / `team` for one club.
 * @summary Teams (+ club venue) from API-Sports
 */
export declare const apiSportsControllerDiscoverTeams: (params?: ApiSportsControllerDiscoverTeamsParams, signal?: AbortSignal) => Promise<ApiSportsControllerDiscoverTeams200>;
export declare const getApiSportsControllerDiscoverTeamsQueryKey: (params?: ApiSportsControllerDiscoverTeamsParams) => readonly ["/api-sports/discover/teams", ...ApiSportsControllerDiscoverTeamsParams[]];
export declare const getApiSportsControllerDiscoverTeamsQueryOptions: <TData = ApiSportsControllerDiscoverTeams200, TError = unknown>(params?: ApiSportsControllerDiscoverTeamsParams, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverTeams200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ApiSportsControllerDiscoverTeams200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type ApiSportsControllerDiscoverTeamsQueryResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerDiscoverTeams>>>;
export type ApiSportsControllerDiscoverTeamsQueryError = unknown;
/**
 * @summary Teams (+ club venue) from API-Sports
 */
export declare const useApiSportsControllerDiscoverTeams: <TData = ApiSportsControllerDiscoverTeams200, TError = unknown>(params?: ApiSportsControllerDiscoverTeamsParams, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverTeams200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Proxies GET /countries. Optional: `search`, `code`.
 * @summary Countries from API-Sports
 */
export declare const apiSportsControllerDiscoverCountries: (params?: ApiSportsControllerDiscoverCountriesParams, signal?: AbortSignal) => Promise<ApiSportsControllerDiscoverCountries200>;
export declare const getApiSportsControllerDiscoverCountriesQueryKey: (params?: ApiSportsControllerDiscoverCountriesParams) => readonly ["/api-sports/discover/countries", ...ApiSportsControllerDiscoverCountriesParams[]];
export declare const getApiSportsControllerDiscoverCountriesQueryOptions: <TData = ApiSportsControllerDiscoverCountries200, TError = unknown>(params?: ApiSportsControllerDiscoverCountriesParams, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverCountries200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryOptions<ApiSportsControllerDiscoverCountries200, TError, TData, QueryKey> & {
    queryKey: QueryKey;
};
export type ApiSportsControllerDiscoverCountriesQueryResult = NonNullable<Awaited<ReturnType<typeof apiSportsControllerDiscoverCountries>>>;
export type ApiSportsControllerDiscoverCountriesQueryError = unknown;
/**
 * @summary Countries from API-Sports
 */
export declare const useApiSportsControllerDiscoverCountries: <TData = ApiSportsControllerDiscoverCountries200, TError = unknown>(params?: ApiSportsControllerDiscoverCountriesParams, options?: {
    query?: UseQueryOptions<ApiSportsControllerDiscoverCountries200, TError, TData, QueryKey> | undefined;
} | undefined) => UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
