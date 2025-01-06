/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';
import type { Stadium } from './Stadium';
import type { TeamCompetitionSeason } from './TeamCompetitionSeason';

export type Fixture = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    /**
     * Date and time of the fixture
     */
    date: string;
    /**
     * ID of the home team
     */
    homeTeamId?: number;
    homeTeam: Promise;
    /**
     * ID of the away team
     */
    awayTeamId?: number;
    awayTeam: Promise;
    lineUps: Promise;
    /**
     * Competition ID associated with the fixture
     */
    competitionId: number;
    /**
     * Season ID associated with the fixture
     */
    seasonId: number;
    teamCompetitionSeasons: TeamCompetitionSeason;
    /**
     * Stadium ID where the fixture takes place
     */
    stadiumId: number;
    stadium?: Stadium | null;
    goals: Array<string>;
    referees: Array<string>;
    /**
     * Status of the fixture
     */
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed' | 'Suspended' | 'In Play';
    /**
     * Stage of the fixture
     */
    stage: 'Final' | 'Semi Final' | 'Quarter Final' | 'Last 16' | 'Last 32' | 'Group Stage' | 'Third Place' | 'Play Off' | 'Round Robin' | 'League';
    /**
     * Attendance for the fixture
     */
    attendance?: number;
    logs: Array<string>;
    predictions: Array<string>;
};
