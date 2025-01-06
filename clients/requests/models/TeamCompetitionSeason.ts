/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type TeamCompetitionSeason = {
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
};
