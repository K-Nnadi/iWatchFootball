/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Goal = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    minute: number;
    scorerId: number;
    scorer: Promise;
    assistantId?: number;
    assistant: Promise;
    fixtureId: number;
    fixture: Promise;
    teamId: number;
    ownGoal?: boolean;
    penalty?: boolean;
};
