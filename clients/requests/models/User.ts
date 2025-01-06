/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type User = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    type: 'USER' | 'ADMIN';
    logs: Promise;
    predictions?: Promise;
};
