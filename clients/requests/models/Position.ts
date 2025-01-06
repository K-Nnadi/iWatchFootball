/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Position = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    name: string;
    type: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
    abbreviation?: string;
};
