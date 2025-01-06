/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateCompetitionDTO = {
    name: string;
    type: 'League' | 'Cup' | 'Custom' | 'Friendly';
    country: string;
};
