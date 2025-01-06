/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Log = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    userId: number;
    user: Promise;
    fixtureId: number;
    fixture: Promise;
    ticketNumber?: string;
    isVerified: boolean;
    notes?: string;
};
