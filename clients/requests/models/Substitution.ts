/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Substitution = {
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
};
