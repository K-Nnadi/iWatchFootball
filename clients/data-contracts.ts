/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateAddressDTO {
  /**
   * Primary address line
   * @example "123 Main Street"
   */
  address1?: string;
  /**
   * Secondary address line
   * @example "Suite 200"
   */
  address2?: string;
  /**
   * Town or city
   * @example "London"
   */
  townOrCity?: string;
  /**
   * Postcode or ZIP code
   * @example "SW1A 1AA"
   */
  postcode?: string;
  /**
   * Location description or coordinates
   * @example "51.509865, -0.118092"
   */
  location?: string;
  /**
   * Associated stadium ID
   * @example 5
   */
  stadiumId?: number;
}

export type Promise = object;

export interface Address {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  /**
   * Primary address line
   * @example "123 Main Street"
   */
  address1?: string;
  /**
   * Secondary address line
   * @example "Suite 200"
   */
  address2?: string;
  /**
   * Town or city
   * @example "London"
   */
  townOrCity?: string;
  /**
   * Postcode or ZIP code
   * @example "SW1A 1AA"
   */
  postcode?: string;
  /**
   * Country name
   * @example "United Kingdom"
   */
  country?: string;
  /**
   * Location description or coordinates
   * @example "51.509865, -0.118092"
   */
  location?: string;
  /**
   * Associated stadium ID
   * @example 5
   */
  stadiumId?: number;
  /** Associated stadium entity */
  stadium?: Promise | null;
}

export interface CreateCardDTO {
  fixtureId: number;
  playerId: number;
  type: string;
  minute: number;
}

export interface Card {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  fixtureId: number;
  playerId: number;
  type: string;
  minute: number;
}

export interface CreateCompetitionDTO {
  name: string;
  type: 'League' | 'Cup' | 'Custom' | 'Friendly';
  country: string;
}

export interface Competition {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  name: string;
  code?: string;
  type: 'League' | 'Cup' | 'Custom' | 'Friendly';
  country: string;
  teamCompetitionSeasons: Promise;
  trophies: Promise;
}

export interface CreateFixtureDTO {
  /**
   * Date and time of the fixture
   * @format date-time
   * @example "2023-12-25T18:00:00Z"
   */
  date: string;
  /**
   * ID of the home team
   * @example 1
   */
  homeTeamId?: number;
  /**
   * ID of the away team
   * @example 2
   */
  awayTeamId?: number;
  /**
   * Competition ID associated with the fixture
   * @example 1
   */
  competitionId: number;
  /**
   * Season ID associated with the fixture
   * @example 2023
   */
  seasonId: number;
  /**
   * Stadium ID where the fixture takes place
   * @example 5
   */
  stadiumId: number;
  /**
   * Status of the fixture
   * @example "Scheduled"
   */
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed' | 'Suspended' | 'In Play';
  /**
   * Attendance for the fixture
   * @example 50000
   */
  attendance?: number;
}

export interface TeamCompetitionSeason {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  teamId: number;
  team?: Promise;
  competitionId: number;
  competition: Promise;
  seasonId: number;
  season: Promise;
  fixtures: Promise;
  points?: number;
  position?: number;
}

export interface Stadium {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  name: string;
  /** @format date-time */
  opened?: string;
  teamIds: string[];
  teams?: Promise;
  capacity?: number;
  addressId?: number;
  address?: Address;
  fixtures?: Promise;
}

export interface Fixture {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  /**
   * Date and time of the fixture
   * @format date-time
   * @example "2023-12-25T18:00:00Z"
   */
  date: string;
  /**
   * ID of the home team
   * @example 1
   */
  homeTeamId?: number;
  homeTeam: Promise;
  /**
   * ID of the away team
   * @example 2
   */
  awayTeamId?: number;
  awayTeam: Promise;
  lineUps: Promise;
  /**
   * Competition ID associated with the fixture
   * @example 1
   */
  competitionId: number;
  /**
   * Season ID associated with the fixture
   * @example 2023
   */
  seasonId: number;
  teamCompetitionSeasons: TeamCompetitionSeason;
  /**
   * Stadium ID where the fixture takes place
   * @example 5
   */
  stadiumId: number;
  stadium?: Stadium | null;
  goals: string[];
  referees: string[];
  /**
   * Status of the fixture
   * @example "Scheduled"
   */
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed' | 'Suspended' | 'In Play';
  /**
   * Stage of the fixture
   * @example "League"
   */
  stage:
    | 'Final'
    | 'Semi Final'
    | 'Quarter Final'
    | 'Last 16'
    | 'Last 32'
    | 'Group Stage'
    | 'Third Place'
    | 'Play Off'
    | 'Round Robin'
    | 'League';
  /**
   * Attendance for the fixture
   * @example 50000
   */
  attendance?: number;
  logs: string[];
  predictions: string[];
}

