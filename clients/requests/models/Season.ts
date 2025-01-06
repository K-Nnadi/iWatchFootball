/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Season = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    yearStart: number;
    yearEnd: number;
    teamCompetitionSeasons: Array<string>;
};
