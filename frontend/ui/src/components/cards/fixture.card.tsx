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
import { ModernButton, ModernCard, ModernH3, ModernBody, ModernCaption } from '../modern';


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
            <ModernCard style={{ 
                padding: '1.5rem', 
                backgroundColor: 'var(--modern-dark-gray)', 
                color: 'var(--modern-white)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                marginBottom: '1rem'
            }}>
                {/* Header Section */}
                <Box mb="md">
                    <Group gap="xs" mb="sm">
                        <ModernH3 style={{ 
                            color: 'var(--modern-white)', 
                            fontSize: '1rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: 0
                        }}>
                            {competitionName}
                        </ModernH3>
                        <Badge size="sm" style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                            color: 'var(--modern-light-gray)',
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
                                    backgroundColor: '#00ff88', 
                                    color: 'white',
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
                            color: 'var(--modern-white)',
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
                                color: 'var(--modern-black)', 
                                margin: 0 
                            }}>
                                {homeScore} - {awayScore}
                            </ModernH3>
                        </Box>
                        <ModernBody style={{ 
                            fontWeight: 600, 
                            fontSize: '1rem', 
                            color: 'var(--modern-white)',
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
                            color: 'var(--modern-light-gray)',
                            margin: 0,
                            fontWeight: 500
                        }}>
                            {venue}
                        </ModernBody>
                    )}
                </Box>
            </ModernCard>

            {/* Events Modal */}
            {events && (
                <Modal
                    opened={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={
                        <ModernH3 style={{ color: '#374151', fontSize: '1.125rem', fontWeight: 600 }}>
                            Match Events: {homeTeam} vs {awayTeam}
                        </ModernH3>
                    }
                    size="lg"
                >
                    <SimpleGrid cols={2} gap="xl">
                        <Stack gap="md">
                            <ModernH3 style={{ color: '#374151', fontSize: '1rem', fontWeight: 600 }}>{homeTeam}</ModernH3>
                            {homeEvents.length === 0 ? (
                                <ModernBody style={{ color: '#6b7280', fontSize: '0.875rem' }}>No events</ModernBody>
                            ) : (
                                homeEvents.map((e, index) => (
                                    <Group key={index} gap="xs" wrap="nowrap">
                                        <ModernBody style={{ fontWeight: 500, fontSize: '0.875rem', minWidth: 35, color: '#374151' }}>
                                            {e.time}' {eventIcon(e.type)}
                                        </ModernBody>
                                        <ModernBody style={{ fontSize: '0.875rem', color: '#374151' }}>{e.description}</ModernBody>
                                    </Group>
                                ))
                            )}
                        </Stack>
                        <Stack gap="md">
                            <ModernH3 style={{ color: '#374151', fontSize: '1rem', fontWeight: 600, textAlign: 'right' }}>
                                {awayTeam}
                            </ModernH3>
                            {awayEvents.length === 0 ? (
                                <ModernBody style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'right' }}>
                                    No events
                                </ModernBody>
                            ) : (
                                awayEvents.map((e, index) => (
                                    <Group key={index} gap="xs" justify="flex-end" wrap="nowrap">
                                        <ModernBody style={{ fontSize: '0.875rem', color: '#374151' }}>{e.description}</ModernBody>
                                        <ModernBody style={{ fontWeight: 500, fontSize: '0.875rem', minWidth: 35, color: '#374151' }}>
                                            {e.time}' {eventIcon(e.type)}
                                        </ModernBody>
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
