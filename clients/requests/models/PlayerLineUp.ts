/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type PlayerLineUp = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    lineup: Promise;
    lineupId: number;
    playerId: number;
    player: Promise;
    isStarting: boolean;
    positionId?: number;
    substitutions: Promise;
    isCaptain: boolean;
};
