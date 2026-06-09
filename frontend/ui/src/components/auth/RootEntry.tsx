import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/auth.store';
import { LandingPage } from '../../pages/landing.page';

/** `/` — marketing landing for guests; signed-in users use `/home`. */
export function RootEntry() {
    const { isLoggedIn } = useAuthStore();

    if (isLoggedIn) {
        return <Navigate to="/home" replace />;
    }

    return <LandingPage />;
}
