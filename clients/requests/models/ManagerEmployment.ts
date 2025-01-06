/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type ManagerEmployment = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    managerId: number;
    manager: Promise;
    teamId: number;
    team: Promise;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
};
