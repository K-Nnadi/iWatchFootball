/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreatePlayerDTO = {
    name: string;
    nickname?: string;
    dateOfBirth: string;
    nationality: string;
    positionId: number;
    bio?: string;
    teamIds?: Array<string>;
    kitNumber?: number;
    height?: number;
    weight?: number;
    photoUrl?: string;
};
