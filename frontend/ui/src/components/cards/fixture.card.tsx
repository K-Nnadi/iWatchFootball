import {Badge, Box, Button, Card, Group, Modal, Paper, SimpleGrid, Stack, Text, useMantineTheme} from '@mantine/core';
import {
    IconAlertTriangle,
    IconArrowBackUp,
    IconBallFootball,
    IconCalendar,
    IconCheck,
    IconFlag,
    IconMapPin,
    IconTrophy
} from '@tabler/icons-react';
import React, {useState} from "react";


// Define a function to select the icon based on the event type
function eventIcon(type: string) {
    switch (type) {
        case 'goal':
            return <IconBallFootball size={14} style={{ color: 'green' }} />;
        case 'card':
            return <IconAlertTriangle size={14} style={{ color: 'red' }} />;
        case 'substitution':
            return <IconArrowBackUp size={14} style={{ color: 'blue' }} />;
        default:
            return <IconFlag size={14} />;
    }
}

export function LoggedFixtureCard({ homeTeam, awayTeam, homeScore, awayScore, date, competitionName, leaguePosition, isVerified, venue, userTeam, stage, events }: LoggedFixtureProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const theme = useMantineTheme();
    const userTeamName = userTeam === 'home' ? homeTeam : awayTeam;

    const homeEvents = events?.filter((e) => e.team === 'home').sort((a, b) => a.time - b.time) || [];
    const awayEvents = events?.filter((e) => e.team === 'away').sort((a, b) => a.time - b.time) || [];

    return (
        <>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                {/* Header Section */}
                <Group position="apart" mb="md">
                    <Box>
                        <Group spacing="xs">
                            <Text weight={600} size="lg" color={theme.primaryColor}>
                                {competitionName}
                            </Text>
                            <Badge size="sm" color="gray">{stage}
                            </Badge>
                            {isVerified && (
                                <Badge
                                    color="green"
                                    variant="light"
                                    leftSection={<IconCheck size={14} />}
                                    sx={{ minWidth: 85 }}
                                >
                                    Verified
                                </Badge>
                            )}
                        </Group>
                        <Text size="xs" color="dimmed" mt={4}>
                            <Group spacing="xs">
                                <IconCalendar size={14} />
                                {new Date(date).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Group>
                        </Text>
                    </Box>

                </Group>

                {/* Score Section */}
                <Paper p="md" radius="md" withBorder mb="md" sx={{
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]
                }}>
                    <Stack align="center" spacing={4}>
                        <Group position="center" spacing={48}>
                            <Text weight={600} size="lg" align="right" sx={{ minWidth: 120 }}>{homeTeam}</Text>
                            <Box sx={{
                                minWidth: 90,
                                textAlign: 'center',
                                padding: '4px 12px',
                                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.white,
                                borderRadius: theme.radius.sm
                            }}>
                                <Text weight={700} size="xl">
                                    {homeScore} - {awayScore}
                                </Text>
                            </Box>
                            <Text weight={600} size="lg" align="left" sx={{ minWidth: 120 }}>{awayTeam}</Text>
                        </Group>
                    </Stack>
                </Paper>

                {/* Details Section */}
                <Stack spacing="xs">
                    {venue && (
                        <Group spacing="xs" sx={{ color: theme.colors.gray[6] }}>
                            <IconMapPin size={16} />
                            <Text size="sm">{venue}</Text>
                        </Group>
                    )}

                    {leaguePosition !== undefined && (
                        <Group spacing="xs" sx={{ color: theme.colors.gray[6] }}>
                            <IconTrophy size={16} />
                            <Text size="sm">
                                {userTeamName} is {leaguePosition}
                                {leaguePosition === 1
                                    ? 'st'
                                    : leaguePosition === 2
                                        ? 'nd'
                                        : leaguePosition === 3
                                            ? 'rd'
                                            : 'th'} in the league
                            </Text>
                        </Group>
                    )}
                </Stack>

                {/* Events Button */}
                {events && events.length > 0 && (
                    <Button
                        variant="light"
                        color="blue"
                        size="sm"
                        onClick={() => setModalOpen(true)}
                        fullWidth
                        mt="md"
                    >
                        View Match Events
                    </Button>
                )}
            </Card>

            {/* Events Modal */}
            {events && (
                <Modal
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={
                        <Text weight={600} size="lg">
                            Match Events: {homeTeam} vs {awayTeam}
                        </Text>
                    }
                    size="lg"
                >
                    <SimpleGrid cols={2} spacing="xl">
                        <Stack spacing="md">
                            <Text weight={600} color={theme.primaryColor}>{homeTeam}</Text>
                            {homeEvents.length === 0 ? (
                                <Text size="sm" color="dimmed">No events</Text>
                            ) : (
                                homeEvents.map((e, index) => (
                                    <Group key={index} spacing="xs" noWrap>
                                        <Text weight={600} size="sm" sx={{ minWidth: 35 }}>
                                            {e.time}' {eventIcon(e.type)}
                                        </Text>
                                        <Text size="sm">{e.description}</Text>
                                    </Group>
                                ))
                            )}
                        </Stack>
                        <Stack spacing="md">
                            <Text weight={600} color={theme.primaryColor} align="right">
                                {awayTeam}
                            </Text>
                            {awayEvents.length === 0 ? (
                                <Text size="sm" color="dimmed" align="right">
                                    No events
                                </Text>
                            ) : (
                                awayEvents.map((e, index) => (
                                    <Group key={index} spacing="xs" position="right" noWrap>
                                        <Text size="sm">{e.description}</Text>
                                        <Text weight={600} size="sm" sx={{ minWidth: 35 }}>
                                            {e.time}' {eventIcon(e.type)}
                                        </Text>
                                    </Group>
                                ))
                            )}
                        </Stack>
                    </SimpleGrid>
                </Modal>
            )}
        </>
    );
}
