import { useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Card,
    Center,
    Container,
    Group,
    LoadingOverlay,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import { IconFlag, IconSearch } from '@tabler/icons-react';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import type { Team } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import { usePageTransition } from '../hooks/usePageTransition';
import { useTranslation } from '../i18n/useTranslation';
import { ModernBody, ModernH1 } from '../components/modern';
import '../styles/modern.css';

function teamInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function TeamCard({ team, index }: { team: Team; index: number }) {
    const { navigateWithTransition } = usePageTransition();
    const place = [team.city, team.country].filter(Boolean).join(', ');

    return (
        <Card
            className="modern-card"
            padding={0}
            radius={0}
            withBorder={false}
            onClick={() =>
                navigateWithTransition(`/team/${team.id}`, { transitionType: 'loading', duration: 1200 })
            }
            style={{
                cursor: 'pointer',
                animation: `fadeInUp 0.6s ease-out ${Math.min(index, 20) * 0.04}s both`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Card.Section
                style={{
                    padding: '1rem',
                    backgroundColor: 'var(--modern-bg-tertiary)',
                    borderBottom: '1px solid var(--modern-card-border)',
                    minHeight: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Avatar
                    src={team.logoUrl || undefined}
                    size={64}
                    radius="md"
                    alt={team.name}
                    styles={{
                        root: {
                            backgroundColor: 'transparent',
                        },
                        image: {
                            objectFit: 'contain',
                            padding: 4,
                        },
                    }}
                >
                    {teamInitials(team.name)}
                </Avatar>
            </Card.Section>
            <Stack gap="xs" p="md" style={{ flex: 1 }}>
                <Text fw={600} size="md" style={{ lineHeight: 1.2 }}>
                    {team.name}
                </Text>
                {place ? (
                    <Group gap="xs">
                        <IconFlag size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                        <Text size="xs" c="dimmed" fw={500}>
                            {place}
                        </Text>
                    </Group>
                ) : null}
            </Stack>
        </Card>
    );
}

export function TeamsPage() {
    const { t } = useTranslation();
    const { data: teams = [], isLoading: loading } = useGetQueryTeam({ take: 500 } as never);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = [...teams].sort((a, b) => a.name.localeCompare(b.name));
        if (!q) return list;
        return list.filter(
            (team) =>
                team.name.toLowerCase().includes(q) ||
                (team.city ?? '').toLowerCase().includes(q) ||
                (team.country ?? '').toLowerCase().includes(q),
        );
    }, [teams, search]);

    return (
        <Container size="xl" my="xl" pos="relative">
            <LoadingOverlay visible={loading} />
            <Box mb="xl">
                <ModernH1 style={{ marginBottom: '1.5rem' }}>{t('teams.title')}</ModernH1>
                <ModernBody style={{ maxWidth: '600px' }}>{t('teams.subtitle')}</ModernBody>
            </Box>

            <TextInput
                placeholder={t('teams.searchPlaceholder')}
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
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
                <Center py="xl">
                    <Text c="dimmed">{t('teams.noResults', { query: search })}</Text>
                </Center>
            )}

            {filtered.length > 0 && (
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                    {filtered.map((team, index) => (
                        <TeamCard key={team.id} team={team} index={index} />
                    ))}
                </SimpleGrid>
            )}
        </Container>
    );
}
