import {
    Avatar,
    Box,
    Badge,
    Container,
    Paper,
    Text,
    Group,
    Stack,
    UnstyledButton,
    useMantineTheme,
    useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { usePageTransition } from '../../hooks/usePageTransition';
import { ModernButton } from '../modern';
import { type MatchDetails } from './types';
import { getMatchStatus } from './matchCalendarStatus';

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

interface TeamCrestProps {
    teamName: string;
    logoUrl?: string;
    teamId?: number;
    onTeamPress: () => void;
}

function TeamCrest({ teamName, logoUrl, teamId, onTeamPress }: TeamCrestProps) {
    const clickable = typeof teamId === 'number';

    const avatar = (
        <Avatar
            src={logoUrl?.trim() ? logoUrl.trim() : undefined}
            alt={teamName}
            radius={999}
            styles={{
                root: {
                    width: 'clamp(72px, 16vw, 96px)',
                    height: 'clamp(72px, 16vw, 96px)',
                    border: '2px solid var(--modern-border-color)',
                    backgroundColor: 'var(--modern-bg-secondary)',
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                    flexShrink: 0,
                },
                image: {
                    objectFit: 'contain',
                    padding: '10px',
                },
            }}
        >
            <Text fw={800} fz="clamp(1.1rem, 3.5vw, 1.5rem)" c="var(--modern-lime)" lh={1}>
                {teamInitials(teamName)}
            </Text>
        </Avatar>
    );

    if (!clickable) {
        return avatar;
    }

    return (
        <Box
            component="button"
            type="button"
            onClick={onTeamPress}
            style={{
                cursor: 'pointer',
                padding: 0,
                border: 'none',
                background: 'none',
                lineHeight: 0,
                display: 'inline-block',
                borderRadius: 999,
            }}
            onMouseEnter={(e) => {
                const root = e.currentTarget.querySelector('.mantine-Avatar-root') as HTMLElement | null;
                if (root) {
                    root.style.borderColor = 'var(--modern-lime)';
                    root.style.transform = 'scale(1.05)';
                }
            }}
            onMouseLeave={(e) => {
                const root = e.currentTarget.querySelector('.mantine-Avatar-root') as HTMLElement | null;
                if (root) {
                    root.style.borderColor = 'var(--modern-border-color)';
                    root.style.transform = 'scale(1)';
                }
            }}
        >
            {avatar}
        </Box>
    );
}

export interface MatchHeaderProps {
    matchDetails: MatchDetails;
    showViewTicketsButton?: boolean;
    onViewTickets?: () => void;
    variant?: 'full-width' | 'compact';
}

export function MatchHeader({ 
    matchDetails, 
    showViewTicketsButton = false, 
    onViewTickets,
    variant = 'full-width'
}: MatchHeaderProps) {
    const { navigateWithTransition } = usePageTransition();
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

    const ticketStatus = getMatchStatus(matchDetails.date);
    const canViewTickets =
        showViewTicketsButton && ticketStatus !== 'past';

    const hasFixtureScore =
        typeof matchDetails.homeScore === 'number' &&
        typeof matchDetails.awayScore === 'number' &&
        Number.isFinite(matchDetails.homeScore) &&
        Number.isFinite(matchDetails.awayScore);

    const competitionNavId =
        typeof matchDetails.competitionId === 'number' &&
        Number.isFinite(matchDetails.competitionId)
            ? matchDetails.competitionId
            : undefined;

    const competitionBadgeStyle = {
        borderColor: 'rgba(0, 255, 136, 0.35)',
        backgroundColor: 'rgba(0, 255, 136, 0.06)',
        color: 'var(--modern-text-primary)',
        padding: '0.5rem 1rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.11em',
        fontWeight: 600,
        fontSize: 'clamp(0.625rem, 1.25vw, 0.6875rem)',
    };

    const handleViewTickets = () => {
        if (ticketStatus === 'past') return;
        if (onViewTickets) {
            onViewTickets();
        } else {
            navigateWithTransition(`/seat-selection/${matchDetails.matchId}`, {
                transitionType: 'loading',
                duration: 1200,
                state: {
                    homeTeam: matchDetails.homeTeam,
                    awayTeam: matchDetails.awayTeam,
                    homeTeamId: matchDetails.homeTeamId,
                    awayTeamId: matchDetails.awayTeamId,
                    homeTeamLogo: matchDetails.homeTeamLogo,
                    awayTeamLogo: matchDetails.awayTeamLogo,
                    date: matchDetails.date,
                    venue: matchDetails.venue,
                    competition: matchDetails.competition,
                    stadiumId: matchDetails.stadiumId,
                    stadiumMetadata: matchDetails.stadiumMetadata,
                }
            });
        }
    };

    const content = (
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
            <Paper
                p={{ base: 'md', sm: 'xl' }}
                style={{
                    backgroundColor: 'var(--modern-card-bg)',
                    border: '1px solid var(--modern-border-color)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'var(--modern-shadow-md)',
                }}
            >
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 'clamp(220px, 40vw, 320px)',
                        height: 'clamp(220px, 40vw, 320px)',
                        background:
                            'radial-gradient(circle at 0% 0%, rgba(0, 255, 136, 0.06) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }}
                />
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 'clamp(220px, 40vw, 320px)',
                        height: 'clamp(220px, 40vw, 320px)',
                        background:
                            'radial-gradient(circle at 100% 0%, rgba(0, 255, 136, 0.05) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }}
                />

                <Stack gap="md" align="center" style={{ position: 'relative', zIndex: 1 }}>
                    {competitionNavId !== undefined ? (
                        <UnstyledButton
                            type="button"
                            onClick={() => navigateWithTransition(`/competition/${competitionNavId}`)}
                            aria-label={`Open competition: ${matchDetails.competition || 'Match'}`}
                            styles={{
                                root: {
                                    border: 'none',
                                    background: 'transparent',
                                    padding: 0,
                                    borderRadius: 'var(--mantine-radius-xl)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s ease, filter 0.15s ease',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        filter: 'brightness(1.08)',
                                    },
                                    '&:focus-visible': {
                                        outline: '2px solid var(--modern-lime)',
                                        outlineOffset: 4,
                                    },
                                },
                            }}
                        >
                            <Badge size="lg" variant="outline" style={competitionBadgeStyle}>
                                {matchDetails.competition || 'Match'}
                            </Badge>
                        </UnstyledButton>
                    ) : (
                        <Badge size="lg" variant="outline" style={competitionBadgeStyle}>
                            {matchDetails.competition || 'Match'}
                        </Badge>
                    )}

                    <Text
                        fw={650}
                        style={{
                            color:
                                colorScheme === 'dark'
                                    ? 'rgba(255, 255, 255, 0.58)'
                                    : 'var(--modern-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            fontSize: 'clamp(0.75rem, 1.85vw, 0.8125rem)',
                            textAlign: 'center',
                        }}
                    >
                        {new Date(matchDetails.date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                        {' · '}
                        {new Date(matchDetails.date).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        })}
                    </Text>

                    <Group
                        justify="center"
                        style={{
                            width: '100%',
                            maxWidth: 'min(940px, 100%)',
                            marginTop: '0.25rem',
                        }}
                        align={isMobile ? 'stretch' : 'flex-start'}
                        wrap={isMobile ? 'wrap' : 'nowrap'}
                        gap={isMobile ? 'lg' : 'xl'}
                    >
                        <Stack
                            gap="sm"
                            align="center"
                            style={{
                                flex: isMobile ? '1 1 100%' : '1 1 0',
                                minWidth: 0,
                                order: 1,
                            }}
                        >
                            <TeamCrest
                                teamName={matchDetails.homeTeam}
                                logoUrl={matchDetails.homeTeamLogo}
                                teamId={matchDetails.homeTeamId}
                                onTeamPress={() => navigateWithTransition(`/team/${matchDetails.homeTeamId}`)}
                            />
                            <Text
                                fw={800}
                                style={{
                                    color: 'var(--modern-text-primary)',
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                    fontSize: 'clamp(0.9375rem, 2.2vw, 1.0625rem)',
                                    lineHeight: 1.25,
                                }}
                            >
                                {matchDetails.homeTeam}
                            </Text>
                        </Stack>

                        <Stack
                            gap="xs"
                            align="center"
                            justify="flex-start"
                            style={{
                                padding: isMobile ? '0.25rem 0 0.5rem' : 'clamp(2rem, 5vw, 2.75rem) 0 0',
                                width: isMobile ? '100%' : 'clamp(152px, 18vw, 200px)',
                                flexShrink: 0,
                                order: isMobile ? 3 : 2,
                            }}
                        >
                            {hasFixtureScore ? (
                                <>
                                    <Group gap={10} justify="center" wrap="nowrap" align="baseline">
                                        <Text
                                            component="span"
                                            fw={900}
                                            style={{
                                                color: 'var(--modern-text-primary)',
                                                fontSize: 'clamp(2.75rem, 9vw, 3.85rem)',
                                                lineHeight: 1,
                                                fontVariantNumeric: 'tabular-nums',
                                            }}
                                        >
                                            {matchDetails.homeScore}
                                        </Text>
                                        <Text
                                            component="span"
                                            fw={800}
                                            style={{
                                                color: 'var(--modern-lime)',
                                                opacity: 0.92,
                                                fontSize: 'clamp(1.85rem, 6vw, 2.65rem)',
                                                lineHeight: 1,
                                                paddingInline: '0.12em',
                                                fontVariantNumeric: 'tabular-nums',
                                            }}
                                        >
                                            –
                                        </Text>
                                        <Text
                                            component="span"
                                            fw={900}
                                            style={{
                                                color: 'var(--modern-text-primary)',
                                                fontSize: 'clamp(2.75rem, 9vw, 3.85rem)',
                                                lineHeight: 1,
                                                fontVariantNumeric: 'tabular-nums',
                                            }}
                                        >
                                            {matchDetails.awayScore}
                                        </Text>
                                    </Group>
                                    {ticketStatus === 'past' && (
                                        <Text
                                            fz="xs"
                                            tt="uppercase"
                                            fw={650}
                                            style={{
                                                letterSpacing: '0.14em',
                                                color:
                                                    colorScheme === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.45)'
                                                        : 'var(--modern-text-secondary)',
                                            }}
                                        >
                                            Final score
                                        </Text>
                                    )}
                                </>
                            ) : (
                                <Text
                                    fw={900}
                                    style={{
                                        color: 'var(--modern-lime)',
                                        fontSize: 'clamp(1.85rem, 5.5vw, 2.25rem)',
                                        letterSpacing: '0.2em',
                                    }}
                                >
                                    VS
                                </Text>
                            )}
                            {canViewTickets && (
                                <ModernButton
                                    variant="primary"
                                    size={isMobile ? 'md' : 'sm'}
                                    onClick={handleViewTickets}
                                    style={{
                                        width: isMobile ? '100%' : 'auto',
                                        maxWidth: isMobile ? '300px' : 'none',
                                        marginTop: '0.25rem',
                                    }}
                                >
                                    View Tickets
                                </ModernButton>
                            )}
                        </Stack>

                        <Stack
                            gap="sm"
                            align="center"
                            style={{
                                flex: isMobile ? '1 1 100%' : '1 1 0',
                                minWidth: 0,
                                order: isMobile ? 2 : 3,
                            }}
                        >
                            <TeamCrest
                                teamName={matchDetails.awayTeam}
                                logoUrl={matchDetails.awayTeamLogo}
                                teamId={matchDetails.awayTeamId}
                                onTeamPress={() => navigateWithTransition(`/team/${matchDetails.awayTeamId}`)}
                            />
                            <Text
                                fw={800}
                                style={{
                                    color: 'var(--modern-text-primary)',
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                    fontSize: 'clamp(0.9375rem, 2.2vw, 1.0625rem)',
                                    lineHeight: 1.25,
                                }}
                            >
                                {matchDetails.awayTeam}
                            </Text>
                        </Stack>
                    </Group>

                    <Group gap={8} mt="xs" justify="center" wrap="nowrap">
                        <Text aria-hidden fw={650} fz="xs" component="span" style={{ opacity: 0.7 }}>
                            ◆
                        </Text>
                        <Text
                            size="sm"
                            fw={550}
                            component={matchDetails.stadiumId != null ? 'button' : 'span'}
                            type={matchDetails.stadiumId != null ? 'button' : undefined}
                            onClick={
                                matchDetails.stadiumId != null
                                    ? () =>
                                          navigateWithTransition(`/stadium/${matchDetails.stadiumId}`, {
                                              transitionType: 'loading',
                                              duration: 900,
                                          })
                                    : undefined
                            }
                            style={{
                                color:
                                    colorScheme === 'dark'
                                        ? 'rgba(255, 255, 255, 0.72)'
                                        : 'var(--modern-text-secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                fontSize: 'clamp(0.6875rem, 1.5vw, 0.8125rem)',
                                textAlign: 'center',
                                maxWidth: 520,
                                ...(matchDetails.stadiumId != null
                                    ? {
                                          border: 'none',
                                          background: 'transparent',
                                          padding: 0,
                                          cursor: 'pointer',
                                      }
                                    : {}),
                            }}
                        >
                            {matchDetails.venue}
                        </Text>
                        <Text aria-hidden fw={650} fz="xs" component="span" style={{ opacity: 0.7 }}>
                            ◆
                        </Text>
                    </Group>
                </Stack>
            </Paper>
        </Container>
    );

    if (variant === 'full-width') {
        return (
            <Box
                py={{ base: '3rem', md: '6rem' }}
                style={{
                    backgroundColor: 'var(--modern-bg-primary)',
                    color: 'var(--modern-text-primary)',
                    position: 'relative',
                    overflowX: 'hidden',
                    ...(!isMobile && {
                        width: '100vw',
                        marginLeft: 'calc(50% - 50vw)',
                        marginRight: 'calc(50% - 50vw)',
                    }),
                }}
            >
                {/* Subtle Background Pattern */}
                <Box
                    className="section-background-pattern"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.03,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                {content}
            </Box>
        );
    }

    return content;
}

