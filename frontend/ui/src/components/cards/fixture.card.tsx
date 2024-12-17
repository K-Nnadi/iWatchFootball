import { useState } from 'react';
import { Card, Text, Badge, Group, Box, Divider, Button, Modal, SimpleGrid, Stack, useMantineTheme } from '@mantine/core';
import { IconCheck, IconCalendar, IconTrophy, IconFlag } from '@tabler/icons-react';

interface MatchEvent {
    time: number;
    description: string;
    team: 'home' | 'away';
}

interface LoggedFixtureProps {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    date: string; // ISO string or formatted date
    competitionName: string;
    leaguePosition?: number; // position of the user's team in the league
    isVerified: boolean;
    venue?: string;
    userTeam?: 'home' | 'away';
    stage: string; // e.g. "League Game", "Semi-Finals", "Final"
    events?: MatchEvent[]; // Optional events array
}

export function LoggedFixtureCard({
                                      homeTeam,
                                      awayTeam,
                                      homeScore,
                                      awayScore,
                                      date,
                                      competitionName,
                                      leaguePosition,
                                      isVerified,
                                      venue,
                                      userTeam,
                                      stage,
                                      events
                                  }: LoggedFixtureProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const userTeamName = userTeam === 'home' ? homeTeam : awayTeam;
    const resultText =
        homeScore !== undefined && awayScore !== undefined
            ? `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`
            : `${homeTeam} vs ${awayTeam}`;

    const homeEvents = events?.filter((e) => e.team === 'home') || [];
    const awayEvents = events?.filter((e) => e.team === 'away') || [];

    // Sort events by time ascending
    homeEvents.sort((a, b) => a.time - b.time);
    awayEvents.sort((a, b) => a.time - b.time);

    return (
        <>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group position="apart" mb="xs">
                    <Text weight={500} size="lg">
                        {competitionName}
                    </Text>
                    {isVerified && (
                        <Badge color="green" variant="filled" leftSection={<IconCheck size={14} />}>
                            Verified
                        </Badge>
                    )}
                </Group>

                <Text size="sm" color="dimmed" mb="xs">
                    {resultText}
                </Text>

                {venue && (
                    <Text size="sm" color="dimmed" mb="xs">
                        Venue: {venue}
                    </Text>
                )}

                <Group spacing="xs" mt="md" mb="md">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconCalendar size={16} />
                        <Text size="sm" ml="xs">
                            {new Date(date).toLocaleDateString()}
                        </Text>
                    </Box>

                    {leaguePosition !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconTrophy size={16} />
                            <Text size="sm" ml="xs">
                                {userTeamName} is currently {leaguePosition}
                                {leaguePosition === 1
                                    ? 'st'
                                    : leaguePosition === 2
                                        ? 'nd'
                                        : leaguePosition === 3
                                            ? 'rd'
                                            : 'th'}{' '}
                                in the league
                            </Text>
                        </Box>
                    )}
                </Group>

                <Group spacing="xs" mb="md">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconFlag size={16} />
                        <Text size="sm" ml="xs">
                            {stage}
                        </Text>
                    </Box>
                </Group>

                {events && events.length > 0 && (
                    <Button variant="outline" size="xs" onClick={() => setModalOpen(true)}>
                        View More
                    </Button>
                )}
            </Card>

            {events && (
                <Modal
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={`${homeTeam} vs ${awayTeam} Events`}
                    size="xl"
                >
                    <Divider mb="md" />
                    <SimpleGrid cols={2}>
                        <Stack spacing="xs">
                            <Text weight={500}>{homeTeam}</Text>
                            {homeEvents.length === 0 && (
                                <Text size="sm" color="dimmed">
                                    No events
                                </Text>
                            )}
                            {homeEvents.map((e, index) => (
                                <Text key={index} size="sm">
                                    {e.time}' - {e.description}
                                </Text>
                            ))}
                        </Stack>
                        <Stack spacing="xs">
                            <Text weight={500} align="right">
                                {awayTeam}
                            </Text>
                            {awayEvents.length === 0 && (
                                <Text size="sm" color="dimmed" align="right">
                                    No events
                                </Text>
                            )}
                            {awayEvents.map((e, index) => (
                                <Text key={index} size="sm" align="right">
                                    {e.time}' - {e.description}
                                </Text>
                            ))}
                        </Stack>
                    </SimpleGrid>
                </Modal>
            )}
        </>
    );
}
