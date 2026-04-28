export const API_SPORTS_BASE_URL = 'https://v3.football.api-sports.io';

export const API_SPORTS_CONFIG = {
  baseUrl: API_SPORTS_BASE_URL,
  /** Optional small delay between player/transfer calls to stay under rate limits */
  requestDelayMs: 300,
  retryAttempts: 2,
};
