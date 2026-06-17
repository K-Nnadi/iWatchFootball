import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Badge,
    Box,
    Collapse,
    Divider,
    Grid,
    Group,
    Image,
    LoadingOverlay,
    Paper,
    SimpleGrid,
    Stack,
    Text,
} from '@mantine/core';
import { IconChevronRight, IconTicket } from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import { MatchToolbar } from '../components/filters/MatchToolbar';
import { getMatchStatus } from '../components/match/matchCalendarStatus';
import { formatMatchShortDate, useTranslation } from '../i18n';
import {
    UiBody,
    UiButton,
    UiCard,
    UiH1,
    UiH3,
    UiLiveBadge,
    UiPageContainer,
} from '../components/ui';
import listClasses from '../components/ui/MatchList.module.css';

interface TicketMatch {
    id: string;
    competitionName: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    stadiumId?: number;
    stadiumMetadata?: unknown;
    homeScore?: number;
    awayScore?: number;
    isLive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    availableTickets?: number;
}

const competitionCrests: Record<string, string> = {
    'Premier League': 'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png',
    'Champions League': 'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Champions-League-Logo.png',
    'FA Cup': 'https://logos-world.net/wp-content/uploads/2020/06/FA-Cup-Logo.png',
};

const teamCrests: Record<string, string> = {
    'Team A': 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
    'Team B': 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
    'Team C': 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
    'Team D': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
    'Team E': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
    'Team F': 'https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png',
    'Team G': 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
    'Team H': 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
    'Team I': 'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png',
    'Team J': 'https://logos-world.net/wp-content/uploads/2020/06/PSG-Logo.png',
};

function formatPrice(amount: number) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
}

function TicketMatchCard({
    match,
    onBook,
}: {
    match: TicketMatch;
    onBook: (match: TicketMatch) => void;
}) {
    const { t } = useTranslation();
    const isPast = getMatchStatus(match.date) === 'past';
    const kickoff = new Date(match.date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Paper
            radius="md"
            p="md"
            withBorder
            style={{
                backgroundColor: 'var(--ui-bg-elevated)',
                border: '1px solid var(--ui-border)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--ui-shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <Group justify="space-between" mb="xs" wrap="wrap" gap="xs">
                {match.isLive ? <UiLiveBadge /> : <Box />}
                <Badge
                    size="sm"
                    variant="light"
                    leftSection={<IconTicket size={12} />}
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--ui-accent) 18%, transparent)',
                        color: 'var(--ui-accent)',
                        fontWeight: 600,
                    }}
                >
                    {t('tickets.availableCount', { count: match.availableTickets ?? 0 })}
                </Badge>
            </Group>

            <Grid align="center" mb="md">
                <Grid.Col span={2}>
                    <Stack gap="xs" align="center" justify="center">
                        <Image
                            src={teamCrests[match.homeTeam] ?? teamCrests['Team A']}
                            width={32}
                            height={32}
                            fit="contain"
                            alt=""
                        />
                        <Image
                            src={teamCrests[match.awayTeam] ?? teamCrests['Team B']}
                            width={32}
                            height={32}
                            fit="contain"
                            alt=""
                        />
                    </Stack>
                </Grid.Col>

                <Grid.Col span={5}>
                    <Stack gap="xs" justify="center">
                        <Text size="sm" fw={500}>
                            {match.homeTeam}
                        </Text>
                        <Text size="sm" fw={500}>
                            {match.awayTeam}
                        </Text>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={1} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Divider orientation="vertical" size="sm" style={{ height: 60 }} />
                </Grid.Col>

                <Grid.Col span={4}>
                    <Stack gap="xs" align="flex-end" justify="center">
                        {match.homeScore !== undefined && match.awayScore !== undefined ? (
                            <>
                                <Text size="sm" fw={600}>
                                    {match.homeScore}
                                </Text>
                                <Text size="sm" fw={600}>
                                    {match.awayScore}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text size="sm" c="dimmed">
                                    {t('tickets.kickoff')}
                                </Text>
                                <Text size="sm">{kickoff}</Text>
                            </>
                        )}
                    </Stack>
                </Grid.Col>
            </Grid>

            <Group
                justify="space-between"
                mb="md"
                p="xs"
                wrap="wrap"
                gap="sm"
                style={{
                    backgroundColor: 'color-mix(in srgb, var(--ui-accent) 6%, transparent)',
                    borderRadius: 'var(--ui-radius-sm)',
                    border: '1px solid color-mix(in srgb, var(--ui-accent) 22%, transparent)',
                }}
            >
                <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                        {t('tickets.priceRange')}
                    </Text>
                    <Text size="sm" fw={600} c="var(--ui-accent)">
                        {formatPrice(match.minPrice ?? 0)} – {formatPrice(match.maxPrice ?? 0)}
                    </Text>
                </Stack>
                <Stack gap={2} align="flex-end">
                    <Text size="xs" c="dimmed">
                        {t('tickets.venue')}
                    </Text>
                    <Text size="sm" fw={500}>
                        {match.venue}
                    </Text>
                </Stack>
            </Group>

            {!isPast ? (
                <UiButton
                    variant="primary"
                    fullWidth
                    leftSection={<IconTicket size={16} />}
                    onClick={() => onBook(match)}
                >
                    {t('tickets.bookTickets')}
                </UiButton>
            ) : (
                <Text size="sm" c="dimmed" ta="center" py="xs">
                    {t('tickets.pastUnavailable')}
                </Text>
            )}
        </Paper>
    );
}

