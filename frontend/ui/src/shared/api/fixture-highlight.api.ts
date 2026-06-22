import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export enum HighlightProvider {
    YOUTUBE = 'YouTube',
    HIGHLIGHTLY = 'Highlightly',
    SPORTMONKS = 'Sportmonks',
    OFFICIAL_WEBSITE = 'OfficialWebsite',
}

export enum HighlightType {
    MATCH = 'Match',
    EXTENDED = 'Extended',
    GOAL = 'Goal',
    RED_CARD = 'RedCard',
    PENALTY = 'Penalty',
    INTERVIEW = 'Interview',
    FAN_REACTION = 'FanReaction',
}

export enum HighlightStatus {
    PENDING = 'Pending',
    ACTIVE = 'Active',
    REMOVED = 'Removed',
    FAILED = 'Failed',
}

export interface FixtureHighlight {
    id: number;
    createdAt: string;
    updatedAt: string;
    fixtureId: number;
    provider: HighlightProvider;
    type: HighlightType;
    title: string;
    providerVideoId: string;
    thumbnailUrl?: string;
    embedUrl?: string;
    sourceUrl?: string;
    durationSeconds?: number;
    publishedAt?: string;
    isOfficial: boolean;
    status: HighlightStatus;
    channelName?: string;
}

export async function getFixtureHighlights(fixtureId: number): Promise<FixtureHighlight[]> {
    const { data } = await axios.get<FixtureHighlight[]>(`/fixtures/${fixtureId}/highlights`);
    return data;
}

export async function getFixtureHighlightCount(): Promise<number> {
    const { data } = await axios.get<number>('/fixture-highlight/count');
    return data;
}

export function useFixtureHighlightCount() {
    return useQuery({
        queryKey: ['fixture-highlight-count'],
        queryFn: getFixtureHighlightCount,
        staleTime: 60 * 1000,
    });
}

export async function syncFixtureHighlights(fixtureId: number): Promise<{ message: string }> {
    const { data } = await axios.post<{ message: string }>(`/fixtures/${fixtureId}/highlights/sync`);
    return data;
}

export async function syncBulkHighlights(options?: {
    fixtureIds?: number[];
    lookbackHours?: number;
}): Promise<{ message: string; queued: number }> {
    const { data } = await axios.post<{ message: string; queued: number }>(
        '/fixtures/highlights/sync-bulk',
        options ?? {},
    );
    return data;
}

export function useFixtureHighlights(fixtureId: number | undefined) {
    return useQuery({
        queryKey: ['fixture-highlights', fixtureId],
        queryFn: () => getFixtureHighlights(fixtureId!),
        enabled: !!fixtureId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export const HIGHLIGHT_TYPE_LABELS: Record<HighlightType, string> = {
    [HighlightType.MATCH]: 'Match',
    [HighlightType.EXTENDED]: 'Extended',
    [HighlightType.GOAL]: 'Goals',
    [HighlightType.RED_CARD]: 'Red Cards',
    [HighlightType.PENALTY]: 'Penalties',
    [HighlightType.INTERVIEW]: 'Interviews',
    [HighlightType.FAN_REACTION]: 'Fan Reactions',
};

export function formatHighlightDuration(seconds?: number): string {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}
