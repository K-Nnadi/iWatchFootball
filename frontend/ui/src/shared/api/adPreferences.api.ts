import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AdPreference {
    userId: number;
    showGamblingContent: boolean;
    consentGivenAt?: string;
    selfExcluded: boolean;
}

export interface UpdateAdPreferencePayload {
    showGamblingContent?: boolean;
}

const AD_PREFS_KEY = ['user', 'ad-preferences'] as const;

async function getAdPreferences(): Promise<AdPreference> {
    const { data } = await axios.get<AdPreference>('/user/ad-preferences');
    return data;
}

async function updateAdPreferences(payload: UpdateAdPreferencePayload): Promise<AdPreference> {
    const { data } = await axios.patch<AdPreference>('/user/ad-preferences', payload);
    return data;
}

export function useAdPreferences(enabled = true) {
    return useQuery({
        queryKey: AD_PREFS_KEY,
        queryFn: getAdPreferences,
        enabled,
    });
}

export function useUpdateAdPreferences() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateAdPreferences,
        onSuccess: (data) => {
            qc.setQueryData(AD_PREFS_KEY, data);
        },
    });
}
