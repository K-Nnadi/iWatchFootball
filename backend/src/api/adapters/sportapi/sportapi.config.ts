export const SPORTAPI_BASE_URL = 'https://sportapi7.p.rapidapi.com';
export const SPORTAPI_HOST = 'sportapi7.p.rapidapi.com';

export const SPORTAPI_CONFIG = {
  baseUrl: SPORTAPI_BASE_URL,
  host: SPORTAPI_HOST,
  requestDelayMs: 200,
  retryAttempts: 2,
  defaultTimezoneOffset: 0,
};

/** Sofascore-style uniqueTournament ids used as SportAPI competition keys. */
export const SPORTAPI_UNIQUE_TOURNAMENT = {
  PREMIER_LEAGUE: 17,
  CHAMPIONS_LEAGUE: 7,
  LA_LIGA: 8,
  SERIE_A: 23,
  BUNDESLIGA: 35,
  LIGUE_1: 34,
  EUROPA_LEAGUE: 679,
} as const;

/** Sofascore-style category (country) ids used by scheduled-events. */
export const SPORTAPI_CATEGORY = {
  ENGLAND: 1,
  GERMANY: 9,
  FRANCE: 7,
  ITALY: 31,
  SPAIN: 32,
} as const;

/** uniqueTournament id → API-Sports league id for cross-provider competition matching. */
export const SPORTAPI_TO_APISPORTS_LEAGUE: Record<number, number> = {
  [SPORTAPI_UNIQUE_TOURNAMENT.PREMIER_LEAGUE]: 39,
  [SPORTAPI_UNIQUE_TOURNAMENT.LA_LIGA]: 140,
  [SPORTAPI_UNIQUE_TOURNAMENT.SERIE_A]: 135,
  [SPORTAPI_UNIQUE_TOURNAMENT.BUNDESLIGA]: 78,
  [SPORTAPI_UNIQUE_TOURNAMENT.LIGUE_1]: 61,
  [SPORTAPI_UNIQUE_TOURNAMENT.CHAMPIONS_LEAGUE]: 2,
  [SPORTAPI_UNIQUE_TOURNAMENT.EUROPA_LEAGUE]: 3,
};

/** uniqueTournament id → category id for the documented RapidAPI flow. */
export const SPORTAPI_TOURNAMENT_CATEGORY: Record<number, number> = {
  [SPORTAPI_UNIQUE_TOURNAMENT.PREMIER_LEAGUE]: SPORTAPI_CATEGORY.ENGLAND,
  [SPORTAPI_UNIQUE_TOURNAMENT.LA_LIGA]: SPORTAPI_CATEGORY.SPAIN,
  [SPORTAPI_UNIQUE_TOURNAMENT.SERIE_A]: SPORTAPI_CATEGORY.ITALY,
  [SPORTAPI_UNIQUE_TOURNAMENT.BUNDESLIGA]: SPORTAPI_CATEGORY.GERMANY,
  [SPORTAPI_UNIQUE_TOURNAMENT.LIGUE_1]: SPORTAPI_CATEGORY.FRANCE,
};
