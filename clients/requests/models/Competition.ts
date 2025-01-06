/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Competition = {
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
};
