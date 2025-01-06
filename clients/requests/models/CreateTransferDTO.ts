/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateTransferDTO = {
    playerId: number;
    sourceTeamId: number;
    destinationTeamId: number;
    transferFee: number;
    date?: string;
    isLoan?: boolean;
};
