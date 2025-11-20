import { useState, useEffect } from 'react';
import { Container, SimpleGrid, Card, Image, Text, Group, Title, LoadingOverlay, Badge, Box, Stack, Center } from '@mantine/core';
import { IconWorld, IconFlag } from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import '../styles/modern.css';

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
        <Container size="xl" my="xl" pos="relative">
            <LoadingOverlay visible={loading} />
            <Box mb="xl">
                <Title 
                    order={1} 
                    mb="md"
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                    }}
                >
                    Competitions
                </Title>
                <Text size="lg" c="dimmed" style={{ maxWidth: '600px' }}>
                    Explore football competitions from around the world
                </Text>
            </Box>
            
            <SimpleGrid 
                cols={{ base: 1, sm: 2, md: 3, lg: 4 }} 
                spacing="xl"
            >
                {competitions.map((comp, index) => (
                    <Card
                        key={comp.id}
                        className="modern-card"
                        padding={0}
                        radius={0}
                        withBorder={false}
                        onClick={() => navigateWithTransition(`/competition/${comp.id}`, { transitionType: 'loading', duration: 1200 })}
                        style={{ 
                            cursor: 'pointer',
                            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Card.Section
                            style={{
                                padding: '2rem',
                                backgroundColor: 'var(--modern-bg-tertiary)',
                                borderBottom: '1px solid var(--modern-card-border)',
                                minHeight: '180px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {comp.logoUrl ? (
                                <Box
                                    style={{
                                        transition: 'transform 0.3s ease',
                                    }}
                                    className="competition-logo-wrapper"
                                >
                                    <Image
                                        src={comp.logoUrl}
                                        alt={`${comp.name} logo`}
                                        fit="contain"
                                        height={140}
                                        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%231a1a1a' width='200' height='200'/%3E%3Ctext fill='%23666' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Logo%3C/text%3E%3C/svg%3E"
                                        style={{
                                            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Center style={{ height: '140px', color: 'var(--modern-text-secondary)' }}>
                                    <IconWorld size={64} stroke={1.5} />
                                </Center>
                            )}
                        </Card.Section>

                        <Stack gap="sm" p="xl" style={{ flex: 1 }}>
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <Text 
                                    fw={600} 
                                    size="xl"
                                    style={{
                                        lineHeight: 1.2,
                                        flex: 1,
                                    }}
                                >
                                    {comp.name}
                                </Text>
                                {comp.isInternational && (
                                    <Badge
                                        variant="light"
                                        color="lime"
                                        leftSection={<IconWorld size={14} />}
                                        style={{
                                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                            color: 'var(--modern-lime)',
                                            border: '1px solid rgba(0, 255, 136, 0.2)',
                                        }}
                                    >
                                        Global
                                    </Badge>
                                )}
                            </Group>

                            {!comp.isInternational && comp.nation && (
                                <Group gap="xs" mt="xs">
                                    <IconFlag size={16} style={{ color: 'var(--modern-text-secondary)' }} />
                                    <Text size="sm" c="dimmed" fw={500}>
                                        {comp.nation}
                                    </Text>
                                </Group>
                            )}

                            {comp.isInternational && (
                                <Group gap="xs" mt="xs">
                                    <IconWorld size={16} style={{ color: 'var(--modern-text-secondary)' }} />
                                    <Text size="sm" c="dimmed">
                                        International Competition
                                    </Text>
                                </Group>
                            )}
                        </Stack>
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    );
}
