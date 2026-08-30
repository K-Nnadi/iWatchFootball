export const SPORTMONKS_BASE_URL = 'https://api.sportmonks.com/v3/football';

export const SPORTMONKS_CONFIG = {
  baseUrl: SPORTMONKS_BASE_URL,
  requestDelayMs: 200,
  retryAttempts: 2,
  defaultPerPage: 50,
};

/** SportMonks fixture state_id values (subset used for status mapping). */
export const SPORTMONKS_STATE = {
  NOT_STARTED: 1,
  INPLAY_1ST_HALF: 2,
  HT: 3,
  FT: 5,
  INPLAY_ET: 6,
  AET: 7,
  FT_PEN: 8,
  INPLAY_PENALTIES: 9,
  POSTPONED: 10,
  SUSPENDED: 11,
  CANCELLED: 12,
  INPLAY_2ND_HALF: 22,
} as const;

/** Event type_id values from football-docs SportMonks event-types. */
export const SPORTMONKS_EVENT_TYPE = {
  GOAL: 14,
  OWN_GOAL: 15,
  PENALTY_GOAL: 16,
  PENALTY_MISSED: 17,
  SUBSTITUTION: 18,
  YELLOW: 19,
  YELLOW_RED: 20,
  RED: 21,
} as const;

/** Lineup type_id: 11 = starter, 12 = substitute. */
export const SPORTMONKS_LINEUP_TYPE = {
  STARTER: 11,
  SUBSTITUTE: 12,
} as const;

/** Standing detail type_id values from football-docs data-model. */
export const SPORTMONKS_STANDING_DETAIL = {
  PLAYED: 129,
  WON: 130,
  DRAW: 131,
  LOST: 132,
  GOALS_FOR: 133,
  GOALS_AGAINST: 134,
  GOAL_DIFFERENCE: 179,
} as const;

/** Lineup detail type_id values (player sheet fields). */
export const SPORTMONKS_LINEUP_DETAIL = {
  RATING: 118,
  MINUTES_PLAYED: 119,
} as const;

/** Team-level statistic type_id values from football-docs event-types. */
export const SPORTMONKS_STAT_TYPE = {
  POSSESSION: 45,
  SHOTS_TOTAL: 41,
  SHOTS_ON_TARGET: 42,
  SHOTS_OFF_TARGET: 43,
  SHOTS_BLOCKED: 44,
  SHOTS_INSIDE_BOX: 52,
  SHOTS_OUTSIDE_BOX: 53,
  CORNERS: 34,
  FOULS: 56,
  OFFSIDES: 51,
  YELLOW_CARDS: 84,
  RED_CARDS: 85,
  SAVES: 57,
  PASSES_TOTAL: 80,
  PASSES_ACCURATE: 81,
  PASS_ACCURACY_PCT: 116,
  XG: 580,
} as const;

/** Includes for fixture list import (lean but useful). */
export const SPORTMONKS_FIXTURE_LIST_INCLUDES =
  'participants;scores;state;league;season;venue;round';

/**
 * Includes for full fixture detail sync — MCP "full match data" recipe plus
 * nested players, lineup minutes/ratings, and team statistics.
 */
export const SPORTMONKS_FIXTURE_DETAIL_INCLUDES =
  'participants;scores;state;venue;round;periods;formations;statistics;' +
  'events.player.nationality;lineups.player.nationality;lineups.details';
