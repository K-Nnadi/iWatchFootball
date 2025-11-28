import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import type { AuthResponse, LoginBody, RegisterBody } from './iWatchFootballAPI.schemas';
/**
 * @summary Login user
 */
export declare const login: (loginBody: LoginBody) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AuthResponse, TError, {
        data: LoginBody;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<AuthResponse, TError, {
    data: LoginBody;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = LoginBody;
export type LoginMutationError = unknown;
/**
* @summary Login user
*/
export declare const useLogin: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AuthResponse, TError, {
        data: LoginBody;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<AuthResponse, TError, {
    data: LoginBody;
}, TContext>;
/**
* @summary Register new user
*/
export declare const register: (registerBody: RegisterBody) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AuthResponse, TError, {
        data: RegisterBody;
    }, TContext> | undefined;
} | undefined) => UseMutationOptions<AuthResponse, TError, {
    data: RegisterBody;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = RegisterBody;
export type RegisterMutationError = unknown;
/**
* @summary Register new user
*/
export declare const useRegister: <TError = unknown, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<AuthResponse, TError, {
        data: RegisterBody;
    }, TContext> | undefined;
} | undefined) => UseMutationResult<AuthResponse, TError, {
    data: RegisterBody;
}, TContext>;
