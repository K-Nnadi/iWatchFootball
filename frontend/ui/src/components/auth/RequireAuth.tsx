import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/auth.store';

/** Wraps private routes; sends guests to sign-in and preserves the return URL. */
export function RequireAuth() {
    const { isLoggedIn } = useAuthStore();
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/signIn" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
