/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Manager = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    name: string;
    nickname: string;
    nationality: string;
    teamIds?: Array<string>;
    teams: Promise;
    employments: Promise;
};
