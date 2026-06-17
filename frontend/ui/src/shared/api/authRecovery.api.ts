import { clientInstance } from '@iWatchFootball/clients/client-instance';
import type { SecurityQuestion } from '../securityQuestion';

export interface SecurityQuestionsResponse {
    questions: SecurityQuestion[];
}

export interface ForgotPasswordChallengeResponse {
    question: SecurityQuestion;
}

export interface ForgotPasswordChallengeBody {
    email?: string;
    userName?: string;
}

export interface ForgotPasswordResetBody {
    email?: string;
    userName?: string;
    securityAnswer: string;
    newPassword: string;
}

export function getSecurityQuestions() {
    return clientInstance<SecurityQuestionsResponse>({
        url: '/auth/security-questions',
        method: 'GET',
    });
}

export function forgotPasswordChallenge(body: ForgotPasswordChallengeBody) {
    return clientInstance<ForgotPasswordChallengeResponse>({
        url: '/auth/forgot-password/challenge',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: body,
    });
}

export function forgotPasswordReset(body: ForgotPasswordResetBody) {
    return clientInstance<{ message: string }>({
        url: '/auth/forgot-password/reset',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: body,
    });
}
