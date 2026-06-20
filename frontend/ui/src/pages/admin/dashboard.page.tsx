import { useState } from 'react';
import {
    Alert,
    Badge,
    Box,
    Button,
    Center,
    Container,
    Divider,
    Grid,
    Group,
    Loader,
    NumberInput,
    Paper,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {
    IconDatabase,
    IconNews,
    IconRefresh,
    IconSoccerField,
    IconVideo,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { ModernButton, ModernH2 } from '../../components/modern';
import { notify } from '../../shared/notify';
import { syncFixtureHighlights, useFixtureHighlightCount } from '../../shared/api/fixture-highlight.api';
import { useNewsAggregatorControllerGetStatus, useNewsAggregatorControllerTriggerAggregation } from '@iWatchFootball/clients/controllers/news-aggregation';
import { useGetCountNewsArticle } from '@iWatchFootball/clients/controllers/news-article';
import {
    useStatsBombControllerGetSyncStatus,
    useStatsBombControllerSyncData,
} from '@iWatchFootball/clients/controllers/statsbomb-adapter';
import {
    useDataSyncControllerGetJob,
    useDataSyncControllerRun,
} from '@iWatchFootball/clients/controllers/admin-data-sync';
import type { DataSyncRunDto } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import { PlatformConfigSection } from './PlatformConfigSection';

function StatTile({ label, value }: { label: string; value?: number }) {
    return (
        <Paper p="md" radius="md" withBorder>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
            <Text size="xl" fw={700} mt={4}>{value ?? '—'}</Text>
        </Paper>
    );
}

export function AdminDashboardPage() {
    const { data: sbStatus, isLoading: sbLoading, refetch: refetchSbStatus } = useStatsBombControllerGetSyncStatus();
    const { data: newsCount, refetch: refetchNewsCount } = useGetCountNewsArticle();
    const { data: highlightCount, refetch: refetchHighlightCount } = useFixtureHighlightCount();
    const { data: newsStatusRaw, refetch: refetchNewsStatus } = useNewsAggregatorControllerGetStatus();
    const newsStatus = newsStatusRaw as { redisConfigured?: boolean; scheduler?: string } | undefined;

    const newsTrigger = useNewsAggregatorControllerTriggerAggregation({
        mutation: {
            onSuccess: (result: unknown) => {
                notify.success('News sync', formatSyncResult(result));
                void refetchNewsStatus();
                void refetchNewsCount();
            },
            onError: () => notify.error('News sync failed', 'Check backend logs and feed availability.'),
        },
    });

    const statsBombSync = useStatsBombControllerSyncData({
        mutation: {
            onSuccess: () => {
                notify.success('StatsBomb sync', 'Synchronization completed.');
                void refetchSbStatus();
            },
            onError: () => notify.error('StatsBomb sync failed', 'See backend logs for details.'),
        },
    });

    const [sbSkipLineups, setSbSkipLineups] = useState(false);
    const [sbSkipPlayers, setSbSkipPlayers] = useState(false);

    const bulkSync = useDataSyncControllerRun({
        mutation: {
            onSuccess: (result: unknown) => {
                const payload = result as { syncJobId?: number; async?: boolean; message?: string };
                if (payload?.syncJobId) setLastJobId(payload.syncJobId);
                notify.success('Bulk sync', payload?.message ?? 'Job started.');
                void refetchSbStatus();
            },
            onError: () => notify.error('Bulk sync failed', 'Check preset and API budget.'),
        },
    });

    const [lastJobId, setLastJobId] = useState<number | null>(null);
    const jobQueryEnabled = lastJobId != null && lastJobId > 0;
    const { data: jobDetailRaw, refetch: refetchJob } = useDataSyncControllerGetJob(lastJobId ?? 0, {
        query: {
            enabled: jobQueryEnabled,
            queryKey: [`/admin/data-sync/jobs/${lastJobId ?? 0}`],
        },
    });
    const jobDetail = jobDetailRaw as Record<string, unknown> | undefined;

    const [bulkStatsbomb, setBulkStatsbomb] = useState(true);
    const [bulkApiSports, setBulkApiSports] = useState(false);
    const [bulkAsync, setBulkAsync] = useState(false);
    const [apiSeason, setApiSeason] = useState(2024);
    const [apiMaxRequests, setApiMaxRequests] = useState(80);
    const [apiLeagueIds, setApiLeagueIds] = useState('39');

    const [highlightFixtureId, setHighlightFixtureId] = useState<number | ''>('');
    const [highlightSyncing, setHighlightSyncing] = useState(false);

    const runBulkSync = () => {
        const dto: DataSyncRunDto = {
            async: bulkAsync,
            statsbomb: bulkStatsbomb,
            statsbombOptions: bulkStatsbomb
                ? { skipLineups: sbSkipLineups, skipPlayers: sbSkipPlayers }
                : undefined,
        };

        if (bulkApiSports) {
            const leagueApiIds = apiLeagueIds
                .split(',')
                .map((s) => parseInt(s.trim(), 10))
                .filter((n) => !Number.isNaN(n));
            dto.apiSports = {
                enabled: true,
                season: apiSeason,
                country: 'England',
                leagueApiIds,
                maxApiRequests: apiMaxRequests,
                leagues: { maxStandingsRequests: 15 },
                players: { maxPages: 2, maxRequestsPerLeague: 8 },
                fixtures: {
                    from: `${apiSeason}-08-01`,
                    to: `${apiSeason + 1}-05-31`,
                    maxRequestsPerLeague: 20,
                },
                enrich: { limit: 25, maxRequests: 20 },
            };
        }

        bulkSync.mutate({ data: dto });
    };

    return (
        <Container size="lg" py="xl">
            <Stack gap="xl">
                <Group justify="space-between" align="flex-start" wrap="wrap">
                    <Stack gap="xs">
                        <ModernH2>
                            Admin <span style={{ color: 'var(--modern-lime)' }}>Dashboard</span>
                        </ModernH2>
                        <Text c="dimmed" size="sm">
                            Data ingestion and platform administration. ADMIN role only.
                        </Text>
                    </Stack>
                    <Button component={Link} to="/admin/discount-codes" variant="light" color="lime">
                        Discount codes
                    </Button>
                </Group>

                <PlatformConfigSection />

                {/* Database snapshot */}
                <Paper p="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <IconDatabase size={20} />
                            <Title order={4}>Database snapshot</Title>
                        </Group>
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconRefresh size={14} />}
                            onClick={() => {
                                void refetchSbStatus();
                                void refetchNewsCount();
                                void refetchHighlightCount();
                            }}
                        >
                            Refresh
                        </Button>
                    </Group>
                    {sbLoading ? (
                        <Center py="md"><Loader size="sm" /></Center>
                    ) : (
                        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                            <StatTile label="Competitions" value={sbStatus?.competitions} />
                            <StatTile label="Teams" value={sbStatus?.teams} />
                            <StatTile label="Players" value={sbStatus?.players} />
                            <StatTile label="Fixtures" value={sbStatus?.fixtures} />
                            <StatTile label="Goals" value={sbStatus?.goals} />
                            <StatTile label="Cards" value={sbStatus?.cards} />
                            <StatTile label="Substitutions" value={sbStatus?.substitutions} />
                            <StatTile label="Events" value={sbStatus?.events} />
                            <StatTile label="News articles" value={newsCount} />
                            <StatTile label="Highlights" value={highlightCount} />
                        </SimpleGrid>
                    )}
                    {sbStatus?.lastSync && (
                        <Text size="xs" c="dimmed" mt="md">Last StatsBomb sync: {sbStatus.lastSync}</Text>
                    )}
                </Paper>

                <Grid gutter="lg">
                    {/* News RSS */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder h="100%">
                            <Stack gap="md" h="100%">
                                <Group gap="xs">
                                    <IconNews size={20} />
                                    <Title order={4}>News RSS ingestion</Title>
                                </Group>
                                <Text size="sm" c="dimmed">
                                    Pull headlines from BBC, ESPN, Sky Sports, and other configured feeds into the news table.
                                </Text>
                                {newsStatus && (
                                    <Group gap="xs">
                                        <Badge variant="light" color={newsStatus.redisConfigured ? 'green' : 'gray'}>
                                            Redis: {newsStatus.redisConfigured ? 'on' : 'off'}
                                        </Badge>
                                        <Badge variant="light">
                                            Scheduler: {newsStatus.scheduler ?? 'unknown'}
                                        </Badge>
                                    </Group>
                                )}
                                <ModernButton
                                    mt="auto"
                                    loading={newsTrigger.isPending}
                                    onClick={() => newsTrigger.mutate()}
                                >
                                    Sync all RSS feeds
                                </ModernButton>
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    {/* StatsBomb only */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper p="lg" radius="md" withBorder h="100%">
                            <Stack gap="md" h="100%">
                                <Group gap="xs">
                                    <IconSoccerField size={20} />
                                    <Title order={4}>StatsBomb open data</Title>
                                </Group>
                                <Text size="sm" c="dimmed">
                                    Sync competitions, teams, fixtures, lineups, and events from StatsBomb GitHub open data.
                                </Text>
                                <Switch
                                    label="Skip lineups"
                                    checked={sbSkipLineups}
                                    onChange={(e) => setSbSkipLineups(e.currentTarget.checked)}
                                />
                                <Switch
                                    label="Skip players"
                                    checked={sbSkipPlayers}
                                    onChange={(e) => setSbSkipPlayers(e.currentTarget.checked)}
                                />
                                <ModernButton
                                    mt="auto"
                                    loading={statsBombSync.isPending}
                                    onClick={() =>
                                        statsBombSync.mutate({
                                            data: {
                                                skipLineups: sbSkipLineups,
                                                skipPlayers: sbSkipPlayers,
                                            },
                                        })
                                    }
                                >
                                    Run StatsBomb sync
                                </ModernButton>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Bulk pipeline */}
                <Paper p="lg" radius="md" withBorder>
                    <Stack gap="md">
                        <Title order={4}>Bulk data sync pipeline</Title>
                        <Text size="sm" c="dimmed">
                            Combined StatsBomb + budgeted API-Sports import. StatsBomb does not count toward the API request budget.
                        </Text>

                        <Group grow align="flex-end">
                            <Switch
                                label="Include StatsBomb"
                                checked={bulkStatsbomb}
                                onChange={(e) => setBulkStatsbomb(e.currentTarget.checked)}
                            />
                            <Switch
                                label="Include API-Sports"
                                checked={bulkApiSports}
                                onChange={(e) => setBulkApiSports(e.currentTarget.checked)}
                            />
                            <Switch
                                label="Run async (BullMQ)"
                                checked={bulkAsync}
                                onChange={(e) => setBulkAsync(e.currentTarget.checked)}
                            />
                        </Group>

                        {bulkApiSports && (
                            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                                <NumberInput
                                    label="Season year"
                                    value={apiSeason}
                                    onChange={(v) => setApiSeason(Number(v) || 2024)}
                                    min={2015}
                                    max={2030}
                                />
                                <NumberInput
                                    label="Max API requests"
                                    value={apiMaxRequests}
                                    onChange={(v) => setApiMaxRequests(Number(v) || 0)}
                                    min={0}
                                />
                                <TextInput
                                    label="League API IDs (comma-separated)"
                                    value={apiLeagueIds}
                                    onChange={(e) => setApiLeagueIds(e.currentTarget.value)}
                                    placeholder="39"
                                />
                            </SimpleGrid>
                        )}

                        <Group>
                            <ModernButton loading={bulkSync.isPending} onClick={runBulkSync}>
                                Run bulk sync
                            </ModernButton>
                            {lastJobId != null && (
                                <Button variant="light" onClick={() => void refetchJob()}>
                                    Refresh job #{lastJobId}
                                </Button>
                            )}
                        </Group>

                        {jobDetail && lastJobId != null && (
                            <Alert variant="light" title={`Job #${lastJobId}`}>
                                <Text size="sm">Status: {String(jobDetail.status ?? '—')}</Text>
                                <Box component="pre" mt="xs" style={{ fontSize: 12, overflow: 'auto', maxHeight: 200 }}>
                                    {JSON.stringify(jobDetail, null, 2)}
                                </Box>
                            </Alert>
                        )}
                    </Stack>
                </Paper>

                <Divider />

                {/* Match Highlights */}
                <Paper p="lg" radius="md" withBorder>
                    <Stack gap="md">
                        <Group gap="xs">
                            <IconVideo size={20} />
                            <Title order={4}>Match highlights</Title>
                        </Group>
                        <Text size="sm" c="dimmed">
                            Fetch and store highlight metadata from YouTube for a completed fixture.
                            Only embed URLs and thumbnails are saved — no video is downloaded.
                            The scheduler auto-runs 15 minutes after fixture completion when Redis is enabled.
                        </Text>
                        <Group align="flex-end" gap="sm">
                            <NumberInput
                                label="Fixture ID"
                                placeholder="e.g. 123"
                                value={highlightFixtureId}
                                onChange={(v) => setHighlightFixtureId(v === '' ? '' : Number(v))}
                                min={1}
                                style={{ width: 160 }}
                            />
                            <ModernButton
                                loading={highlightSyncing}
                                disabled={!highlightFixtureId}
                                onClick={async () => {
                                    if (!highlightFixtureId) return;
                                    setHighlightSyncing(true);
                                    try {
                                        const result = await syncFixtureHighlights(Number(highlightFixtureId));
                                        notify.success('Highlights', result.message);
                                    } catch {
                                        notify.error('Highlights sync failed', 'Check the fixture ID and YouTube API key.');
                                    } finally {
                                        setHighlightSyncing(false);
                                    }
                                }}
                            >
                                Sync highlights
                            </ModernButton>
                        </Group>
                    </Stack>
                </Paper>

                <Divider />
                <Text size="xs" c="dimmed">
                    RSS content is stored as title, summary, link, and publish date only — full articles remain on the source site.
                </Text>
            </Stack>
        </Container>
    );
}

function formatSyncResult(result: unknown): string {
    if (!result || typeof result !== 'object') return 'Completed.';
    const r = result as { message?: string; result?: { saved?: number; processed?: number } };
    if (r.result?.saved != null) {
        return `${r.message ?? 'Done'} — ${r.result.saved} new articles (${r.result.processed ?? 0} processed).`;
    }
    return r.message ?? 'Completed.';
}
