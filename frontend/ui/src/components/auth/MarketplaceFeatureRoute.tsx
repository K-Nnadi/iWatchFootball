import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';

export function MarketplaceFeatureRoute({ children }: { children: React.ReactElement }) {
    const { marketplaceEnabled, loaded } = usePlatformFeaturesStore();

    if (!loaded) {
        return null;
    }

    if (!marketplaceEnabled) {
        return <Navigate to="/home" replace />;
    }

    return children;
}
