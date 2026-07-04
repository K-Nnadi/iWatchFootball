import {
    Badge,
    Center,
    Container,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import {
    IconChartBar,
    IconClick,
    IconCalendar,
    IconLink,
    IconArrowUpRight,
    IconRepeat,
} from '@tabler/icons-react';
import { ModernH1 } from '../../components/modern';
import { useTicketLinkAnalytics } from '../../shared/api/ticketLink.api';

function StatCard({ label, value, icon: Icon, color = 'var(--ui-text)' }: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color?: string;
}) {
    return (
        <Paper p="md" radius="md" withBorder>
            <Group gap="sm" align="flex-start">
                <Icon size={20} style={{ color: 'var(--ui-text-muted)', marginTop: 2 }} />
                <Stack gap={2}>
                    <Text size="xs" c="dimmed">{label}</Text>
                    <Text fw={700} size="xl" style={{ color }}>{value}</Text>
                </Stack>
            </Group>
        </Paper>
    );
}

export function TicketLinkAnalyticsPage() {
    const { summary, byLink, byFixture } = useTicketLinkAnalytics();

    const isLoading = summary.isLoading || byLink.isLoading || byFixture.isLoading;

    if (isLoading) {
        return (
            <Container size="lg" py="xl">
                <Center py="xl"><Loader /></Center>
            </Container>
        );
    }

    const s = summary.data;
    const links = byLink.data ?? [];
    const fixtures = byFixture.data ?? [];

    return (
        <Container size="lg" py="xl">
            <Group gap="sm" mb="xl">
                <IconChartBar size={28} color="var(--modern-lime)" />
                <ModernH1>Ticket Link Analytics</ModernH1>
            </Group>

            {s && (
                <SimpleGrid cols={{ base: 2, sm: 3, md: 3 }} mb="xl">
                    <StatCard label="Total clicks" value={s.totalClicks.toLocaleString()} icon={IconClick} color="var(--modern-lime)" />
                    <StatCard label="Clicks last 7 days" value={s.clicksLast7Days.toLocaleString()} icon={IconCalendar} />
                    <StatCard label="Clicks last 30 days" value={s.clicksLast30Days.toLocaleString()} icon={IconCalendar} />
                    <StatCard label="Conversions recorded" value={s.totalConversions.toLocaleString()} icon={IconRepeat} color="var(--mantine-color-green-5)" />
                    <StatCard label="Active links" value={s.activeLinks.toLocaleString()} icon={IconLink} />
                    <StatCard label="Affiliate links" value={s.affiliateLinks.toLocaleString()} icon={IconArrowUpRight} />
                </SimpleGrid>
            )}

            <Stack gap="xl">
                <div>
                    <Title order={3} mb="sm">Top links by clicks</Title>
                    {links.length === 0 ? (
                        <Text c="dimmed">No click data yet.</Text>
                    ) : (
                        <Paper radius="md" withBorder>
                            <Table.ScrollContainer minWidth={600}>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Link ID</Table.Th>
                                            <Table.Th>Label</Table.Th>
                                            <Table.Th>Total clicks</Table.Th>
                                            <Table.Th>Last 7 days</Table.Th>
                                            <Table.Th>Last 30 days</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {links.map((row) => (
                                            <Table.Tr key={row.ticketLinkId}>
                                                <Table.Td>
                                                    <Badge variant="outline" size="sm" color="gray">#{row.ticketLinkId}</Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>{row.label ?? '—'}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={600} c="var(--modern-lime)">
                                                        {row.totalClicks.toLocaleString()}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{row.clicksLast7Days.toLocaleString()}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{row.clicksLast30Days.toLocaleString()}</Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </Paper>
                    )}
                </div>

                <div>
                    <Title order={3} mb="sm">Clicks by fixture</Title>
                    {fixtures.length === 0 ? (
                        <Text c="dimmed">No fixture click data yet.</Text>
                    ) : (
                        <Paper radius="md" withBorder>
                            <Table.ScrollContainer minWidth={400}>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Fixture</Table.Th>
                                            <Table.Th>Total clicks</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {fixtures.map((row, i) => (
                                            <Table.Tr key={row.fixtureId ?? `null-${i}`}>
                                                <Table.Td>
                                                    {row.fixtureId != null ? (
                                                        <Badge variant="outline" size="sm" color="blue">
                                                            Fixture #{row.fixtureId}
                                                        </Badge>
                                                    ) : (
                                                        <Text size="xs" c="dimmed">Team / competition links</Text>
                                                    )}
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={600}>{row.totalClicks.toLocaleString()}</Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </Paper>
                    )}
                </div>
            </Stack>
        </Container>
    );
}
