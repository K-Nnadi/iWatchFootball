import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Center,
    Group,
    Loader,
    NumberInput,
    Paper,
    Stack,
    Switch,
    Table,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '../../shared/notify';
import {
    listPlatformConfig,
    updatePlatformConfig,
    type ConfigValueType,
    type PlatformConfigEntry,
    type UpdatePlatformConfigPayload,
} from '../../shared/api/platformConfig.api';
import { getSubscriptionEntitlements } from '../../shared/api/tracker.api';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';

const FEATURE_FLAG_KEYS = new Set([
    'ads_enabled',
    'marketplace_enabled',
    'live_fixture_sync_enabled',
    'player_advanced_stats_enabled',
    'attendance_stats_enabled',
    'attendance_advanced_stats_enabled',
    'ticket_links_enabled',
    'affiliate_links_enabled',
    'matchday_affiliates_enabled',
    'hospitality_links_enabled',
    'sponsored_placements_enabled',
    'ticket_alerts_enabled',
    'affiliate_disclosure_enabled',
    'attendance_tracking_enabled',
    'ticket_document_upload_enabled',
    'ticket_demand_enabled',
]);

type RowDraft = {
    valueDraft: string | number | boolean;
    descriptionDraft: string;
};

function buildDrafts(entries: PlatformConfigEntry[]): Record<string, RowDraft> {
    return Object.fromEntries(
        entries.map((row) => [
            row.key,
            { valueDraft: formatValueDraft(row), descriptionDraft: row.description ?? '' },
        ]),
    );
}

