export type SportApiCountry = {
  name?: string;
  alpha2?: string;
  slug?: string;
};

export type SportApiCategory = {
  id?: number;
  name?: string;
  slug?: string;
  flag?: string;
  sport?: { id?: number; name?: string; slug?: string };
};

export type SportApiTeam = {
  id: number;
  name?: string;
  shortName?: string;
  nameCode?: string;
  national?: boolean;
  gender?: string;
  country?: SportApiCountry;
};

export type SportApiScore = {
  current?: number;
  display?: number;
  period1?: number;
  period2?: number;
  normaltime?: number;
  extra1?: number;
  extra2?: number;
  overtime?: number;
  penalties?: number;
};

export type SportApiStatus = {
  code?: number;
  description?: string;
  type?: string;
};

export type SportApiUniqueTournament = {
  id: number;
  name?: string;
  slug?: string;
  category?: SportApiCategory;
};

export type SportApiTournament = {
  id?: number;
  name?: string;
  slug?: string;
  uniqueTournament?: SportApiUniqueTournament;
  category?: SportApiCategory;
};

export type SportApiSeason = {
  id: number;
  name?: string;
  year?: string;
};

export type SportApiCareerStint = {
  team?: { name?: string; id?: number; countryHint?: string };
  performance?: Record<string, number>;
  startTimestamp?: number;
  endTimestamp?: number;
};

export type SportApiVenue = {
  id?: number;
  name?: string;
  city?: { name?: string };
  country?: SportApiCountry;
  capacity?: number;
};

export type SportApiEvent = {
  id: number;
  startTimestamp?: number;
  homeTeam?: SportApiTeam;
  awayTeam?: SportApiTeam;
  homeScore?: SportApiScore;
  awayScore?: SportApiScore;
  status?: SportApiStatus;
  tournament?: SportApiTournament;
  uniqueTournament?: SportApiUniqueTournament;
  season?: SportApiSeason;
  venue?: SportApiVenue;
  roundInfo?: { round?: number; name?: string };
  attendance?: number;
};

export type SportApiIncidentPlayer = {
  id?: number;
  name?: string;
  shortName?: string;
  dateOfBirthTimestamp?: number;
  country?: SportApiCountry;
};

export type SportApiIncident = {
  id?: number;
  incidentType?: string;
  incidentClass?: string;
  time?: number;
  addedTime?: number;
  isHome?: boolean;
  player?: SportApiIncidentPlayer;
  playerIn?: SportApiIncidentPlayer;
  playerOut?: SportApiIncidentPlayer;
  assist1?: SportApiIncidentPlayer;
  homeScore?: number;
  awayScore?: number;
};

export type SportApiLineupPlayer = {
  player?: SportApiIncidentPlayer;
  shirtNumber?: number;
  jerseyNumber?: number;
  position?: string;
  substitute?: boolean;
  captain?: boolean;
};

export type SportApiTeamLineup = {
  formation?: string;
  players?: SportApiLineupPlayer[];
};

export type SportApiLineups = {
  confirmed?: boolean;
  home?: SportApiTeamLineup;
  away?: SportApiTeamLineup;
};

export type SportApiStatItem = {
  name?: string;
  home?: string | number;
  away?: string | number;
  key?: string;
};

export type SportApiStatisticsPeriod = {
  period?: string;
  groups?: Array<{
    groupName?: string;
    statisticsItems?: SportApiStatItem[];
  }>;
};

export type SportApiStatisticsResponse = {
  statistics?: SportApiStatisticsPeriod[];
};

export type SportApiStandingRow = {
  team?: SportApiTeam;
  position?: number;
  matches?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  scoresFor?: number;
  scoresAgainst?: number;
  points?: number;
};

export type SportApiStandingsResponse = {
  standings?: Array<{
    type?: string;
    name?: string;
    rows?: SportApiStandingRow[];
  }>;
};

export type SportApiEventsResponse = {
  events?: SportApiEvent[];
};

export type SportApiCategoriesResponse = {
  categories?: Array<{
    category?: SportApiCategory;
    uniqueTournaments?: SportApiUniqueTournament[];
  }>;
};

export type SportApiIncidentsResponse = {
  incidents?: SportApiIncident[];
};

export type SportApiEventDetailResponse = {
  event?: SportApiEvent;
};
