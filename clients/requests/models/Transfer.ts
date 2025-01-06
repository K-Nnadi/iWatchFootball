/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Transfer = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    playerId: number;
    player: Promise;
    sourceTeamId: number;
    sourceTeam: Promise;
    destinationTeamId: number;
    destinationTeam: Promise;
    transferFee: number;
    date?: string;
    isLoan?: boolean;
};
