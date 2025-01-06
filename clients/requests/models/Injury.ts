/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Injury = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    playerId: number;
    injuryType: string;
    startDate: string;
    endDate?: string;
    status: string;
};
