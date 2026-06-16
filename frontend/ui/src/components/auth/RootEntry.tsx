import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/auth.store';
import { LandingPage } from '../../pages/landing.page';
import { isOnboardingComplete } from '../../shared/onboarding';

/** `/` — marketing landing for guests; signed-in users use `/home`. */
export function RootEntry() {
    const { isLoggedIn, user } = useAuthStore();

    if (isLoggedIn) {
        const dest = isOnboardingComplete(user) ? '/home' : '/onboarding';
        return <Navigate to={dest} replace />;
    }

    return <LandingPage />;
}
