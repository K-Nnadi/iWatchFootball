import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { isAdExcludedRoute } from '../components/ads/adConfig';
import { useAuthStore } from '../shared/stores/auth.store';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import { getSubscriptionEntitlements } from '../shared/api/tracker.api';

export function useShowAds(): boolean {
    const { pathname } = useLocation();
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const { adsEnabled, loaded: featuresLoaded } = usePlatformFeaturesStore();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['subscription-entitlements'],
        queryFn: getSubscriptionEntitlements,
        enabled: isLoggedIn && featuresLoaded && adsEnabled,
        staleTime: 5 * 60 * 1000,
        retry: false,
        placeholderData: (previous) => previous,
    });

    if (!featuresLoaded || !adsEnabled) {
        return false;
    }

    if (isAdExcludedRoute(pathname)) {
        return false;
    }

    if (!isLoggedIn) {
        return true;
    }

    if (isLoggedIn && isLoading && !data) {
        return false;
    }

    if (isError || !data) {
        return true;
    }

    return !data.isPremium;
}

/** True when platform ads are enabled, ignoring route and subscription. */
export function useAdsEnabled(): boolean {
    const { adsEnabled, loaded } = usePlatformFeaturesStore();
    return loaded && adsEnabled;
}
