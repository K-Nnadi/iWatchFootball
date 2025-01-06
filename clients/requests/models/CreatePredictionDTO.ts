/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type CreatePredictionDTO = {
    userId: number;
    user: Promise;
    fixtureId: number;
    fixture: Promise;
    predicted?: string;
};
