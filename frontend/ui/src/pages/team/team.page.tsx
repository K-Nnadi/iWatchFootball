// TeamPage.tsx
import {
    Container,
    Title,
    Group,
    Image,
    Box,
    Tabs,
    Text,
    Table,
    Paper,
    Badge, SegmentedControl, Select
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import {mockTeams} from "./mockTeams";
import {useState} from "react";

export function TeamPage() {
    const { id } = useParams();
    const numericId = Number(id);
    const [selectedComp, setSelectedComp] = useState<string>('All Competitions');
    const [homeAwayFilter, setHomeAwayFilter] = useState<'all' | 'home' | 'away'>('all');

// Get unique competitions team is in


// Format for Select component
    // Mock data for now
    const teams = mockTeams
    const team = teams.find(t => t.id === numericId);
    if (!team) {
        return (
            <Container>
                <Title order={2}>Team Not Found</Title>
                <Text color="dimmed">No team found with ID {id}</Text>
            </Container>
        );
    }
    const competitions = Array.from(new Set(team.fixtures.map(f => f.competition)));
    const compOptions = ['All Competitions', ...competitions];


    return (
        <Container size="lg" py="xl">
            <Group position="apart" align="center" mb="lg">
                <Group spacing="md">
                    <Image
                        src={team.crest}
                        alt={team.name}
                        width={100}
                        height={100}
                        fit="contain"
                        radius="xs"
                    />

                    <Box>
                        <Title order={2}>{team.name}</Title>
                        <Text size="sm" color="dimmed">
                            Founded: {team.founded} • Stadium: {team.stadium}
                        </Text>
                    </Box>
                </Group>
                <Group>
                    <Image src={team.manager.image} width={50} radius="xl" />
                    <Box>
                        <Text size="sm">Manager</Text>
                        <Text weight={600}>{team.manager.name}</Text>
                        <Text size="xs" color="dimmed">{team.manager.nationality}</Text>
                    </Box>
                </Group>
            </Group>

            <Tabs defaultValue="squad" radius="md" keepMounted={false}>
                <Tabs.List>
                    <Tabs.Tab value="squad">Squad</Tabs.Tab>
                    <Tabs.Tab value="fixtures">Fixtures</Tabs.Tab>
                    <Tabs.Tab value="transfers">Transfers</Tabs.Tab>
                    <Tabs.Tab value="achievements">Achievements</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="squad" pt="md">
                    <Table>
                        <thead>
                        <tr>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Age</th>
                            <th>Nationality</th>
                        </tr>
                        </thead>
                        <tbody>
                        {team.squad.map((player) => (
                            <tr key={player.name}>
                                <td>{player.name}</td>
                                <td>{player.position}</td>
                                <td>{player.age}</td>
                                <td>{player.nationality}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Tabs.Panel>

                <Tabs.Panel value="fixtures" pt="md">
                    {/* Filters */}
                    <Group mb="md" grow>
                        <Select
                            label="Competition"
                            data={compOptions}
                            value={selectedComp}
                            onChange={(val) => setSelectedComp(val || 'All Competitions')}
                            clearable={false}
                        />

                        <SegmentedControl
                            value={homeAwayFilter}
                            onChange={(val) => setHomeAwayFilter(val as 'all' | 'home' | 'away')}
                            data={[
                                { label: 'All', value: 'all' },
                                { label: 'Home', value: 'home' },
                                { label: 'Away', value: 'away' },
                            ]}
                        />
                    </Group>

                    {/* Filtered Fixtures */}
                    <Paper withBorder p="md">
                        {team.fixtures
                            .filter((f) => {
                                const matchesComp = selectedComp === 'All Competitions' || f.competition === selectedComp;
                                const matchesVenue =
                                    homeAwayFilter === 'all'
                                        ? true
                                        : homeAwayFilter === 'home'
                                            ? f.home === true
                                            : f.home === false;

                                return matchesComp && matchesVenue;
                            })
                            .map((f, i) => (
                                <Group key={i} position="apart" mb="xs">
                                    <Box>
                                        <Text weight={500}>{f.competition}</Text>
                                        <Text size="sm" color="dimmed">{f.date} – vs {f.opponent}</Text>
                                    </Box>
                                    <Badge>{f.home ? 'Home' : 'Away'}</Badge>
                                </Group>
                            ))
                        }

                        {/* Empty state */}
                        {team.fixtures.filter((f) => {
                            const matchesComp = selectedComp === 'All Competitions' || f.competition === selectedComp;
                            const matchesVenue =
                                homeAwayFilter === 'all'
                                    ? true
                                    : homeAwayFilter === 'home'
                                        ? f.home === true
                                        : f.home === false;

                            return matchesComp && matchesVenue;
                        }).length === 0 && (
                            <Text color="dimmed">No matches found for selected filters.</Text>
                        )}
                    </Paper>
                </Tabs.Panel>


                <Tabs.Panel value="transfers" pt="md">
                    <Title order={4} mb="sm">In</Title>
                    <ul>
                        {team.transfers.ins.map((t) => (
                            <li key={t.name}>{t.name} — <strong>{t.fee}</strong></li>
                        ))}
                    </ul>
                    <Title order={4} mt="md" mb="sm">Out</Title>
                    <ul>
                        {team.transfers.outs.map((t) => (
                            <li key={t.name}>{t.name} — <strong>{t.fee}</strong></li>
                        ))}
                    </ul>
                </Tabs.Panel>

                <Tabs.Panel value="achievements" pt="md">
                    {team.achievements.map((a) => (
                        <Box key={a.title} mb="md">
                            <Title order={4}>{a.title}</Title>
                            <Text color="dimmed">{a.years.join(', ')}</Text>
                        </Box>
                    ))}
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