function TicketCompetitionGroups({
    matchesByCompetition,
    onBook,
}: {
    matchesByCompetition: Record<string, TicketMatch[]>;
    onBook: (match: TicketMatch) => void;
}) {
    const { t } = useTranslation();
    const entries = Object.entries(matchesByCompetition);
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(entries.map(([name]) => [name, true])),
    );

    useEffect(() => {
        setExpanded((prev) => {
            const next = { ...prev };
            entries.forEach(([name]) => {
                if (!(name in next)) next[name] = true;
            });
            return next;
        });
    }, [entries]);

    return (
        <div className={listClasses.matchListStack}>
            {entries.map(([competitionName, compMatches]) => {
                const isOpen = expanded[competitionName] ?? true;
                const matchLabel =
                    compMatches.length === 1
                        ? t('tickets.matchesInCompetitionSingular', { count: compMatches.length })
                        : t('tickets.matchesInCompetitionPlural', { count: compMatches.length });

                return (
                    <div
                        key={competitionName}
                        className={`${listClasses.matchList} ${isOpen ? listClasses.matchListOpen : listClasses.matchListCollapsed}`}
                    >
                        <button
                            type="button"
                            className={`${listClasses.leagueHeader} ${isOpen ? listClasses.leagueHeaderOpen : ''}`}
                            onClick={() =>
                                setExpanded((prev) => ({ ...prev, [competitionName]: !isOpen }))
                            }
                            aria-expanded={isOpen}
                        >
                            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                                {competitionCrests[competitionName] ? (
                                    <Image
                                        src={competitionCrests[competitionName]}
                                        alt=""
                                        width={22}
                                        height={22}
                                        fit="contain"
                                        style={{ flexShrink: 0 }}
                                    />
                                ) : null}
                                <span className={listClasses.leagueName}>{competitionName}</span>
                            </Group>
                            <span className={listClasses.leagueHeaderEnd}>
                                <span className={listClasses.leagueCount}>{matchLabel}</span>
                                <IconChevronRight
                                    size={16}
                                    stroke={2}
                                    className={`${listClasses.chevron} ${isOpen ? listClasses.chevronOpen : ''}`}
                                    aria-hidden
                                />
                            </span>
                        </button>
                        <Collapse in={isOpen}>
                            <div className={listClasses.matchGroupBody} style={{ padding: 'var(--ui-space-4)' }}>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                    {compMatches.map((match) => (
                                        <TicketMatchCard key={match.id} match={match} onBook={onBook} />
                                    ))}
                                </SimpleGrid>
                            </div>
                        </Collapse>
                    </div>
                );
            })}
        </div>
    );
}

