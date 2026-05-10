import { useState, useMemo } from 'react';
import { Container, SimpleGrid, Card, Text, Group, LoadingOverlay, Badge, Box, Stack, Center, TextInput, Divider } from '@mantine/core';
import { IconWorld, IconFlag, IconTrophy, IconSearch, IconStar } from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import { ModernH1, ModernH2, ModernBody } from '../components/modern';
import { useGetQueryCompetition } from '@iWatchFootball/clients/controllers/competition';
import type { Competition } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import '../styles/modern.css';

function CompetitionCard({ comp, index }: { comp: Competition; index: number }) {
    const { navigateWithTransition } = usePageTransition();
    const isInternational = !comp.country || comp.country.toLowerCase() === 'international';

    return (
        <Card
            key={comp.id}
            className="modern-card"
            padding={0}
            radius={0}
            withBorder={false}
            onClick={() => navigateWithTransition(`/competition/${comp.id}`, { transitionType: 'loading', duration: 1200 })}
            style={{
                cursor: 'pointer',
                animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Card.Section
                style={{
                    position: 'relative',
                    padding: '1rem',
                    backgroundColor: 'var(--modern-bg-tertiary)',
                    borderBottom: '1px solid var(--modern-card-border)',
                    minHeight: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Center style={{ height: '72px', color: 'var(--modern-text-secondary)' }}>
                    {isInternational
                        ? <IconWorld size={40} stroke={1.5} />
                        : <IconTrophy size={40} stroke={1.5} />
                    }
                </Center>
                {comp.type && (
                    <Badge
                        variant="light"
                        style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 255, 136, 0.15)',
                            color: 'var(--modern-lime)',
                            border: '1px solid rgba(0, 255, 136, 0.25)',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        {comp.type}
                    </Badge>
                )}
            </Card.Section>

            <Stack gap="xs" p="md" style={{ flex: 1 }}>
                <Text fw={600} size="md" style={{ lineHeight: 1.2 }}>
                    {comp.name}
                </Text>

                <Group gap="xs">
                    {isInternational ? (
                        <>
                            <IconWorld size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                            <Text size="xs" c="dimmed">International</Text>
                        </>
                    ) : (
                        <>
                            <IconFlag size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                            <Text size="xs" c="dimmed" fw={500}>{comp.country}</Text>
                        </>
                    )}
                </Group>
            </Stack>
        </Card>
    );
}

export function CompetitionsPage() {
    const { data: competitions = [], isLoading: loading } = useGetQueryCompetition({ take: 200 } as any);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return competitions;
        return competitions.filter(c =>
            c.name.toLowerCase().includes(q) ||
            (c.country ?? '').toLowerCase().includes(q) ||
            (c.type ?? '').toLowerCase().includes(q)
        );
    }, [competitions, search]);

    const featured = useMemo(() => filtered.filter(c => (c as any).featured), [filtered]);
    const rest = useMemo(() => filtered.filter(c => !(c as any).featured), [filtered]);

    return (
        <Container size="xl" my="xl" pos="relative">
            <LoadingOverlay visible={loading} />
            <Box mb="xl">
                <ModernH1 style={{ marginBottom: '1.5rem' }}>Competitions</ModernH1>
                <ModernBody style={{ maxWidth: '600px' }}>
                    Explore football competitions from around the world
                </ModernBody>
            </Box>

            <TextInput
                placeholder="Search by name, country or type…"
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={e => setSearch(e.currentTarget.value)}
                mb="xl"
                size="md"
                styles={{
                    input: {
                        backgroundColor: 'var(--modern-bg-secondary)',
                        borderColor: 'var(--modern-border-color)',
                        color: 'var(--modern-text-primary)',
                        '&:focus': { borderColor: 'var(--modern-lime)' },
                    },
                }}
            />

            {filtered.length === 0 && !loading && (
                <Text c="dimmed" ta="center" py="xl">No competitions match "{search}"</Text>
            )}

            {featured.length > 0 && (
                <>
                    <Group gap="xs" mb="lg">
                        <IconStar size={20} style={{ color: 'var(--modern-lime)' }} />
                        <ModernH2 style={{ margin: 0 }}>Featured</ModernH2>
                    </Group>
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md" mb="xl">
                        {featured.map((comp, i) => <CompetitionCard key={comp.id} comp={comp} index={i} />)}
                    </SimpleGrid>
                    {rest.length > 0 && <Divider mb="xl" />}
                </>
            )}

            {rest.length > 0 && (
                <>
                    {featured.length > 0 && (
                        <Group gap="xs" mb="lg">
                            <IconTrophy size={20} style={{ color: 'var(--modern-text-secondary)' }} />
                            <ModernH2 style={{ margin: 0, color: 'var(--modern-text-secondary)' }}>All Competitions</ModernH2>
                        </Group>
                    )}
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                        {rest.map((comp, i) => <CompetitionCard key={comp.id} comp={comp} index={i} />)}
                    </SimpleGrid>
                </>
            )}
        </Container>
    );
}
