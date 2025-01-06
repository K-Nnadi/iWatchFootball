/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Trophy = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    name: string;
    description?: string;
    yearIntroduced?: string;
    competitionId: number;
    competition: Promise;
};
