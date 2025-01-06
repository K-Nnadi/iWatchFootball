/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';
import type { Referee } from './Referee';

export type FixtureReferee = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    fixtureId: number;
    fixture: Promise;
    refereeId: number;
    referee: Referee;
    role: 'Main' | 'Assistant' | 'Var';
};
