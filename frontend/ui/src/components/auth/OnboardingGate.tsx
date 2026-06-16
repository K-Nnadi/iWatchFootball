import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/auth.store';
import { isOnboardingComplete } from '../../shared/onboarding';

/** Redirects new users to onboarding before other authenticated routes. */
export function OnboardingGate() {
    const { user } = useAuthStore();
    const location = useLocation();

    if (user && !isOnboardingComplete(user) && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
}