export interface CreateFixtureRefereeDTO {
  fixtureId: number;
  refereeId: number;
  role: 'Main' | 'Assistant' | 'Var';
}

export interface Referee {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  name: string;
  nationality: string;
  fixtures: string[];
}

export interface FixtureReferee {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  fixtureId: number;
  fixture: Promise;
  refereeId: number;
  referee: Referee;
  role: 'Main' | 'Assistant' | 'Var';
}

export interface CreateGenericTokenDTO {
  token: string;
  type: string;
  expiry: string;
  userEmail?: string;
  userId: number;
}

export interface GenericToken {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  token: string;
  type: string;
  expiry: string;
  userEmail?: string;
  userId: number;
}

export interface CreateGoalDTO {
  minute: number;
  scorerId: number;
  assistantId?: number;
  fixtureId: number;
  teamId: number;
  ownGoal?: boolean;
  penalty?: boolean;
}

export interface Goal {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  minute: number;
  scorerId: number;
  scorer: Promise;
  assistantId?: number;
  assistant: Promise;
  fixtureId: number;
  fixture: Promise;
  teamId: number;
  ownGoal?: boolean;
  penalty?: boolean;
}

export interface CreateInjuryDTO {
  playerId: number;
  injuryType: string;
  /** @format date-time */
  startDate: string;
  /** @format date-time */
  endDate?: string;
  status: string;
}

export interface Injury {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  playerId: number;
  injuryType: string;
  /** @format date-time */
  startDate: string;
  /** @format date-time */
  endDate?: string;
  status: string;
}

export interface CreateLineUpDTO {
  fixtureId: number;
  teamId: number;
  managerId: number;
  formation?: string;
}

export interface LineUp {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  fixtureId: number;
  fixture: Promise;
  teamId: number;
  team: Promise;
  managerId: number;
  playerLineups: Promise;
  formation?: string;
}

export interface CreateLogDTO {
  userId: number;
  fixtureId: number;
  ticketNumber?: string;
  isVerified: boolean;
  notes?: string;
}

export interface Log {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  userId: number;
  user: Promise;
  fixtureId: number;
  fixture: Promise;
  ticketNumber?: string;
  isVerified: boolean;
  notes?: string;
}

export interface CreateManagerDTO {
  name: string;
  nickname: string;
  nationality: string;
  teamIds?: string[];
}

export interface Manager {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  name: string;
  nickname: string;
  nationality: string;
  teamIds?: string[];
  teams: Promise;
  employments: Promise;
}

export type CreateManagerEmploymentDTO = object;

export interface ManagerEmployment {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  managerId: number;
  manager: Promise;
  teamId: number;
  team: Promise;
  /** @format date-time */
  startDate?: string;
  /** @format date-time */
  endDate?: string;
  isCurrent: boolean;
}

export interface CreatePlayerDTO {
  name: string;
  nickname?: string;
  /** @format date-time */
  dateOfBirth: string;
  nationality: string;
  positionId: number;
  bio?: string;
  teamIds?: string[];
  kitNumber?: number;
  height?: number;
  weight?: number;
  photoUrl?: string;
}

export interface Player {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  name: string;
  nickname?: string;
  /** @format date-time */
  dateOfBirth: string;
  nationality: string;
  positionId: number;
  bio?: string;
  teamIds?: string[];
  teams?: Promise;
  kitNumber?: number;
  height?: number;
  weight?: number;
  photoUrl?: string;
  goals: Promise;
  assists: Promise;
  ownGoals: Promise;
  transfers: string[];
}

