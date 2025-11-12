import { useState } from 'react';
import { Container, Grid, Paper, Tabs, Title, Text, SimpleGrid, Button, Card, Modal, List } from '@mantine/core';
import { UserGame } from '../pages/logs.page';

interface StatsTabProps {
    loggedFixtures: UserGame[];
}

interface SelectedStat {
    title: string;
    data: [string, number][];
}

const StatsTab = ({ loggedFixtures }: StatsTabProps) => {
    const [selectedStat, setSelectedStat] = useState<SelectedStat | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const calculateStats = () => {
        const stats: {
            topScorers: Record<string, number>;
            topAssists: Record<string, number>;
            mostVisitedVenues: Record<string, number>;
            mostViewedTeams: Record<string, number>;
        } = {
            topScorers: {},
            topAssists: {},
            mostVisitedVenues: {},
            mostViewedTeams: {},
        };

        loggedFixtures.forEach((fixture) => {
            fixture.events?.forEach((event: any) => {
                if (event.type === 'goal' && 'player' in event) {
                    const player = (event as any).player as string;
                    stats.topScorers[player] = (stats.topScorers[player] || 0) + 1;
                }
                if (event.type === 'assist' && 'player' in event) {
                    const player = (event as any).player as string;
                    stats.topAssists[player] = (stats.topAssists[player] || 0) + 1;
                }
            });

            if (fixture.venue) {
                stats.mostVisitedVenues[fixture.venue] = (stats.mostVisitedVenues[fixture.venue] || 0) + 1;
            }
            stats.mostViewedTeams[fixture.homeTeam] = (stats.mostViewedTeams[fixture.homeTeam] || 0) + 1;
            stats.mostViewedTeams[fixture.awayTeam] = (stats.mostViewedTeams[fixture.awayTeam] || 0) + 1;
        });

        const sortedStats: Record<string, [string, number][]> = {};
        Object.keys(stats).forEach((key) => {
            sortedStats[key] = Object.entries(stats[key as keyof typeof stats]).sort((a, b) => b[1] - a[1]).slice(0, 10);
        });

        return sortedStats;
    };

    const stats = calculateStats();

    return (
        <>
            <SimpleGrid cols={2} style={{ gap: 'var(--mantine-spacing-lg)' }}>
                {Object.keys(stats).map((key) => (
                    <Card
                        key={key}
                        shadow="md"
                        p="xl"
                        withBorder
                        style={{ cursor: 'pointer' }}
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
                <List size="sm" style={{ gap: 'var(--mantine-spacing-sm)' }}>
                    {selectedStat?.data.map(([name, count]: [string, number], index: number) => (
                        <List.Item key={index}>{index + 1}. {name} - {count}</List.Item>
                    ))}
                </List>
            </Modal>
        </>
    );
};

export default StatsTab;
