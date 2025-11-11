import { useState, useEffect } from 'react';
import { Container, SimpleGrid, Card, Image, Text, Group, Title, LoadingOverlay, useMantineTheme } from '@mantine/core';
import { usePageTransition } from '../hooks/usePageTransition';

interface Competition {
    id: string;
    name: string;
    logoUrl?: string;
    nation?: string;
    isInternational?: boolean;
}
export function CompetitionsPage() {
    const { navigateWithTransition } = usePageTransition();
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        // TODO: Replace with real API call
        const mockCompetitions: Competition[] = [
            { id: 'comp1', name: 'Premier League', logoUrl: '/logos/premier-league.png', nation: 'England', isInternational: false },
            { id: 'comp2', name: 'La Liga', logoUrl: '/logos/la-liga.png', nation: 'Spain', isInternational: false },
            { id: 'comp3', name: 'Champions League', logoUrl: '/logos/champions-league.png', isInternational: true },
            { id: 'comp4', name: 'World Cup', logoUrl: '/logos/world-cup.png', isInternational: true }
        ];
        setTimeout(() => {
            setCompetitions(mockCompetitions);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <Container size="md" my="xl" pos="relative">
            <LoadingOverlay visible={loading} overlayBlur={2} />
            <Title order={2} mb="lg">Competitions</Title>
            <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                {competitions.map((comp) => (
                    <Card
                        key={comp.id}
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                        onClick={() => navigateWithTransition(`/competition/${comp.id}`, { transitionType: 'loading', duration: 1200 })}
                        style={{ cursor: 'pointer' }}
                    >
                        {comp.logoUrl && (
                            <Card.Section>
                                <Image
                                    src={comp.logoUrl}
                                    alt={`${comp.name} logo`}
                                    fit="contain"
                                    height={120}
                                    withPlaceholder
                                />
                            </Card.Section>
                        )}

                        <Group position="apart" mt="md" mb="xs">
                            <Text weight={500} size="lg">{comp.name}</Text>
                        </Group>

                        {!comp.isInternational && comp.nation && (
                            <Text size="sm" color="dimmed">
                                Nation: {comp.nation}
                            </Text>
                        )}

                        {comp.isInternational && (
                            <Text size="sm" color="dimmed">
                                International Competition
                            </Text>
                        )}
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    );
}
