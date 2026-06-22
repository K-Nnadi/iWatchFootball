import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';

export function AttendanceAdvancedStatsRoute({ children }: { children: React.ReactElement }) {
    const { attendanceAdvancedStatsEnabled, loaded } = usePlatformFeaturesStore();

    if (!loaded) {
        return null;
    }

    if (!attendanceAdvancedStatsEnabled) {
        return <Navigate to="/friends" replace />;
    }

    return children;
}
