/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GenericToken = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    token: string;
    type: string;
    expiry: string;
    userEmail?: string;
    userId: number;
};
