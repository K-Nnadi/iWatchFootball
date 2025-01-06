/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Player = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    name: string;
    nickname?: string;
    dateOfBirth: string;
    nationality: string;
    positionId: number;
    bio?: string;
    teamIds?: Array<string>;
    teams?: Promise;
    kitNumber?: number;
    height?: number;
    weight?: number;
    photoUrl?: string;
    goals: Promise;
    assists: Promise;
    ownGoals: Promise;
    transfers: Array<string>;
};
