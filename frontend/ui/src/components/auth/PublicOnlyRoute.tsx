import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/auth.store';

/** Login / sign-up shells: already signed-in users go to home. */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuthStore();

    if (isLoggedIn) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}
