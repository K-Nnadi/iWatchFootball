/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { Promise } from './Promise';

export type Stadium = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    name: string;
    opened?: string;
    teamIds: Array<string>;
    teams?: Promise;
    capacity?: number;
    addressId?: number;
    address?: Address;
    fixtures?: Promise;
};
