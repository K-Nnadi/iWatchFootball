/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Referee = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    name: string;
    nationality: string;
    fixtures: Array<string>;
};
