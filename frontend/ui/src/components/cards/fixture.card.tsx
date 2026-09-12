import { Avatar, Box, Divider, Group, Modal, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCalendar, IconExternalLink, IconDownload, IconMapPin } from '@tabler/icons-react';
import React, { useState } from 'react';
import { UiBadge, UiButton, UiCard, UiBody, UiH3 } from '../ui';
import { usePageTransition } from '../../hooks/usePageTransition';
import { MatchEventsSection } from '../match/MatchEventsSection';
import { useTranslation } from '../../i18n/useTranslation';
import { formatLocaleDateTime, formatLogCardDate } from '../../i18n/formatDate';
import classes from './fixture.card.module.css';

function teamInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
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

function TeamSide({
    name,
    crestUrl,
    align,
}: {
    name: string;
    crestUrl?: string;
    align: 'left' | 'right';
}) {
    return (
        <div className={`${classes.teamSide} ${align === 'right' ? classes.teamSideRight : ''}`}>
            <Avatar
                src={crestUrl?.trim() ? crestUrl.trim() : undefined}
                alt={name}
                radius="xl"
                classNames={{ root: classes.crestRoot, image: classes.crestImage }}
            >
                <Text fz={10} fw={700}>
                    {teamInitials(name)}
                </Text>
            </Avatar>
            <span className={classes.teamName}>{name}</span>
        </div>
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
    const [modalOpen, setModalOpen] = useState(false);
    const { navigateWithTransition } = usePageTransition();
    const fixtureNumericId = fixtureId ? parseInt(fixtureId, 10) : NaN;
    const showStage = shouldShowStage(stage, competitionName);
    const hasValidDate = Boolean(date) && !Number.isNaN(new Date(date).getTime());
    const canOpenCompetition = competitionId != null && Number.isFinite(competitionId);

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

    const competitionLabel = (
        <span className={classes.competitionName}>{competitionName}</span>
    );

    return (
        <>
            <UiCard
                density="compact"
                onClick={() => setModalOpen(true)}
                className={classes.card}
            >
                <div className={classes.header}>
                    {canOpenCompetition ? (
                        <UnstyledButton
                            type="button"
                            className={classes.competitionButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateWithTransition(`/competition/${competitionId}`);
                            }}
                            aria-label={t('logs.viewCompetitionAria', { name: competitionName })}
                        >
                            {competitionLabel}
                        </UnstyledButton>
                    ) : (
                        competitionLabel
                    )}
                    <div className={classes.headerBadges}>
                        {showStage && (
                            <UiBadge size="sm" color="gray">
                                {stage}
                            </UiBadge>
                        )}
                        {isVerified && (
                            <UiBadge size="sm">{t('logs.verified')}</UiBadge>
                        )}
                    </div>
                </div>

                <div className={classes.body}>
                    <div className={classes.matchRow}>
                        <TeamSide name={homeTeam} crestUrl={homeTeamLogo} align="left" />
                        <div className={classes.centerBlock}>
                            <span className={classes.score}>
                                {scoresAvailable ? `${homeScore} - ${awayScore}` : '–'}
                            </span>
                            {scoresAvailable ? (
                                <span className={classes.status}>{t('logs.fullTime')}</span>
                            ) : null}
                        </div>
                        <TeamSide name={awayTeam} crestUrl={awayTeamLogo} align="right" />
                    </div>

                    {(hasValidDate || venue) && (
                        <div className={classes.metaRow}>
                            <span className={classes.metaText}>
                                {hasValidDate ? formatLogCardDate(date) : ''}
                            </span>
                            {venue ? (
                                <span className={`${classes.metaText} ${classes.metaVenue}`}>{venue}</span>
                            ) : (
                                <span />
                            )}
                        </div>
                    )}
                </div>
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
                            <UiBody style={{ color: 'var(--ui-text-primary)', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>
                                {homeScore} - {awayScore}
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
                            {canOpenCompetition ? (
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
                                <UiBadge size="sm" color="gray">
                                    {stage}
                                </UiBadge>
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
