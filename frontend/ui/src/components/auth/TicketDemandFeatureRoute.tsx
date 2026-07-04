import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';

export function TicketDemandFeatureRoute({ children }: { children: ReactNode }) {
    const { ticketDemandEnabled, loaded } = usePlatformFeaturesStore();
    if (!loaded) return null;
    if (!ticketDemandEnabled) return <Navigate to="/" replace />;
    return <>{children}</>;
}
