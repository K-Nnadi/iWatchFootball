/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreatePlayerLineUpDTO = {
    lineupId: number;
    playerId: number;
    isStarting: boolean;
    positionId?: number;
    isCaptain: boolean;
};
