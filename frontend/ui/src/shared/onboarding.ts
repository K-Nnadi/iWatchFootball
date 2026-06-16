import type { User } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';

const STORAGE_KEY = 'iwf_onboarding_v1';

export function onboardingStorageKey(userId: number): string {
    return `${STORAGE_KEY}_${userId}`;
}

export function isOnboardingComplete(user: User | null | undefined): boolean {
    if (!user) return true;
    if (localStorage.getItem(onboardingStorageKey(user.id)) === '1') return true;
    const meta = user.metadata as { onboardingCompleted?: boolean } | null | undefined;
    if (meta?.onboardingCompleted) return true;
    if (user.favouriteTeamId) {
        markOnboardingComplete(user.id);
        return true;
    }
    return false;
}

export function markOnboardingComplete(userId: number): void {
    localStorage.setItem(onboardingStorageKey(userId), '1');
}

export const POPULAR_CLUB_NAMES = [
    'Manchester United',
    'Liverpool',
    'Arsenal',
    'Chelsea',
    'Manchester City',
    'Tottenham Hotspur',
    'Newcastle United',
    'Celtic',
    'West Ham United',
    'Rangers',
    'Leeds United',
    'Real Madrid',
];

export const SUGGESTED_NATIONAL_NAMES = [
    'England',
    'Scotland',
    'Wales',
    'Italy',
    'Portugal',
    'Republic of Ireland',
    'Northern Ireland',
    'Brazil',
    'Spain',
    'Argentina',
    'France',
    'Germany',
];

export const SUGGESTED_TEAM_NAMES = [...POPULAR_CLUB_NAMES, ...SUGGESTED_NATIONAL_NAMES];

export const ONBOARDING_INITIAL_TEAM_COUNT = 15;
