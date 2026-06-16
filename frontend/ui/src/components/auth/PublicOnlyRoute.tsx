import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/auth.store';
import { isOnboardingComplete } from '../../shared/onboarding';

/** Login / sign-up shells: already signed-in users go to home (or onboarding). */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, user } = useAuthStore();

    if (isLoggedIn) {
        const dest = isOnboardingComplete(user) ? '/home' : '/onboarding';
        return <Navigate to={dest} replace />;
    }

    return <>{children}</>;
}
