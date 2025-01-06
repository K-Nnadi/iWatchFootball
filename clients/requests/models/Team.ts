/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Team = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    name: string;
    founded?: string;
    stadiumIds?: Array<string>;
    stadiums?: Array<string> | null;
    teamCompetitionSeasons: Array<string>;
    managerId?: number;
    manager: Promise;
    playerIds?: Array<string>;
    players: Promise;
    logoUrl?: string;
    website?: string;
    city?: string;
    country?: string;
    type: 'Club' | 'Country';
    parentId?: number;
    homeFixtures: Promise;
    awayFixtures: Promise;
};
