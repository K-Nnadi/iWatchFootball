/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Prediction = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    userId: number;
    user: Promise;
    fixtureId: number;
    fixture: Promise;
    predicted?: string;
};
