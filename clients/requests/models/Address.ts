/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Promise } from './Promise';

export type Address = {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    /**
     * Primary address line
     */
    address1?: string;
    /**
     * Secondary address line
     */
    address2?: string;
    /**
     * Town or city
     */
    townOrCity?: string;
    /**
     * Postcode or ZIP code
     */
    postcode?: string;
    /**
     * Country name
     */
    country?: string;
    /**
     * Location description or coordinates
     */
    location?: string;
    /**
     * Associated stadium ID
     */
    stadiumId?: number;
    /**
     * Associated stadium entity
     */
    stadium?: Promise | null;
};
