import { useState } from 'react';
import { Container, Grid, Paper, Tabs, Title, Text, SimpleGrid, Button, Card, Modal, List } from '@mantine/core';

const StatsTab = ({ loggedFixtures }) => {
    const [selectedStat, setSelectedStat] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const calculateStats = () => {
        const stats = {
            topScorers: {},
            topAssists: {},
            mostVisitedVenues: {},
            mostViewedTeams: {},
        };

        loggedFixtures.forEach((fixture) => {
            fixture.events.forEach((event) => {
                if (event.type === 'goal') {
                    stats.topScorers[event.player] = (stats.topScorers[event.player] || 0) + 1;
                }
                if (event.type === 'assist') {
                    stats.topAssists[event.player] = (stats.topAssists[event.player] || 0) + 1;
                }
            });

            stats.mostVisitedVenues[fixture.venue] = (stats.mostVisitedVenues[fixture.venue] || 0) + 1;
            stats.mostViewedTeams[fixture.homeTeam] = (stats.mostViewedTeams[fixture.homeTeam] || 0) + 1;
            stats.mostViewedTeams[fixture.awayTeam] = (stats.mostViewedTeams[fixture.awayTeam] || 0) + 1;
        });

        const sortedStats = Object.keys(stats).reduce((acc, key) => {
            acc[key] = Object.entries(stats[key]).sort((a, b) => b[1] - a[1]).slice(0, 10);
            return acc;
        }, {});

        return sortedStats;
    };

    const stats = calculateStats();

    return (
        <>
            <SimpleGrid cols={2} spacing="lg">
                {Object.keys(stats).map((key) => (
                    <Card
                        key={key}
                        shadow="md"
                        p="xl"
                        withBorder
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                            setSelectedStat({ title: key.replace(/([A-Z])/g, ' $1'), data: stats[key] });
                            setModalOpen(true);
                        }}
                    >
                        <Title order={4} mb="sm">{key.replace(/([A-Z])/g, ' $1')}</Title>
                        <Text size="sm" color="dimmed">Click to view top 10</Text>
                    </Card>
                ))}
            </SimpleGrid>

            <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={selectedStat?.title} centered>
                <List spacing="sm" size="sm">
                    {selectedStat?.data.map(([name, count], index) => (
                        <List.Item key={index}>{index + 1}. {name} - {count}</List.Item>
                    ))}
                </List>
            </Modal>
        </>
    );
};

export default StatsTab;