export function TicketsPage() {
    const { navigateWithTransition } = usePageTransition();
    const { t } = useTranslation();
    const [matches, setMatches] = useState<TicketMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [teamSearch, setTeamSearch] = useState('');

    const windowSize = 7;

    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const [currentStartDate, setCurrentStartDate] = useState(() => new Date(today));
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);

    const dates = useMemo(() => {
        const arr: Date[] = [];
        for (let i = 0; i < windowSize; i++) {
            const d = new Date(currentStartDate);
            d.setDate(currentStartDate.getDate() + i);
            d.setHours(0, 0, 0, 0);
            arr.push(d);
        }
        return arr;
    }, [currentStartDate, windowSize]);

    const selectedDateKey = dates[selectedDateIndex]?.toDateString() ?? '';

    function onPrevClick() {
        const newStart = new Date(currentStartDate);
        newStart.setDate(newStart.getDate() - 1);
        newStart.setHours(0, 0, 0, 0);
        if (newStart < today) return;
        setCurrentStartDate(newStart);
    }

    function onNextClick() {
        const newStart = new Date(currentStartDate);
        newStart.setDate(newStart.getDate() + 1);
        setCurrentStartDate(newStart);
    }

    function onDateSelect(date: Date) {
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);
        const clamped = selected < today ? today : selected;
        const indexInWindow = dates.findIndex((d) => d.toDateString() === clamped.toDateString());

        if (indexInWindow !== -1) {
            setSelectedDateIndex(indexInWindow);
        } else {
            setCurrentStartDate(clamped);
            setSelectedDateIndex(0);
        }
    }

    function onReturnToToday() {
        setCurrentStartDate(new Date(today));
        setSelectedDateIndex(0);
    }

    function getDateLabelForNav(d: Date): string {
        const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diff = (dayDate.getTime() - dayToday.getTime()) / (24 * 3600 * 1000);

        if (diff === 0) return t('matches.today');
        if (diff === 1) return t('matches.tomorrow');
        return formatMatchShortDate(d);
    }

    const isAtEarliestDate = currentStartDate.getTime() <= today.getTime();

    useEffect(() => {
        const date = dates[selectedDateIndex];
        if (!date) return;

        setLoading(true);
        const timer = window.setTimeout(() => {
            if (date < today) {
                setMatches([]);
                setLoading(false);
                return;
            }

            const isToday = date.toDateString() === today.toDateString();
            const now = new Date();
            const currentHour = now.getHours();

            const mockMatches: TicketMatch[] = [
                {
                    id: 'match1',
                    competitionName: 'Premier League',
                    homeTeam: 'Team A',
                    awayTeam: 'Team B',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0).toISOString(),
                    venue: 'Stadium A',
                    homeScore: isToday && currentHour >= 15 && currentHour < 17 ? 1 : undefined,
                    awayScore: isToday && currentHour >= 15 && currentHour < 17 ? 0 : undefined,
                    isLive: isToday && currentHour >= 15 && currentHour < 17,
                    minPrice: 45.0,
                    maxPrice: 250.0,
                    availableTickets: 150,
                },
                {
                    id: 'match2',
                    competitionName: 'Premier League',
                    homeTeam: 'Team C',
                    awayTeam: 'Team D',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium B',
                    homeScore: isToday && currentHour >= 17 && currentHour < 19 ? 2 : undefined,
                    awayScore: isToday && currentHour >= 17 && currentHour < 19 ? 1 : undefined,
                    isLive: isToday && currentHour >= 17 && currentHour < 19,
                    minPrice: 55.0,
                    maxPrice: 300.0,
                    availableTickets: 89,
                },
                {
                    id: 'match4',
                    competitionName: 'Premier League',
                    homeTeam: 'Team G',
                    awayTeam: 'Team H',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium D',
                    isLive: false,
                    minPrice: 40.0,
                    maxPrice: 200.0,
                    availableTickets: 234,
                },
                {
                    id: 'match5',
                    competitionName: 'Champions League',
                    homeTeam: 'Team I',
                    awayTeam: 'Team J',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
                    venue: 'Stadium E',
                    isLive: false,
                    minPrice: 75.0,
                    maxPrice: 450.0,
                    availableTickets: 67,
                },
            ];
            setMatches(mockMatches);
            setLoading(false);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [selectedDateKey, today, dates, selectedDateIndex]);

    const filteredMatches = useMemo(() => {
        const query = teamSearch.trim().toLowerCase();
        const now = new Date();
        return matches.filter((match) => {
            if (new Date(match.date) < now) return false;
            if (query) {
                const inHome = match.homeTeam.toLowerCase().includes(query);
                const inAway = match.awayTeam.toLowerCase().includes(query);
                if (!inHome && !inAway) return false;
            }
            return true;
        });
    }, [matches, teamSearch]);

    const matchesByCompetition = useMemo(
        () =>
            filteredMatches.reduce<Record<string, TicketMatch[]>>((acc, match) => {
                if (!acc[match.competitionName]) acc[match.competitionName] = [];
                acc[match.competitionName].push(match);
                return acc;
            }, {}),
        [filteredMatches],
    );

    const handleViewTickets = useCallback(
        (match: TicketMatch) => {
            navigateWithTransition(`/seat-selection/${match.id}`, {
                transitionType: 'loading',
                duration: 1200,
                state: {
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                    date: match.date,
                    venue: match.venue,
                    competition: match.competitionName,
                    stadiumId: match.stadiumId,
                    stadiumMetadata: match.stadiumMetadata,
                },
            });
        },
        [navigateWithTransition],
    );

    const hasActiveFilters = teamSearch.trim().length > 0;
    const isEmpty = Object.keys(matchesByCompetition).length === 0 && !loading;

    return (
        <Box style={{ backgroundColor: 'var(--ui-bg-base)', minHeight: '100vh' }}>
            <UiPageContainer size="lg">
                <Stack gap="lg">
                    <Stack gap="xs">
                        <UiH1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <IconTicket size={28} color="var(--ui-accent)" />
                            {t('tickets.title')}
                        </UiH1>
                        <UiBody>{t('tickets.subtitle')}</UiBody>
                    </Stack>

                    <MatchToolbar
                        dates={dates}
                        selectedDateIndex={selectedDateIndex}
                        setSelectedDateIndex={setSelectedDateIndex}
                        onPrevClick={onPrevClick}
                        onNextClick={onNextClick}
                        onDateSelect={onDateSelect}
                        onReturnToToday={onReturnToToday}
                        getDateLabel={getDateLabelForNav}
                        showFilterChips={false}
                        disableDatePrev={isAtEarliestDate}
                        minSelectableDate={today}
                        teamSearch={teamSearch}
                        onTeamSearchChange={setTeamSearch}
                    />

                    <Box pos="relative" mih={200}>
                        <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} zIndex={10} />

                        {isEmpty ? (
                            <UiCard density="spacious" style={{ textAlign: 'center' }}>
                                <IconTicket
                                    size={40}
                                    color="var(--ui-text-muted)"
                                    style={{ margin: '0 auto 1rem' }}
                                />
                                <UiH3 style={{ marginBottom: '0.5rem' }}>
                                    {hasActiveFilters ? t('matches.noMatchesFilters') : t('tickets.emptyDate')}
                                </UiH3>
                                <UiBody>
                                    {hasActiveFilters
                                        ? t('matches.tryAdjustingFilters')
                                        : t('tickets.emptyDateHint')}
                                </UiBody>
                            </UiCard>
                        ) : (
                            <TicketCompetitionGroups
                                matchesByCompetition={matchesByCompetition}
                                onBook={handleViewTickets}
                            />
                        )}
                    </Box>
                </Stack>
            </UiPageContainer>
        </Box>
    );
}
