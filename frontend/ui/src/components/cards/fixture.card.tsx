import { Avatar, Badge, Box, Divider, Group, Modal, Stack, Text, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar, IconCheck, IconExternalLink, IconDownload, IconMapPin } from '@tabler/icons-react';
import React, { useState } from 'react';
import { UiButton, UiCard, UiBody, UiCaption, UiH3 } from '../ui';
import { usePageTransition } from '../../hooks/usePageTransition';
import { MatchEventsSection } from '../match/MatchEventsSection';
import { useTranslation } from '../../i18n/useTranslation';
import { formatLocaleDateTime, formatLogCardDate } from '../../i18n/formatDate';
import classes from './fixture.card.module.css';

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

/** Hide generic stage labels that repeat the competition name (e.g. "League" under "Premier League"). */
function shouldShowStage(stage: string, competitionName: string): boolean {
    const normalized = stage.trim().toLowerCase();
    if (!normalized) return false;

    const redundantStages = new Set(['league', 'regular season', 'regular', 'domestic league']);
    if (redundantStages.has(normalized)) return false;

    const comp = competitionName.trim().toLowerCase();
    if (comp && (normalized === comp || comp.includes(normalized))) return false;

    return true;
}

function TeamCrestBlock({
    name,
    crestUrl,
    align,
    compact,
}: {
    name: string;
    crestUrl?: string;
    align: 'left' | 'right';
    compact?: boolean;
}) {
    const ta = align === 'left' ? 'left' : 'right';
    const items = align === 'left' ? 'flex-start' : 'flex-end';

    const crest = (
        <Avatar
            src={crestUrl?.trim() ? crestUrl.trim() : undefined}
            alt={name}
            radius={999}
            classNames={{ root: classes.crestRoot, image: classes.crestImage }}
        >
            <Text fz={compact ? 10 : 'xs'} fw={800} lh={1} c="var(--ui-accent)">
                {teamInitials(name)}
            </Text>
        </Avatar>
    );

    if (compact) {
        return (
            <Group
                gap="xs"
                align="center"
                wrap="nowrap"
                className={classes.teamRow}
                style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}
            >
                {crest}
                <Text ta={ta} lineClamp={2} className={classes.teamNameCompact}>
                    {name}
                </Text>
            </Group>
        );
    }

    return (
        <Stack justify="flex-start" align={items} className={classes.teamStack} style={{ flex: '1 1 0', minWidth: 0 }}>
            {crest}
            <Text ta={ta} lineClamp={2} className={classes.teamName}>
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
    const { t } = useTranslation();
    const isCompact = useMediaQuery('(max-width: 48em)');
    const [modalOpen, setModalOpen] = useState(false);
    const { navigateWithTransition } = usePageTransition();
    const fixtureNumericId = fixtureId ? parseInt(fixtureId, 10) : NaN;
    const showStage = shouldShowStage(stage, competitionName);
    const hasValidDate = Boolean(date) && !Number.isNaN(new Date(date).getTime());

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
            aria-label={t('logs.viewCompetitionAria', { name: competitionName })}
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
                c="var(--ui-text-secondary)"
                td="underline"
                style={{ letterSpacing: '0.09em', textUnderlineOffset: 4 }}
            >
                {competitionName}
            </Text>
        </UnstyledButton>
    );

    const competitionPlain = !(competitionId != null && Number.isFinite(competitionId)) && (
        <Text fz="sm" fw={600} tt="uppercase" lh={1.35} c="var(--ui-text-secondary)" style={{ letterSpacing: '0.09em' }}>
            {competitionName}
        </Text>
    );

    return (
        <>
            <UiCard
                hover
                density={isCompact ? 'compact' : 'default'}
                onClick={() => setModalOpen(true)}
                className={classes.card}
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(1200px ellipse at 50% -20%, var(--ui-accent-muted), transparent 45%)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                <Stack gap={0} style={{ position: 'relative', zIndex: 1 }}>
                    <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs" className={classes.header}>
                        <Stack gap={4} style={{ flex: '1 1 220px', minWidth: 0 }}>
                            {competitionHeading}
                            {competitionPlain}
                        </Stack>
                        <Group gap={8} wrap="wrap" justify="flex-end" style={{ flexShrink: 0 }}>
                            {showStage && (
                                <Badge
                                    variant="outline"
                                    size="sm"
                                    style={{
                                        borderColor: 'var(--ui-border)',
                                        color: 'var(--ui-text-secondary)',
                                        backgroundColor: 'var(--ui-bg-surface)',
                                        textTransform: 'capitalize',
                                        fontWeight: 600,
                                        fontSize: '0.6875rem',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    {stage}
                                </Badge>
                            )}
                            {isVerified && (
                                <Badge
                                    size="sm"
                                    variant="light"
                                    leftSection={<IconCheck size={12} />}
                                    style={{
                                        backgroundColor: 'var(--ui-accent-muted)',
                                        color: 'var(--ui-accent)',
                                        border: '1px solid rgba(0, 200, 83, 0.35)',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    {t('logs.verified')}
                                </Badge>
                            )}
                        </Group>
                    </Group>

                    {!isCompact && <Divider color="var(--ui-divider)" mb="md" />}

                    <Group
                        gap={isCompact ? 'sm' : 'lg'}
                        justify="center"
                        align="center"
                        wrap="nowrap"
                        className={classes.matchRow}
                    >
                        <TeamCrestBlock
                            name={homeTeam}
                            crestUrl={homeTeamLogo}
                            align="left"
                            compact={isCompact}
                        />
                        <Stack justify="center" align="center" gap={4} style={{ flexShrink: 0 }}>
                            <Box className={classes.scoreBox}>
                                <Text className={classes.scoreText}>
                                    {scoresAvailable ? `${homeScore} – ${awayScore}` : '— · —'}
                                </Text>
                            </Box>
                            {scoresAvailable ? (
                                <UiCaption
                                    style={{
                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                        letterSpacing: '0.08em',
                                        opacity: 0.72,
                                        fontSize: '0.6875rem',
                                    }}
                                >
                                    {t('logs.fullTime')}
                                </UiCaption>
                            ) : null}
                        </Stack>
                        <TeamCrestBlock
                            name={awayTeam}
                            crestUrl={awayTeamLogo}
                            align="right"
                            compact={isCompact}
                        />
                    </Group>

                    {(hasValidDate || venue) && (
                        <>
                            <Divider color="var(--ui-divider)" mb={isCompact ? 8 : 12} />
                            <Group className={classes.metaRow}>
                                {hasValidDate && (
                                    <Group gap={6} align="center" wrap="nowrap">
                                        <IconCalendar
                                            size={14}
                                            stroke={1.75}
                                            style={{ color: 'var(--ui-text-secondary)', opacity: 0.85, flexShrink: 0 }}
                                        />
                                        <UiCaption
                                            style={{
                                                fontWeight: 500,
                                                letterSpacing: '0.04em',
                                                lineHeight: 1.35,
                                                margin: 0,
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {formatLogCardDate(date)}
                                        </UiCaption>
                                    </Group>
                                )}
                                {hasValidDate && venue && (
                                    <Text className={classes.metaSep} aria-hidden>
                                        ·
                                    </Text>
                                )}
                                {venue && (
                                    <Group gap={6} align="center" wrap="nowrap">
                                        <IconMapPin
                                            size={14}
                                            stroke={1.75}
                                            style={{ color: 'var(--ui-text-secondary)', opacity: 0.85, flexShrink: 0 }}
                                        />
                                        <UiCaption
                                            style={{
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                lineHeight: 1.35,
                                                margin: 0,
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {venue}
                                        </UiCaption>
                                    </Group>
                                )}
                            </Group>
                        </>
                    )}
                </Stack>
            </UiCard>

            <Modal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={
                    <Stack gap={6}>
                        <UiH3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            {homeTeam} vs {awayTeam}
                        </UiH3>
                        {scoresAvailable ? (
                            <UiBody style={{ color: 'var(--ui-accent)', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>
                                {homeScore} – {awayScore}
                            </UiBody>
                        ) : (
                            <UiBody style={{ color: 'var(--ui-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                                {t('logs.scoreUnavailable')}
                            </UiBody>
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
                        backgroundColor: 'var(--ui-bg-elevated)',
                        boxShadow: 'var(--ui-shadow-md)',
                        border: '1px solid var(--ui-border)',
                    },
                    header: {
                        backgroundColor: 'var(--ui-bg-surface)',
                        borderBottom: '1px solid var(--ui-border)',
                        padding: '1.5rem',
                    },
                    body: {
                        padding: '1.5rem',
                        backgroundColor: 'var(--ui-bg-elevated)',
                    },
                    close: {
                        color: 'var(--ui-text-primary)',
                        '&:hover': {
                            backgroundColor: 'var(--ui-bg-hover)',
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
                                    <UiBody
                                        style={{
                                            color: 'var(--ui-accent)',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            textDecoration: 'underline',
                                            textUnderlineOffset: 3,
                                            margin: 0,
                                        }}
                                    >
                                        {competitionName}
                                    </UiBody>
                                </UnstyledButton>
                            ) : (
                                <UiBody style={{ color: 'var(--ui-text-secondary)', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                                    {competitionName}
                                </UiBody>
                            )}
                            {showStage && (
                                <Badge
                                    size="sm"
                                    style={{
                                        backgroundColor: 'var(--ui-bg-surface)',
                                        color: 'var(--ui-text-secondary)',
                                        border: 'none',
                                    }}
                                >
                                    {stage}
                                </Badge>
                            )}
                        </Group>
                        {venue && (
                            <UiBody style={{ color: 'var(--ui-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                                <IconMapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                {venue}
                            </UiBody>
                        )}
                        {hasValidDate && (
                            <UiBody style={{ color: 'var(--ui-text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                                <IconCalendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                {formatLocaleDateTime(date)}
                            </UiBody>
                        )}
                    </Box>

                    <Divider color="var(--ui-border)" />

                    {modalOpen && Number.isFinite(fixtureNumericId) && fixtureNumericId > 0 ? (
                        <MatchEventsSection
                            fixtureId={fixtureNumericId}
                            homeTeamId={homeTeamId}
                            awayTeamId={awayTeamId}
                            homeTeamName={homeTeam}
                            awayTeamName={awayTeam}
                        />
                    ) : null}

                    <Divider color="var(--ui-border)" />

                    <Group justify="flex-end" gap="md">
                        <UiButton
                            variant="outline"
                            onClick={handleViewMatch}
                            leftSection={<IconExternalLink size={16} />}
                        >
                            {t('logs.viewMatchPage')}
                        </UiButton>
                        {isVerified && (
                            <UiButton variant="primary" onClick={handleDownloadTicket} leftSection={<IconDownload size={16} />}>
                                {t('logs.downloadTicket')}
                            </UiButton>
                        )}
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
