/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateUserDTO = {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    type: 'USER' | 'ADMIN';
};