export interface CreatePlayerLineUpDTO {
  lineupId: number;
  playerId: number;
  isStarting: boolean;
  positionId?: number;
  isCaptain: boolean;
}

export interface PlayerLineUp {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  lineup: Promise;
  lineupId: number;
  playerId: number;
  player: Promise;
  isStarting: boolean;
  positionId?: number;
  substitutions: Promise;
  isCaptain: boolean;
}

export interface CreatePositionDTO {
  name: string;
  abbreviation?: string;
}

export interface Position {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  name: string;
  type: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  abbreviation?: string;
}

export interface CreatePredictionDTO {
  userId: number;
  user: Promise;
  fixtureId: number;
  fixture: Promise;
  predicted?: string;
}

export interface Prediction {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  userId: number;
  user: Promise;
  fixtureId: number;
  fixture: Promise;
  predicted?: string;
}

export interface CreateRefereeDTO {
  name: string;
  nationality: string;
}

export interface CreateSeasonDTO {
  yearStart: number;
  yearEnd: number;
}

export interface Season {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  yearStart: number;
  yearEnd: number;
  teamCompetitionSeasons: string[];
}

export interface CreateStadiumDTO {
  name: string;
  /** @format date-time */
  opened?: string;
  teamIds: string[];
  capacity?: number;
  addressId?: number;
}

export interface CreateSubstitutionDTO {
  fixtureId: number;
  teamId: number;
  minute?: number;
}

export interface Substitution {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  playerLineup: Promise;
  fixtureId: number;
  teamId: number;
  team: Promise;
  playerOut: Promise;
  minute?: number;
}

export interface CreateTeamDTO {
  name: string;
  /** @format date-time */
  founded?: string;
  stadiumIds?: string[];
  managerId?: number;
  logoUrl?: string;
  website?: string;
  city?: string;
  country?: string;
  type: 'Club' | 'Country';
  parentId?: number;
}

export interface Team {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  name: string;
  /** @format date-time */
  founded?: string;
  stadiumIds?: string[];
  stadiums?: string[] | null;
  teamCompetitionSeasons: string[];
  managerId?: number;
  manager: Promise;
  playerIds?: string[];
  players: Promise;
  logoUrl?: string;
  website?: string;
  city?: string;
  country?: string;
  type: 'Club' | 'Country';
  parentId?: number;
  homeFixtures: Promise;
  awayFixtures: Promise;
}

export interface CreateTeamCompetitionSeasonDTO {
  teamId: number;
  competitionId: number;
  seasonId: number;
  points?: number;
  position?: number;
}

export interface CreateTransferDTO {
  playerId: number;
  sourceTeamId: number;
  destinationTeamId: number;
  transferFee: number;
  /** @format date-time */
  date?: string;
  isLoan?: boolean;
}

export interface Transfer {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  playerId: number;
  player: Promise;
  sourceTeamId: number;
  sourceTeam: Promise;
  destinationTeamId: number;
  destinationTeam: Promise;
  transferFee: number;
  /** @format date-time */
  date?: string;
  isLoan?: boolean;
}

export interface CreateTrophyDTO {
  name: string;
  description?: string;
  /** @format date-time */
  yearIntroduced?: string;
}

export interface Trophy {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  name: string;
  description?: string;
  /** @format date-time */
  yearIntroduced?: string;
  competitionId: number;
  competition: Promise;
}

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  userName: string;
  /** @format email */
  email: string;
  type: 'USER' | 'ADMIN';
}

export interface User {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  firstName: string;
  lastName: string;
  userName: string;
  /** @format email */
  email: string;
  /**
   * @minLength 8
   * @maxLength 32
   */
  password: string;
  type: 'USER' | 'ADMIN';
  logs: Promise;
  predictions?: Promise;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  user: User;
}

export interface RegisterBody {
  firstName: string;
  lastName: string;
  userName: string;
  /** @format email */
  email: string;
  /**
   * @minLength 8
   * @maxLength 32
   */
  password: string;
}
