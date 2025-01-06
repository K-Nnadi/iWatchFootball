/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateAddressDTO = {
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
     * Location description or coordinates
     */
    location?: string;
    /**
     * Associated stadium ID
     */
    stadiumId?: number;
};
