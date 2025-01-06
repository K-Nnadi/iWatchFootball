/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { User } from './User';

export type AuthResponse = {
    access_token?: string;
    user: User;
};
