import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserType } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import { useAuthStore } from '../../shared/stores/auth.store';

/** Restricts routes to users with type ADMIN. */
export function RequireAdmin() {
    const { user } = useAuthStore();

    if (user?.type !== UserType.ADMIN) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}
