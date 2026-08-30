export type SportMonksPagination = {
  count?: number;
  per_page?: number;
  current_page?: number;
  next_page?: string | null;
  has_more?: boolean;
};

export type SportMonksListResponse<T> = {
  data: T[];
  pagination?: SportMonksPagination;
};

export type SportMonksSingleResponse<T> = {
  data: T;
};

export type SportMonksCountry = {
  id?: number;
  name?: string;
};

export type SportMonksLeague = {
  id: number;
  name?: string;
  short_code?: string;
  type?: string;
  country_id?: number;
  country?: SportMonksCountry;
  seasons?: SportMonksSeason[];
};

export type SportMonksSeason = {
  id: number;
  league_id?: number;
  name?: string;
  is_current?: boolean;
  starting_at?: string;
  ending_at?: string;
};

export type SportMonksParticipant = {
  id: number;
  name?: string;
  short_code?: string;
  image_path?: string;
  meta?: {
    location?: 'home' | 'away';
    winner?: boolean;
    position?: number;
  };
};

export type SportMonksTeam = {
  id: number;
  name?: string;
  short_code?: string;
  image_path?: string;
  country_id?: number;
  founded?: number;
};

export type SportMonksScore = {
  id?: number;
  fixture_id?: number;
  type_id?: number;
  description?: string;
  score?: {
    goals?: number;
    participant?: 'home' | 'away' | string;
    participant_id?: number;
  };
};

export type SportMonksFixture = {
  id: number;
  sport_id?: number;
  league_id?: number;
  season_id?: number;
  round_id?: number;
  state_id?: number;
  venue_id?: number;
  name?: string;
  starting_at?: string;
  result_info?: string;
  participants?: SportMonksParticipant[];
  scores?: SportMonksScore[];
  events?: SportMonksEvent[];
  lineups?: SportMonksLineup[];
  statistics?: SportMonksStatistic[];
  formations?: SportMonksFormation[];
  league?: SportMonksLeague;
  season?: SportMonksSeason;
  venue?: SportMonksVenue;
  round?: SportMonksRound;
  periods?: SportMonksPeriod[];
  length?: number;
  leg?: string;
};

export type SportMonksRound = {
  id?: number;
  name?: string;
  fixture_id?: number;
  season_id?: number;
};

export type SportMonksPeriod = {
  id?: number;
  fixture_id?: number;
  type_id?: number;
  started?: number;
  ended?: number;
  counts_from?: number;
  ticking?: boolean;
  sort_order?: number;
  description?: string;
  time_added?: number | null;
  period_length?: number;
  minutes?: number;
  seconds?: number;
};

export type SportMonksLineupDetail = {
  type_id?: number;
  data?: { value?: number | string };
};

export type SportMonksVenue = {
  id: number;
  name?: string;
  city_name?: string;
  capacity?: number;
  country_id?: number;
};

export type SportMonksEvent = {
  id: number;
  fixture_id?: number;
  type_id: number;
  participant_id?: number;
  player_id?: number | null;
  related_player_id?: number | null;
  player_name?: string;
  minute?: number;
  extra_minute?: number | null;
  result?: string;
  sort_order?: number;
};

export type SportMonksLineup = {
  id?: number;
  fixture_id?: number;
  player_id?: number;
  team_id?: number;
  position_id?: number;
  formation_position?: number;
  player_name?: string;
  jersey_number?: number;
  type_id?: number;
  captain?: boolean;
  player?: SportMonksPlayer;
  details?: SportMonksLineupDetail[];
};

export type SportMonksFormation = {
  fixture_id?: number;
  participant_id?: number;
  formation?: string;
  location?: 'home' | 'away';
};

export type SportMonksStatistic = {
  id?: number;
  fixture_id?: number;
  type_id?: number;
  participant_id?: number;
  player_id?: number | null;
  data?: { value?: number | string };
  location?: 'home' | 'away';
};

export type SportMonksPlayer = {
  id: number;
  name?: string;
  display_name?: string;
  common_name?: string;
  firstname?: string;
  lastname?: string;
  date_of_birth?: string;
  nationality_id?: number;
  position_id?: number;
  image_path?: string;
  height?: number;
  weight?: number;
  nationality?: string | { id?: number; name?: string };
  country?: { name?: string };
};

export type SportMonksStandingDetail = {
  type_id?: number;
  value?: number;
  type?: { name?: string };
};

export type SportMonksStanding = {
  id?: number;
  participant_id?: number;
  league_id?: number;
  season_id?: number;
  position?: number;
  points?: number;
  result?: string;
  details?: SportMonksStandingDetail[];
  participant?: SportMonksParticipant;
};

export type SportMonksSquadPlayer = {
  player_id?: number;
  team_id?: number;
  jersey_number?: number;
  position_id?: number;
  player?: SportMonksPlayer;
};
