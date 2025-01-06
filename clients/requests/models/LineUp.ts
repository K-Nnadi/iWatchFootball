/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type LineUp = {
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
};
