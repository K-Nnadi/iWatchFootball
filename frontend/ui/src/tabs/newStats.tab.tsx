import { Card, Image, Text, Title, Stack, Group, Divider, ScrollArea, Modal, Badge, Box } from '@mantine/core';
import { IconBallFootball, IconCalendar, IconMapPin, IconExternalLink } from '@tabler/icons-react';
import { useState } from 'react';
import { UserGame, MatchEvent } from '../pages/logs.page';
import { ModernCard, ModernH3, ModernBody, ModernButton } from '../components/modern';
import { usePageTransition } from '../hooks/usePageTransition';

interface PlayerStats {
    rank: number;
    name: string;
    id: string; // Player ID for navigation
    team: string;
    crest: string; // Team crest URL
    image?: string; // Player image URL (only for 1st place)
    value: number;
}
interface StatCategory {
    title: string;
    topPlayers: PlayerStats[];
}

interface PlayerGameStats {
    fixture: UserGame;
    goals: number;
    assists: number;
    cards: number;
    substitutions: number;
    penalties: number;
    events: MatchEvent[];
}

interface StatsTabProps {
    loggedFixtures: UserGame[];
}

const NewStatsTab = ({ loggedFixtures }: StatsTabProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<{ name: string; id: string; category: string } | null>(null);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<{ name: string; id: string } | null>(null);
    const [venueModalOpen, setVenueModalOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<{ name: string; id: string } | null>(null);
    const { navigateWithTransition } = usePageTransition();

    // Helper function to get player ID from name
    // In a real app, this would come from the backend/events
    const getPlayerId = (playerName: string, fixture?: UserGame): string => {
        // First, try to find player ID from events
        if (fixture?.events) {
            for (const event of fixture.events) {
                if (event.playerId && event.description.toLowerCase().includes(playerName.toLowerCase())) {
                    return event.playerId;
                }
                if (event.assistPlayerId && event.description.toLowerCase().includes(playerName.toLowerCase())) {
                    return event.assistPlayerId;
                }
            }
        }
        
        // Fallback: create a mapping or use a default
        // In production, this should come from your backend
        const playerIdMap: Record<string, string> = {
            // Add your player name to ID mappings here
            // Example: 'John Smith': 'player-123'
        };
        
        return playerIdMap[playerName] || `player-${playerName.toLowerCase().replace(/\s+/g, '-')}`;
    };

    // Helper function to get team ID from name
    const getTeamId = (teamName: string): string => {
        // In production, this should come from your backend
        const teamIdMap: Record<string, string> = {
            // Add your team name to ID mappings here
        };
        
        return teamIdMap[teamName] || `team-${teamName.toLowerCase().replace(/\s+/g, '-')}`;
    };

    // Get all player stats across games
    const getPlayerGameStats = (playerName: string, playerId: string): PlayerGameStats[] => {
        const playerGames: PlayerGameStats[] = [];

        loggedFixtures.forEach((fixture) => {
            const playerEvents = fixture.events?.filter((event) => {
                // First check if event has player ID that matches
                if (event.playerId === playerId || event.assistPlayerId === playerId) {
                    return true;
                }
                // Fallback to name matching
                const description = event.description.toLowerCase();
                const nameLower = playerName.toLowerCase();
                // Check if player name appears in the event description
                return description.includes(nameLower) || 
                       description.match(new RegExp(`(?:by|from)\\s+${nameLower.replace(/\s+/g, '\\s+')}`, 'i'));
            }) || [];

            if (playerEvents.length > 0) {
                const goals = playerEvents.filter(e => e.type === 'goal').length;
                const assists = playerEvents.filter(e => e.description.toLowerCase().includes('assist')).length;
                const cards = playerEvents.filter(e => e.type === 'card').length;
                const substitutions = playerEvents.filter(e => e.type === 'substitution').length;
                const penalties = playerEvents.filter(e => e.type === 'penalty').length;

                playerGames.push({
                    fixture,
                    goals,
                    assists,
                    cards,
                    substitutions,
                    penalties,
                    events: playerEvents,
                });
            }
        });

        return playerGames;
    };

    // Calculate stats from logged fixtures
    const calculateStats = (): StatCategory[] => {
        const stats: {
            goals: Record<string, { count: number; id: string }>;
            assists: Record<string, { count: number; id: string }>;
            venues: Record<string, number>;
            teams: Record<string, { count: number; id: string }>;
        } = {
            goals: {},
            assists: {},
            venues: {},
            teams: {},
        };

        loggedFixtures.forEach((fixture) => {
            // Count venues
            if (fixture.venue) {
                stats.venues[fixture.venue] = (stats.venues[fixture.venue] || 0) + 1;
            }
            
            // Count teams
            const homeTeamId = getTeamId(fixture.homeTeam);
            const awayTeamId = getTeamId(fixture.awayTeam);
            if (!stats.teams[fixture.homeTeam]) {
                stats.teams[fixture.homeTeam] = { count: 0, id: homeTeamId };
            }
            stats.teams[fixture.homeTeam].count += 1;
            if (!stats.teams[fixture.awayTeam]) {
                stats.teams[fixture.awayTeam] = { count: 0, id: awayTeamId };
            }
            stats.teams[fixture.awayTeam].count += 1;

            // Count goals and assists from events
            fixture.events?.forEach((event) => {
                const description = event.description.toLowerCase();
                
                if (event.type === 'goal') {
                    // Extract player name from description if available
                    const playerMatch = event.description.match(/(?:by|from)\s+([^,()]+)/i);
                    if (playerMatch) {
                        const player = playerMatch[1].trim();
                        const playerId = event.playerId || getPlayerId(player, fixture);
                        if (!stats.goals[player]) {
                            stats.goals[player] = { count: 0, id: playerId };
                        }
                        stats.goals[player].count += 1;
                        // Update ID if we found one in the event
                        if (event.playerId) {
                            stats.goals[player].id = event.playerId;
                        }
                    }
                    
                    // Check for assists mentioned in goal description
                    // Patterns: "Goal by X (assist: Y)", "Goal by X assisted by Y", etc.
                    const assistInGoalPatterns = [
                        /\(assist(?:ed)?\s*(?:by|from|:)?\s*([^)]+)\)/i,
                        /assist(?:ed)?\s*(?:by|from|:)\s+([^,()]+)/i,
                    ];
                    
                    for (const pattern of assistInGoalPatterns) {
                        const assistMatch = event.description.match(pattern);
                        if (assistMatch) {
                            const assistPlayer = assistMatch[1].trim();
                            // Remove common words that might be captured
                            const cleanPlayer = assistPlayer.replace(/^(by|from|:)\s*/i, '').trim();
                            if (cleanPlayer && cleanPlayer.length > 0 && !cleanPlayer.match(/^(goal|by|from|team)/i)) {
                                const assistPlayerId = event.assistPlayerId || getPlayerId(cleanPlayer, fixture);
                                if (!stats.assists[cleanPlayer]) {
                                    stats.assists[cleanPlayer] = { count: 0, id: assistPlayerId };
                                }
                                stats.assists[cleanPlayer].count += 1;
                                // Update ID if we found one in the event
                                if (event.assistPlayerId) {
                                    stats.assists[cleanPlayer].id = event.assistPlayerId;
                                }
                                break; // Only count once per goal event
                            }
                        }
                    }
                }
                
                // Check for separate assist events (not in goal events)
                if (description.includes('assist') && event.type !== 'goal') {
                    // Try multiple patterns for assist extraction
                    const assistPatterns = [
                        /assist(?:ed)?\s*(?:by|from|:)\s+([^,()]+)/i,
                        /(?:by|from)\s+([^,()]+)/i,
                    ];
                    
                    for (const pattern of assistPatterns) {
                        const playerMatch = event.description.match(pattern);
                        if (playerMatch) {
                            const player = playerMatch[1].trim();
                            // Remove common words that might be captured
                            const cleanPlayer = player.replace(/^(by|from|:)\s*/i, '').trim();
                            if (cleanPlayer && cleanPlayer.length > 0 && !cleanPlayer.match(/^(goal|by|from|team)/i)) {
                                const assistPlayerId = event.assistPlayerId || getPlayerId(cleanPlayer, fixture);
                                if (!stats.assists[cleanPlayer]) {
                                    stats.assists[cleanPlayer] = { count: 0, id: assistPlayerId };
                                }
                                stats.assists[cleanPlayer].count += 1;
                                // Update ID if we found one in the event
                                if (event.assistPlayerId) {
                                    stats.assists[cleanPlayer].id = event.assistPlayerId;
                                }
                                break; // Only count once per assist event
                            }
                        }
                    }
                }
            });
        });

        // Convert to sorted arrays and format for display
        const formatPlayerStats = (data: Record<string, { count: number; id: string }>, title: string): StatCategory => {
            const sorted = Object.entries(data)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10)
                .map(([name, data], index) => ({
                    rank: index + 1,
                    name,
                    id: data.id,
                    team: '', // Could be enhanced to extract team info
                    crest: '',
                    value: data.count,
                }));

            return {
                title,
                topPlayers: sorted,
            };
        };

        const formatTeamStats = (data: Record<string, { count: number; id: string }>, title: string): StatCategory => {
            const sorted = Object.entries(data)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10)
                .map(([name, data], index) => ({
                    rank: index + 1,
                    name,
                    id: data.id,
                    team: '',
                    crest: '',
                    value: data.count,
                }));

            return {
                title,
                topPlayers: sorted,
            };
        };

        const formatVenueStats = (data: Record<string, number>, title: string): StatCategory => {
            const sorted = Object.entries(data)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([name, value], index) => ({
                    rank: index + 1,
                    name,
                    id: `venue-${name.toLowerCase().replace(/\s+/g, '-')}`, // Generate venue ID
                    team: '',
                    crest: '',
                    value,
                }));

            return {
                title,
                topPlayers: sorted,
            };
        };

        const result: StatCategory[] = [];
        
        if (Object.keys(stats.goals).length > 0) {
            result.push(formatPlayerStats(stats.goals, 'Top Goals'));
        }
        if (Object.keys(stats.assists).length > 0) {
            result.push(formatPlayerStats(stats.assists, 'Top Assists'));
        }
        if (Object.keys(stats.venues).length > 0) {
            result.push(formatVenueStats(stats.venues, 'Most Visited Venues'));
        }
        if (Object.keys(stats.teams).length > 0) {
            result.push(formatTeamStats(stats.teams, 'Most Viewed Teams'));
        }

        // If no stats available, return empty array
        return result.length > 0 ? result : [];
    };

    const stats = calculateStats();
    if (stats.length === 0) {
        return (
            <Stack gap="md" p="md" style={{ textAlign: 'center' }}>
                <Text size="lg" c="dimmed">No statistics available for the selected filter</Text>
                <Text size="sm" c="dimmed">Add more matches or change the filter to see statistics</Text>
            </Stack>
        );
    }

    const handlePlayerClick = (playerName: string, playerId: string, category: string) => {
        // Only show modal for player-related stats (goals, assists)
        if (category === 'Top Goals' || category === 'Top Assists') {
            setSelectedPlayer({ name: playerName, id: playerId, category });
            setModalOpen(true);
        }
    };

    const handleTeamClick = (teamName: string, teamId: string) => {
        setSelectedTeam({ name: teamName, id: teamId });
        setTeamModalOpen(true);
    };

    const handleVenueClick = (venueName: string, venueId: string) => {
        setSelectedVenue({ name: venueName, id: venueId });
        setVenueModalOpen(true);
    };

    const handleViewPlayerPage = (playerId: string) => {
        navigateWithTransition(`/player/${playerId}`, {
            transitionType: 'loading',
            duration: 1200
        });
        setModalOpen(false);
    };

    const handleViewTeamPage = (teamId: string) => {
        navigateWithTransition(`/team/${teamId}`, {
            transitionType: 'loading',
            duration: 1200
        });
        setTeamModalOpen(false);
    };

    const handleViewStadium = (venueId: string) => {
        // Navigate to matches page - you can add venue filtering later
        // Alternatively, create a /venue/:id route if needed
        navigateWithTransition(`/matches?venue=${encodeURIComponent(venueId)}`, {
            transitionType: 'loading',
            duration: 1200
        });
        setVenueModalOpen(false);
    };

    const playerGameStats = selectedPlayer ? getPlayerGameStats(selectedPlayer.name, selectedPlayer.id) : [];
    const totalStats = playerGameStats.reduce((acc, game) => ({
        goals: acc.goals + game.goals,
        assists: acc.assists + game.assists,
        cards: acc.cards + game.cards,
        substitutions: acc.substitutions + game.substitutions,
        penalties: acc.penalties + game.penalties,
    }), { goals: 0, assists: 0, cards: 0, substitutions: 0, penalties: 0 });

    return (
        <>
            <ScrollArea h="100vh" p="md">
                <Stack gap="xl">
                    {stats.map((category) => (
                        <Stack key={category.title} gap="md">
                            <Title order={3} style={{ color: 'var(--modern-text-primary)' }}>{category.title}</Title>
                            <Card shadow="sm" radius="md" withBorder style={{ backgroundColor: 'var(--modern-card-bg)', borderColor: 'var(--modern-border-color)' }}>
                                <Stack gap="sm">
                                    {category.topPlayers.map((player, index) => {
                                        const isPlayerClickable = category.title === 'Top Goals' || category.title === 'Top Assists';
                                        const isTeamClickable = category.title === 'Most Viewed Teams';
                                        const isVenueClickable = category.title === 'Most Visited Venues';
                                        const isClickable = isPlayerClickable || isTeamClickable || isVenueClickable;
                                        
                                        return (
                                            <Card 
                                                key={`${category.title}-${player.rank}`} 
                                                p="md" 
                                                shadow={index === 0 ? 'md' : 'xs'} 
                                                radius="md"
                                                style={{ 
                                                    backgroundColor: 'var(--modern-bg-secondary)', 
                                                    borderColor: 'var(--modern-border-color)',
                                                    cursor: isClickable ? 'pointer' : 'default',
                                                    transition: isClickable ? 'all 0.2s ease' : 'none',
                                                }}
                                                onClick={() => {
                                                    if (isPlayerClickable) {
                                                        handlePlayerClick(player.name, player.id, category.title);
                                                    } else if (isTeamClickable) {
                                                        handleTeamClick(player.name, player.id);
                                                    } else if (isVenueClickable) {
                                                        handleVenueClick(player.name, player.id);
                                                    }
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (isClickable) {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (isClickable) {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = index === 0 ? '0 4px 8px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.2)';
                                                    }
                                                }}
                                            >
                                                <Group>
                                                    {player.image && (
                                                        <Image src={player.image} width={50} height={50} radius="50%" />
                                                    )}
                                                    <Stack gap={0}>
                                                        <Text fw={700} size="lg" style={{ color: 'var(--modern-text-primary)' }}>
                                                            {player.name}
                                                        </Text>
                                                        {player.team && (
                                                            <Group gap="xs">
                                                                {player.crest && (
                                                                    <Image src={player.crest} width={20} height={20} />
                                                                )}
                                                                <Text size="sm" c="dimmed">
                                                                    {player.team}
                                                                </Text>
                                                            </Group>
                                                        )}
                                                    </Stack>
                                                    <Text fw={700} size="xl" ml="auto" c="var(--modern-lime)">
                                                        {player.value}
                                                    </Text>
                                                </Group>
                                            </Card>
                                        );
                                    })}
                                </Stack>
                            </Card>
                            <Divider />
                        </Stack>
                    ))}
                </Stack>
            </ScrollArea>

            {/* Player Stats Modal */}
            <Modal
                opened={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedPlayer(null);
                }}
                title={
                    <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
                        {selectedPlayer?.name} - {selectedPlayer?.category}
                    </ModernH3>
                }
                size="xl"
                centered
                overlayProps={{
                    backgroundOpacity: 0.85,
                    blur: 4,
                }}
                styles={{
                    content: {
                        backgroundColor: 'var(--modern-card-bg)',
                        boxShadow: '0 20px 60px var(--modern-shadow-color)',
                        border: '1px solid var(--modern-border-color)',
                    },
                    header: {
                        backgroundColor: 'var(--modern-bg-tertiary)',
                        borderBottom: '1px solid var(--modern-border-color)',
                        padding: '1.5rem',
                    },
                    body: {
                        padding: '1.5rem',
                        backgroundColor: 'var(--modern-card-bg)',
                    },
                    close: {
                        color: 'var(--modern-text-primary)',
                        '&:hover': {
                            backgroundColor: 'var(--modern-bg-tertiary)',
                        },
                    },
                }}
            >
                {selectedPlayer && (
                    <Stack gap="lg">
                        {/* Total Stats Summary */}
                        <Box>
                            <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                Total Statistics
                            </ModernH3>
                            <Group gap="md">
                                {totalStats.goals > 0 && (
                                    <Badge size="lg" style={{ 
                                        backgroundColor: 'var(--modern-lime)', 
                                        color: 'var(--modern-bg-primary)',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        {totalStats.goals} {totalStats.goals === 1 ? 'Goal' : 'Goals'}
                                    </Badge>
                                )}
                                {totalStats.assists > 0 && (
                                    <Badge size="lg" style={{ 
                                        backgroundColor: 'var(--modern-bg-tertiary)', 
                                        color: 'var(--modern-text-primary)',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        {totalStats.assists} {totalStats.assists === 1 ? 'Assist' : 'Assists'}
                                    </Badge>
                                )}
                                {totalStats.cards > 0 && (
                                    <Badge size="lg" color="red" style={{ 
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        {totalStats.cards} {totalStats.cards === 1 ? 'Card' : 'Cards'}
                                    </Badge>
                                )}
                                {totalStats.penalties > 0 && (
                                    <Badge size="lg" color="orange" style={{ 
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        {totalStats.penalties} {totalStats.penalties === 1 ? 'Penalty' : 'Penalties'}
                                    </Badge>
                                )}
                            </Group>
                        </Box>

                        <Divider color="var(--modern-border-color)" />

                        {/* Games List */}
                        <Box>
                            <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                Games ({playerGameStats.length})
                            </ModernH3>
                            <ScrollArea h={400} type="never">
                                <Stack gap="md">
                                    {playerGameStats.length === 0 ? (
                                        <ModernBody style={{ color: 'var(--modern-text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                            No games found for this player
                                        </ModernBody>
                                    ) : (
                                        playerGameStats.map((gameStats, index) => (
                                            <ModernCard 
                                                key={index}
                                                style={{ 
                                                    padding: '1.5rem', 
                                                    backgroundColor: 'var(--modern-bg-secondary)',
                                                    border: '1px solid var(--modern-border-color)',
                                                }}
                                            >
                                                <Stack gap="md">
                                                    {/* Match Header */}
                                                    <Box>
                                                        <Group justify="space-between" mb="xs">
                                                            <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                                                                {gameStats.fixture.homeTeam} vs {gameStats.fixture.awayTeam}
                                                            </ModernH3>
                                                            <Badge size="sm" style={{ 
                                                                backgroundColor: 'var(--modern-lime)', 
                                                                color: 'var(--modern-bg-primary)',
                                                            }}>
                                                                {gameStats.fixture.homeScore} - {gameStats.fixture.awayScore}
                                                            </Badge>
                                                        </Group>
                                                        <Group gap="md" mt="xs">
                                                            {gameStats.fixture.venue && (
                                                                <Group gap={4}>
                                                                    <IconMapPin size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                                                                    <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                                                        {gameStats.fixture.venue}
                                                                    </ModernBody>
                                                                </Group>
                                                            )}
                                                            <Group gap={4}>
                                                                <IconCalendar size={14} style={{ color: 'var(--modern-text-secondary)' }} />
                                                                <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                                                    {new Date(gameStats.fixture.date).toLocaleDateString('en-US', { 
                                                                        year: 'numeric', 
                                                                        month: 'short', 
                                                                        day: 'numeric'
                                                                    })}
                                                                </ModernBody>
                                                            </Group>
                                                        </Group>
                                                    </Box>

                                                    <Divider color="var(--modern-border-color)" />

                                                    {/* Player Stats in this Game */}
                                                    <Box>
                                                        <ModernBody style={{ color: 'var(--modern-text-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                            Performance in this match:
                                                        </ModernBody>
                                                        <Group gap="sm">
                                                            {gameStats.goals > 0 && (
                                                                <Badge size="sm" leftSection={<IconBallFootball size={12} />} style={{ 
                                                                    backgroundColor: 'var(--modern-lime)', 
                                                                    color: 'var(--modern-bg-primary)',
                                                                }}>
                                                                    {gameStats.goals} {gameStats.goals === 1 ? 'Goal' : 'Goals'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.assists > 0 && (
                                                                <Badge size="sm" style={{ 
                                                                    backgroundColor: 'var(--modern-bg-tertiary)', 
                                                                    color: 'var(--modern-text-primary)',
                                                                }}>
                                                                    {gameStats.assists} {gameStats.assists === 1 ? 'Assist' : 'Assists'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.cards > 0 && (
                                                                <Badge size="sm" color="red">
                                                                    {gameStats.cards} {gameStats.cards === 1 ? 'Card' : 'Cards'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.penalties > 0 && (
                                                                <Badge size="sm" color="orange">
                                                                    {gameStats.penalties} {gameStats.penalties === 1 ? 'Penalty' : 'Penalties'}
                                                                </Badge>
                                                            )}
                                                            {gameStats.goals === 0 && gameStats.assists === 0 && gameStats.cards === 0 && gameStats.penalties === 0 && (
                                                                <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                                                    No recorded stats
                                                                </ModernBody>
                                                            )}
                                                        </Group>
                                                    </Box>

                                                    {/* Events in this Game */}
                                                    {gameStats.events.length > 0 && (
                                                        <Box>
                                                            <ModernBody style={{ color: 'var(--modern-text-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                                Events:
                                                            </ModernBody>
                                                            <Stack gap="xs">
                                                                {gameStats.events.map((event, eventIndex) => (
                                                                    <Group key={eventIndex} gap="xs" wrap="nowrap">
                                                                        <ModernBody style={{ 
                                                                            fontWeight: 500, 
                                                                            fontSize: '0.875rem', 
                                                                            minWidth: 40,
                                                                            color: 'var(--modern-text-primary)' 
                                                                        }}>
                                                                            {event.time}'
                                                                        </ModernBody>
                                                                        <ModernBody style={{ fontSize: '0.875rem', color: 'var(--modern-text-primary)' }}>
                                                                            {event.description}
                                                                        </ModernBody>
                                                                    </Group>
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </ModernCard>
                                        ))
                                    )}
                                </Stack>
                            </ScrollArea>
                        </Box>

                        {/* Action Buttons */}
                        <Divider color="var(--modern-border-color)" />
                        <Group justify="flex-end" gap="md">
                            <ModernButton
                                variant="primary"
                                onClick={() => handleViewPlayerPage(selectedPlayer.id)}
                                leftSection={<IconExternalLink size={16} />}
                            >
                                View Player Page
                            </ModernButton>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Team Stats Modal */}
            <Modal
                opened={teamModalOpen}
                onClose={() => {
                    setTeamModalOpen(false);
                    setSelectedTeam(null);
                }}
                title={
                    <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
                        {selectedTeam?.name}
                    </ModernH3>
                }
                size="lg"
                centered
                overlayProps={{
                    backgroundOpacity: 0.85,
                    blur: 4,
                }}
                styles={{
                    content: {
                        backgroundColor: 'var(--modern-card-bg)',
                        boxShadow: '0 20px 60px var(--modern-shadow-color)',
                        border: '1px solid var(--modern-border-color)',
                    },
                    header: {
                        backgroundColor: 'var(--modern-bg-tertiary)',
                        borderBottom: '1px solid var(--modern-border-color)',
                        padding: '1.5rem',
                    },
                    body: {
                        padding: '1.5rem',
                        backgroundColor: 'var(--modern-card-bg)',
                    },
                    close: {
                        color: 'var(--modern-text-primary)',
                        '&:hover': {
                            backgroundColor: 'var(--modern-bg-tertiary)',
                        },
                    },
                }}
            >
                {selectedTeam && (
                    <Stack gap="lg">
                        <Box>
                            <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                You've watched {stats.find(s => s.title === 'Most Viewed Teams')?.topPlayers.find(p => p.name === selectedTeam.name)?.value || 0} {stats.find(s => s.title === 'Most Viewed Teams')?.topPlayers.find(p => p.name === selectedTeam.name)?.value === 1 ? 'match' : 'matches'} involving {selectedTeam.name}.
                            </ModernBody>
                        </Box>
                        <Divider color="var(--modern-border-color)" />
                        <Group justify="flex-end" gap="md">
                            <ModernButton
                                variant="primary"
                                onClick={() => handleViewTeamPage(selectedTeam.id)}
                                leftSection={<IconExternalLink size={16} />}
                            >
                                View Team Page
                            </ModernButton>
                        </Group>
                    </Stack>
                )}
            </Modal>

            {/* Venue Stats Modal */}
            <Modal
                opened={venueModalOpen}
                onClose={() => {
                    setVenueModalOpen(false);
                    setSelectedVenue(null);
                }}
                title={
                    <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
                        {selectedVenue?.name}
                    </ModernH3>
                }
                size="lg"
                centered
                overlayProps={{
                    backgroundOpacity: 0.85,
                    blur: 4,
                }}
                styles={{
                    content: {
                        backgroundColor: 'var(--modern-card-bg)',
                        boxShadow: '0 20px 60px var(--modern-shadow-color)',
                        border: '1px solid var(--modern-border-color)',
                    },
                    header: {
                        backgroundColor: 'var(--modern-bg-tertiary)',
                        borderBottom: '1px solid var(--modern-border-color)',
                        padding: '1.5rem',
                    },
                    body: {
                        padding: '1.5rem',
                        backgroundColor: 'var(--modern-card-bg)',
                    },
                    close: {
                        color: 'var(--modern-text-primary)',
                        '&:hover': {
                            backgroundColor: 'var(--modern-bg-tertiary)',
                        },
                    },
                }}
            >
                {selectedVenue && (
                    <Stack gap="lg">
                        <Box>
                            <Group gap="xs" mb="md">
                                <IconMapPin size={20} style={{ color: 'var(--modern-text-secondary)' }} />
                                <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1rem', fontWeight: 600 }}>
                                    Stadium Information
                                </ModernH3>
                            </Group>
                            <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                You've visited {selectedVenue.name} {stats.find(s => s.title === 'Most Visited Venues')?.topPlayers.find(p => p.name === selectedVenue.name)?.value || 0} {stats.find(s => s.title === 'Most Visited Venues')?.topPlayers.find(p => p.name === selectedVenue.name)?.value === 1 ? 'time' : 'times'}.
                            </ModernBody>
                        </Box>
                        <Divider color="var(--modern-border-color)" />
                        <Group justify="flex-end" gap="md">
                            <ModernButton
                                variant="primary"
                                onClick={() => handleViewStadium(selectedVenue.id)}
                                leftSection={<IconExternalLink size={16} />}
                            >
                                View Stadium
                            </ModernButton>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </>
    );
}
export default NewStatsTab