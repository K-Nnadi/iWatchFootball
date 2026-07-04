import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';

export function AttendanceTrackingFeatureRoute({ children }: { children: ReactNode }) {
    const { attendanceTrackingEnabled, loaded } = usePlatformFeaturesStore();
    if (!loaded) return null;
    if (!attendanceTrackingEnabled) return <Navigate to="/" replace />;
    return <>{children}</>;
}
