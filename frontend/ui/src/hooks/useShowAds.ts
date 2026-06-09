import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { isAdExcludedRoute } from '../components/ads/adConfig';
import { useAuthStore } from '../shared/stores/auth.store';
import { getSubscriptionEntitlements } from '../shared/api/tracker.api';

const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED !== 'false';

export function useShowAds(): boolean {
    const { pathname } = useLocation();
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['subscription-entitlements'],
        queryFn: getSubscriptionEntitlements,
        enabled: isLoggedIn && ADS_ENABLED,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    if (!ADS_ENABLED || isAdExcludedRoute(pathname)) {
        return false;
    }

    if (!isLoggedIn) {
        return true;
    }

    if (isLoading) {
        return false;
    }

    if (isError || !data) {
        return true;
    }

    return !data.isPremium;
}

export function useAdsEnabled(): boolean {
    return ADS_ENABLED;
}
