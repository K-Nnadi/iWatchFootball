import {Badge, Box, Group, Modal, SimpleGrid, Stack, useMantineTheme, Divider} from '@mantine/core';
import {
    IconAlertTriangle,
    IconArrowBackUp,
    IconBallFootball,
    IconCalendar,
    IconCheck,
    IconFlag,
    IconMapPin,
    IconExternalLink,
    IconDownload
} from '@tabler/icons-react';
import React, {useState} from "react";
import { ModernButton, ModernCard, ModernH3, ModernBody } from '../modern';
import { usePageTransition } from '../../hooks/usePageTransition';

export interface MatchEvent {
    time: number;
    description: string;
    team: 'home' | 'away';
    type: 'goal' | 'card' | 'substitution' | 'other' | 'penalty';
}

export interface LoggedFixtureProps {
    fixtureId?: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    date: string;
    competitionName: string;
    leaguePosition?: number;
    isVerified: boolean;
    venue?: string;
    userTeam?: 'home' | 'away';
    stage: string;
    events?: MatchEvent[];
}

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

export function LoggedFixtureCard({ fixtureId, homeTeam, awayTeam, homeScore, awayScore, date, competitionName, leaguePosition, isVerified, venue, userTeam, stage, events }: LoggedFixtureProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const theme = useMantineTheme();
    const { navigateWithTransition } = usePageTransition();
    const userTeamName = userTeam === 'home' ? homeTeam : awayTeam;

    const homeEvents = events?.filter((e: MatchEvent) => e.team === 'home').sort((a: MatchEvent, b: MatchEvent) => a.time - b.time) || [];
    const awayEvents = events?.filter((e: MatchEvent) => e.team === 'away').sort((a: MatchEvent, b: MatchEvent) => a.time - b.time) || [];

    const handleDownloadTicket = () => {
        if (!fixtureId) return;
        // TODO: Implement actual ticket download API call
        // For now, we'll create a download link
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const apiUrl = `${baseURL}/ticket/download/${fixtureId}`;
        window.open(apiUrl, '_blank');
    };

    const handleViewMatch = () => {
        if (!fixtureId) return;
        navigateWithTransition(`/match/${fixtureId}`, {
            transitionType: 'loading',
            duration: 1200
        });
        setModalOpen(false);
    };

    return (
        <>
            <Box
                onClick={() => setModalOpen(true)}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    const card = e.currentTarget.firstChild as HTMLElement;
                    if (card) {
                        card.style.transform = 'translateY(-2px)';
                        card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
                    }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    const card = e.currentTarget.firstChild as HTMLElement;
                    if (card) {
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
                    }
                }}
                style={{ 
                    marginBottom: '1rem',
                    cursor: 'pointer',
                }}
            >
                <ModernCard 
                    style={{ 
                        padding: '1.5rem', 
                        backgroundColor: 'var(--modern-card-bg)', 
                        color: 'var(--modern-text-primary)',
                        border: '1px solid var(--modern-border-color)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px var(--modern-shadow-color)',
                        transition: 'all 0.2s ease',
                    }}
                >
                {/* Header Section */}
                <Box mb="md">
                    <Group gap="xs" mb="sm">
                        <ModernH3 style={{ 
                            color: 'var(--modern-text-primary)', 
                            fontSize: '1rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: 0
                        }}>
                            {competitionName}
                        </ModernH3>
                        <Badge size="sm" style={{ 
                            backgroundColor: 'var(--modern-bg-tertiary)', 
                            color: 'var(--modern-text-secondary)',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}>
                            {stage}
                        </Badge>
                        {isVerified && (
                            <Badge
                                size="sm"
                                leftSection={<IconCheck size={12} />}
                                style={{ 
                                    minWidth: 85, 
                                    backgroundColor: 'var(--modern-lime)', 
                                    color: 'var(--modern-bg-primary)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}
                            >
                                Verified
                            </Badge>
                        )}
                    </Group>
                </Box>

                {/* Score Section */}
                <Box mb="md">
                    <Group justify="space-between" align="center">
                        <ModernBody style={{ 
                            fontWeight: 600, 
                            fontSize: '1rem', 
                            color: 'var(--modern-text-primary)',
                            margin: 0
                        }}>
                            {homeTeam}
                        </ModernBody>
                        <Box style={{
                            minWidth: 60,
                            textAlign: 'center',
                            padding: '8px 16px',
                            backgroundColor: 'var(--modern-lime)',
                            borderRadius: '6px',
                            border: 'none'
                        }}>
                            <ModernH3 style={{ 
                                fontWeight: 700, 
                                fontSize: '1.1rem', 
                                color: 'var(--modern-bg-primary)', 
                                margin: 0 
                            }}>
                                {homeScore} - {awayScore}
                            </ModernH3>
                        </Box>
                        <ModernBody style={{ 
                            fontWeight: 600, 
                            fontSize: '1rem', 
                            color: 'var(--modern-text-primary)',
                            margin: 0
                        }}>
                            {awayTeam}
                        </ModernBody>
                    </Group>
                </Box>

                {/* Details Section */}
                <Box>
                    {venue && (
                        <ModernBody style={{ 
                            fontSize: '0.875rem', 
                            color: 'var(--modern-text-secondary)',
                            margin: 0,
                            fontWeight: 500
                        }}>
                            {venue}
                        </ModernBody>
                    )}
                </Box>
                </ModernCard>
            </Box>

            {/* Match Details Modal */}
            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={
                    <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
                        {homeTeam} vs {awayTeam}
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
                <Stack gap="lg">
                    {/* Match Info */}
                    <Box>
                        <Group justify="space-between" mb="xs">
                            <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                {competitionName}
                            </ModernBody>
                            <Badge size="sm" style={{ 
                                backgroundColor: 'var(--modern-bg-tertiary)', 
                                color: 'var(--modern-text-secondary)',
                                border: 'none',
                            }}>
                                {stage}
                            </Badge>
                        </Group>
                        {venue && (
                            <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>
                                <IconMapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                {venue}
                            </ModernBody>
                        )}
                        <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                            <IconCalendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {new Date(date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </ModernBody>
                    </Box>

                    <Divider color="var(--modern-border-color)" />

                    {/* Events Section */}
                    <Box>
                        <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                            Match Events
                        </ModernH3>
                        <Box style={{ display: 'flex', minHeight: '200px' }}>
                            <Stack gap="md" style={{ flex: 1, paddingRight: '1.5rem' }}>
                                <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>{homeTeam}</ModernH3>
                                {homeEvents.length === 0 ? (
                                    <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem' }}>No events</ModernBody>
                                ) : (
                                    homeEvents.map((e: MatchEvent, index: number) => (
                                        <Group key={index} gap="xs" wrap="nowrap">
                                            <ModernBody style={{ fontWeight: 500, fontSize: '0.875rem', minWidth: 35, color: 'var(--modern-text-primary)' }}>
                                                {e.time}' {eventIcon(e.type)}
                                            </ModernBody>
                                            <ModernBody style={{ fontSize: '0.875rem', color: 'var(--modern-text-primary)' }}>{e.description}</ModernBody>
                                        </Group>
                                    ))
                                )}
                            </Stack>
                            <Divider 
                                orientation="vertical" 
                                color="var(--modern-border-color)"
                                style={{ 
                                    height: 'auto',
                                    alignSelf: 'stretch',
                                    margin: '0 1.5rem'
                                }} 
                            />
                            <Stack gap="md" style={{ flex: 1, paddingLeft: '1.5rem' }}>
                                <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>
                                    {awayTeam}
                                </ModernH3>
                                {awayEvents.length === 0 ? (
                                    <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>
                                        No events
                                    </ModernBody>
                                ) : (
                                    awayEvents.map((e: MatchEvent, index: number) => (
                                        <Group key={index} gap="xs" justify="flex-end" wrap="nowrap">
                                            <ModernBody style={{ fontSize: '0.875rem', color: 'var(--modern-text-primary)' }}>{e.description}</ModernBody>
                                            <ModernBody style={{ fontWeight: 500, fontSize: '0.875rem', minWidth: 35, color: 'var(--modern-text-primary)' }}>
                                                {e.time}' {eventIcon(e.type)}
                                            </ModernBody>
                                        </Group>
                                    ))
                                )}
                            </Stack>
                        </Box>
                    </Box>

                    <Divider color="var(--modern-border-color)" />

                    {/* Action Buttons */}
                    <Group justify="flex-end" gap="md">
                        <ModernButton
                            variant="outline"
                            onClick={handleViewMatch}
                            leftSection={<IconExternalLink size={16} />}
                        >
                            View Match Page
                        </ModernButton>
                        {isVerified && (
                            <ModernButton
                                variant="primary"
                                onClick={handleDownloadTicket}
                                leftSection={<IconDownload size={16} />}
                            >
                                Download Ticket
                            </ModernButton>
                        )}
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
