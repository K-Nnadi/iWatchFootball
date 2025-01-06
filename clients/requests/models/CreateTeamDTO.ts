/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateTeamDTO = {
    name: string;
    founded?: string;
    stadiumIds?: Array<string>;
    managerId?: number;
    logoUrl?: string;
    website?: string;
    city?: string;
    country?: string;
    type: 'Club' | 'Country';
    parentId?: number;
};