export function PlatformConfigSection() {
    const queryClient = useQueryClient();
    const initializeFeatures = usePlatformFeaturesStore((s) => s.initializeFeatures);
    const [saving, setSaving] = useState(false);
    const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});

    const { data: entries, isLoading, refetch } = useQuery({
        queryKey: ['platform-config'],
        queryFn: listPlatformConfig,
    });

    const { data: entitlements } = useQuery({
        queryKey: ['subscription-entitlements'],
        queryFn: getSubscriptionEntitlements,
    });

    useEffect(() => {
        if (entries) setDrafts(buildDrafts(entries));
    }, [entries]);

    const dirtyKeys = useMemo(() => {
        if (!entries) return [];
        return entries
            .filter((row) => {
                const draft = drafts[row.key];
                if (!draft) return false;
                return (
                    draft.descriptionDraft !== (row.description ?? '') ||
                    !draftsEqual(row, draft.valueDraft)
                );
            })
            .map((row) => row.key);
    }, [drafts, entries]);

    const updateDraft = useCallback((key: string, patch: Partial<RowDraft>) => {
        setDrafts((prev) => ({
            ...prev,
            [key]: { ...prev[key], ...patch },
        }));
    }, []);

    const resetAll = useCallback(() => {
        if (entries) setDrafts(buildDrafts(entries));
    }, [entries]);

    const saveAll = useCallback(async () => {
        if (!entries || dirtyKeys.length === 0) return;

        const rowByKey = new Map(entries.map((row) => [row.key, row]));
        const updates: Array<{ row: PlatformConfigEntry; value: unknown; description: string }> = [];

        for (const key of dirtyKeys) {
            const row = rowByKey.get(key);
            const draft = drafts[key];
            if (!row || !draft) continue;

            const parsed = parseDraftValue(row, draft.valueDraft);
            if (parsed.error) {
                notify.error(`Invalid value for ${key}`, parsed.error);
                return;
            }
            updates.push({ row, value: parsed.value, description: draft.descriptionDraft });
        }

        setSaving(true);
        try {
            await Promise.all(
                updates.map(({ row, value, description }) => {
                    const payload: UpdatePlatformConfigPayload = {
                        valueType: row.valueType,
                        description: description || undefined,
                    };
                    switch (row.valueType) {
                        case 'boolean':
                            payload.booleanValue = Boolean(value);
                            break;
                        case 'number':
                            payload.numberValue = Number(value);
                            break;
                        case 'string':
                            payload.stringValue = String(value);
                            break;
                        case 'json':
                            payload.jsonValue = value as Record<string, unknown>;
                            break;
                        case 'array':
                            payload.arrayValue = value as unknown[];
                            break;
                    }
                    return updatePlatformConfig(row.key, payload);
                }),
            );

            notify.success(
                'Config saved',
                updates.length === 1 ? updates[0].row.key : `${updates.length} settings updated`,
            );
            await refetch();
            if (updates.some(({ row }) => FEATURE_FLAG_KEYS.has(row.key))) {
                await initializeFeatures();
            }
            void queryClient.invalidateQueries({ queryKey: ['subscription-entitlements'] });
        } catch {
            notify.error('Save failed', 'One or more settings could not be saved.');
        } finally {
            setSaving(false);
        }
    }, [dirtyKeys, drafts, entries, initializeFeatures, queryClient, refetch]);

    return (
        <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconSettings size={20} />
                        <Title order={4}>Platform config</Title>
                    </Group>
                    <Group gap="xs">
                        {dirtyKeys.length > 0 && (
                            <Button variant="subtle" size="xs" onClick={resetAll} disabled={saving}>
                                Reset
                            </Button>
                        )}
                        <Button
                            size="xs"
                            color="lime"
                            disabled={dirtyKeys.length === 0 || saving}
                            loading={saving}
                            onClick={() => void saveAll()}
                        >
                            Save{dirtyKeys.length > 0 ? ` (${dirtyKeys.length})` : ''}
                        </Button>
                        <Button variant="subtle" size="xs" onClick={() => void refetch()} disabled={saving}>
                            Refresh
                        </Button>
                    </Group>
                </Group>

                <Text size="sm" c="dimmed">
                    Ads, marketplace, and tracker limits are backend-driven. Admins bypass all user limits (premium entitlements).
                </Text>

                {entitlements && (
                    <Group gap="xs">
                        <Badge color={entitlements.isAdmin ? 'lime' : 'gray'} variant="light">
                            Admin: {entitlements.isAdmin ? 'yes' : 'no'}
                        </Badge>
                        <Badge color={entitlements.limitsBypassed ? 'green' : 'gray'} variant="light">
                            Limits bypassed: {entitlements.limitsBypassed ? 'yes' : 'no'}
                        </Badge>
                        <Badge variant="light">
                            Platform ads: {entitlements.adsEnabled ? 'on' : 'off'}
                        </Badge>
                        <Badge variant="light">
                            You see ads: {entitlements.showAds ? 'yes' : 'no'}
                        </Badge>
                    </Group>
                )}

                {isLoading ? (
                    <Center py="md"><Loader size="sm" /></Center>
                ) : (
                    <Table.ScrollContainer minWidth={720}>
                        <Table striped highlightOnHover withTableBorder>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Key</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>Value</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {(entries ?? []).map((row) => {
                                    const draft = drafts[row.key];
                                    const isDirty = dirtyKeys.includes(row.key);
                                    if (!draft) return null;

                                    return (
                                        <Table.Tr
                                            key={row.key}
                                            style={isDirty ? { backgroundColor: 'var(--mantine-color-dark-6)' } : undefined}
                                        >
                                            <Table.Td>
                                                <Text size="sm" ff="monospace">{row.key}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="xs">{row.valueType}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <ValueEditor
                                                    row={row}
                                                    draft={draft.valueDraft}
                                                    saving={saving}
                                                    onDraftChange={(valueDraft) => updateDraft(row.key, { valueDraft })}
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <TextInput
                                                    size="xs"
                                                    value={draft.descriptionDraft}
                                                    onChange={(e) =>
                                                        updateDraft(row.key, { descriptionDraft: e.currentTarget.value })
                                                    }
                                                    disabled={saving}
                                                    placeholder="Add description…"
                                                />
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}
            </Stack>
        </Paper>
    );
}

function ValueEditor({
    row,
    draft,
    saving,
    onDraftChange,
}: {
    row: PlatformConfigEntry;
    draft: string | number | boolean;
    saving: boolean;
    onDraftChange: (value: string | number | boolean) => void;
}) {
    if (row.valueType === 'boolean') {
        return (
            <Switch
                size="xs"
                checked={Boolean(draft)}
                disabled={saving}
                onChange={(e) => onDraftChange(e.currentTarget.checked)}
            />
        );
    }

    if (row.valueType === 'number') {
        return (
            <NumberInput
                size="xs"
                value={typeof draft === 'number' ? draft : Number(draft) || 0}
                onChange={(v) => onDraftChange(Number(v) || 0)}
                disabled={saving}
                style={{ maxWidth: 140 }}
            />
        );
    }

    if (row.valueType === 'string') {
        return (
            <TextInput
                size="xs"
                value={String(draft)}
                onChange={(e) => onDraftChange(e.currentTarget.value)}
                disabled={saving}
            />
        );
    }

    return (
        <Textarea
            size="xs"
            autosize
            minRows={2}
            maxRows={8}
            value={String(draft)}
            onChange={(e) => onDraftChange(e.currentTarget.value)}
            disabled={saving}
            ff="monospace"
        />
    );
}

function formatValueDraft(row: PlatformConfigEntry): string | number | boolean {
    if (row.valueType === 'boolean') return Boolean(row.value);
    if (row.valueType === 'number') return Number(row.value ?? 0);
    if (row.valueType === 'string') return String(row.value ?? '');
    return JSON.stringify(row.value ?? (row.valueType === 'array' ? [] : {}), null, 2);
}

function draftsEqual(row: PlatformConfigEntry, draft: string | number | boolean): boolean {
    const parsed = parseDraftValue(row, draft);
    if (parsed.error) return false;
    return valuesEqual(row.valueType, row.value, parsed.value);
}

function parseDraftValue(
    row: PlatformConfigEntry,
    draft: string | number | boolean,
): { value: unknown; error?: string } {
    if (row.valueType === 'boolean') return { value: Boolean(draft) };
    if (row.valueType === 'number') return { value: Number(draft) };
    if (row.valueType === 'string') return { value: String(draft) };

    try {
        const parsed = JSON.parse(String(draft));
        if (row.valueType === 'array' && !Array.isArray(parsed)) {
            return { value: undefined, error: 'Expected a JSON array' };
        }
        if (row.valueType === 'json' && (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))) {
            return { value: undefined, error: 'Expected a JSON object' };
        }
        return { value: parsed };
    } catch {
        return { value: undefined, error: 'Invalid JSON' };
    }
}

function valuesEqual(type: ConfigValueType, current: unknown, next: unknown): boolean {
    if (type === 'number') return Number(current) === Number(next);
    if (type === 'string') return String(current ?? '') === String(next);
    if (type === 'boolean') return Boolean(current) === Boolean(next);
    return JSON.stringify(current) === JSON.stringify(next);
}
