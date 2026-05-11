import { Avatar, Badge, Box, Divider, Group, Modal, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCalendar, IconCheck, IconExternalLink, IconDownload, IconMapPin } from '@tabler/icons-react';
import React, { useState } from 'react';
import { ModernButton, ModernCard, ModernH3, ModernBody } from '../modern';
import { usePageTransition } from '../../hooks/usePageTransition';
import { MatchEventsSection } from '../match/MatchEventsSection';

function teamInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) {
        const w = parts[0];
        if (w.length <= 2) return w.toUpperCase();
        return (w[0] + w[w.length - 1]).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function TeamCrestBlock({
    name,
    crestUrl,
    align,
}: {
    name: string;
    crestUrl?: string;
    align: 'left' | 'right';
}) {
    const ta = align === 'left' ? 'left' : 'right';
    const items = align === 'left' ? 'flex-start' : 'flex-end';

    return (
        <Stack gap={10} justify="flex-start" align={items} style={{ flex: '1 1 0', minWidth: 0 }}>
            <Avatar
                src={crestUrl?.trim() ? crestUrl.trim() : undefined}
                alt={name}
                radius={999}
                styles={{
                    root: {
                        width: 52,
                        height: 52,
                        border: '2px solid var(--modern-border-color)',
                        backgroundColor: 'var(--modern-bg-secondary)',
                    },
                    image: { objectFit: 'contain', padding: '6px' },
                }}
            >
                <Text fz="xs" fw={800} lh={1} c="var(--modern-lime)">
                    {teamInitials(name)}
                </Text>
            </Avatar>
            <Text
                fz="clamp(0.9rem, 2.8vw, 1.125rem)"
                fw={700}
                c="var(--modern-text-primary)"
                ta={ta}
                lineClamp={2}
                style={{ letterSpacing: '0.02em', lineHeight: 1.35 }}
            >
                {name}
            </Text>
        </Stack>
    );
}

export interface LoggedFixtureProps {
    fixtureId?: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamId?: number;
    awayTeamId?: number;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    homeScore: number;
    awayScore: number;
    /** When false, score line shows a placeholder instead of implying 0–0 */
    scoresAvailable?: boolean;
    date: string;
    competitionName: string;
    competitionId?: number;
    leaguePosition?: number;
    isVerified: boolean;
    venue?: string;
    userTeam?: 'home' | 'away';
    stage: string;
}

export function LoggedFixtureCard({
    fixtureId,
    homeTeam,
    awayTeam,
    homeTeamId,
    awayTeamId,
    homeTeamLogo,
    awayTeamLogo,
    homeScore,
    awayScore,
    scoresAvailable = true,
    date,
    competitionName,
    competitionId,
    leaguePosition: _leaguePosition,
    isVerified,
    venue,
    userTeam: _userTeam,
    stage,
}: LoggedFixtureProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const { navigateWithTransition } = usePageTransition();
    const fixtureNumericId = fixtureId ? parseInt(fixtureId, 10) : NaN;

    const handleDownloadTicket = () => {
        if (!fixtureId) return;
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const apiUrl = `${baseURL}/ticket/download/${fixtureId}`;
        window.open(apiUrl, '_blank');
    };

    const handleViewMatch = () => {
        if (!fixtureId) return;
        navigateWithTransition(`/match/${fixtureId}`, {
            transitionType: 'loading',
            duration: 1200,
        });
        setModalOpen(false);
    };

    const competitionHeading = competitionId != null && Number.isFinite(competitionId) && (
        <UnstyledButton
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                navigateWithTransition(`/competition/${competitionId}`);
            }}
            aria-label={`View ${competitionName} competition`}
            styles={{
                root: {
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    textAlign: 'left',
                    cursor: 'pointer',
                    maxWidth: '100%',
                },
            }}
        >
            <Text
                fz="sm"
                fw={600}
                tt="uppercase"
                lh={1.35}
                c="dimmed"
                td="underline"
                style={{ letterSpacing: '0.09em', textUnderlineOffset: 4 }}
            >
                {competitionName}
            </Text>
        </UnstyledButton>
    );

    const competitionPlain = !(competitionId != null && Number.isFinite(competitionId)) && (
        <Text fz="sm" fw={600} tt="uppercase" lh={1.35} c="dimmed" style={{ letterSpacing: '0.09em' }}>
            {competitionName}
        </Text>
    );

    return (
        <>
            <Box
                onClick={() => setModalOpen(true)}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    const card = e.currentTarget.firstChild as HTMLElement;
                    if (card) {
                        card.style.transform = 'translateY(-3px)';
                        card.style.boxShadow = 'var(--modern-shadow-lg)';
                        card.style.borderColor = 'rgba(0, 255, 136, 0.2)';
                    }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    const card = e.currentTarget.firstChild as HTMLElement;
                    if (card) {
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = 'var(--modern-shadow-sm)';
                        card.style.borderColor = 'var(--modern-border-color)';
                    }
                }}
                style={{
                    marginBottom: '1rem',
                    cursor: 'pointer',
                }}
            >
                <ModernCard
                    style={{
                        padding: '1.25rem 1.35rem',
                        backgroundColor: 'var(--modern-card-bg)',
                        color: 'var(--modern-text-primary)',
                        border: '1px solid var(--modern-border-color)',
                        borderRadius: '12px',
                        boxShadow: 'var(--modern-shadow-sm)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    {/* Subtle backdrop accent */}
                    <Box
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                                'radial-gradient(1200px ellipse at 50% -20%, rgba(0, 255, 136, 0.05), transparent 45%)',
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />

                    <Stack gap={0} style={{ position: 'relative', zIndex: 1 }}>
                        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs" mb={14}>
                            <Stack gap={4} style={{ flex: '1 1 220px', minWidth: 0 }}>
                                {competitionHeading}
                                {competitionPlain}
                            </Stack>
                            <Group gap={8} wrap="wrap" justify="flex-end" style={{ flexShrink: 0 }}>
                                <Badge
                                    variant="outline"
                                    size="sm"
                                    style={{
                                        borderColor: 'var(--modern-border-color)',
                                        color: 'var(--modern-text-secondary)',
                                        backgroundColor: 'var(--modern-bg-secondary)',
                                        textTransform: 'capitalize',
                                        fontWeight: 600,
                                        fontSize: '0.6875rem',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    {stage}
                                </Badge>
                                {isVerified && (
                                    <Badge
                                        size="sm"
                                        variant="light"
                                        leftSection={<IconCheck size={12} />}
                                        style={{
                                            backgroundColor: 'rgba(0, 255, 136, 0.12)',
                                            color: 'var(--modern-lime)',
                                            border: '1px solid rgba(0, 255, 136, 0.35)',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Verified
                                    </Badge>
                                )}
                            </Group>
                        </Group>

                        <Divider color="var(--modern-section-divider)" mb="lg" />

                        <Group gap="lg" justify="center" align="stretch" wrap="nowrap" mb="lg">
                            <TeamCrestBlock name={homeTeam} crestUrl={homeTeamLogo} align="left" />
                            <Stack justify="center" align="center" gap={6} style={{ flexShrink: 0 }}>
                                <Box
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: 12,
                                        backgroundColor: 'var(--modern-bg-secondary)',
                                        border: '1px solid rgba(0, 255, 136, 0.38)',
                                        minWidth: 88,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Text
                                        fz="clamp(1.2rem, 3.8vw, 1.55rem)"
                                        fw={900}
                                        c="var(--modern-lime)"
                                        style={{
                                            fontVariantNumeric: 'tabular-nums',
                                            lineHeight: 1.05,
                                        }}
                                    >
                                        {scoresAvailable ? `${homeScore} – ${awayScore}` : '— · —'}
                                    </Text>
                                </Box>
                                {scoresAvailable ? (
                                    <Text
                                        fz="xs"
                                        c="dimmed"
                                        tt="uppercase"
                                        fw={600}
                                        style={{ letterSpacing: '0.08em', opacity: 0.72 }}
                                    >
                                        FT
                                    </Text>
                                ) : null}
                            </Stack>
                            <TeamCrestBlock name={awayTeam} crestUrl={awayTeamLogo} align="right" />
                        </Group>

                        {venue ? (
                            <>
                                <Divider color="var(--modern-section-divider)" mb={12} />
                                <Group gap={8} align="center">
                                    <IconMapPin size={15} stroke={1.75} style={{ color: 'var(--modern-text-secondary)', opacity: 0.85, flexShrink: 0 }} />
                                    <ModernBody
                                        style={{
                                            fontSize: '0.8125rem',
                                            color: 'var(--modern-text-secondary)',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            lineHeight: 1.35,
                                            margin: 0,
                                        }}
                                    >
                                        {venue}
                                    </ModernBody>
                                </Group>
                            </>
                        ) : null}
                    </Stack>
                </ModernCard>
            </Box>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={
                    <Stack gap={6}>
                        <ModernH3 style={{ color: 'var(--modern-text-primary)', fontSize: '1.125rem', fontWeight: 600 }}>
                            {homeTeam} vs {awayTeam}
                        </ModernH3>
                        {scoresAvailable ? (
                            <ModernBody style={{ color: 'var(--modern-lime)', fontWeight: 800, fontSize: '1.05rem' }}>
                                {homeScore} – {awayScore}
                            </ModernBody>
                        ) : (
                            <ModernBody style={{ color: 'var(--modern-text-secondary)', fontSize: '0.85rem' }}>
                                Final score not available in your log yet.
                            </ModernBody>
                        )}
                    </Stack>
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
                    <Box>
                        <Group justify="space-between" mb="xs" align="flex-start">
                            {competitionId != null && Number.isFinite(competitionId) ? (
                                <UnstyledButton
                                    type="button"
                                    onClick={() => navigateWithTransition(`/competition/${competitionId}`)}
                                    styles={{
                                        root: {
                                            border: 'none',
                                            background: 'transparent',
                                            padding: 0,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        },
                                    }}
                                >
                                    <ModernBody
                                        style={{
                                            color: 'var(--modern-lime)',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            textDecoration: 'underline',
                                            textUnderlineOffset: 3,
                                        }}
                                    >
                                        {competitionName}
                                    </ModernBody>
                                </UnstyledButton>
                            ) : (
                                <ModernBody
                                    style={{ color: 'var(--modern-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}
                                >
                                    {competitionName}
                                </ModernBody>
                            )}
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

                    {modalOpen && Number.isFinite(fixtureNumericId) && fixtureNumericId > 0 ? (
                        <MatchEventsSection
                            fixtureId={fixtureNumericId}
                            homeTeamId={homeTeamId}
                            awayTeamId={awayTeamId}
                            homeTeamName={homeTeam}
                            awayTeamName={awayTeam}
                        />
                    ) : null}

                    <Divider color="var(--modern-border-color)" />

                    <Group justify="flex-end" gap="md">
                        <ModernButton
                            variant="outline"
                            onClick={handleViewMatch}
                            leftSection={<IconExternalLink size={16} />}
                        >
                            View Match Page
                        </ModernButton>
                        {isVerified && (
                            <ModernButton variant="primary" onClick={handleDownloadTicket} leftSection={<IconDownload size={16} />}>
                                Download Ticket
                            </ModernButton>
                        )}
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
