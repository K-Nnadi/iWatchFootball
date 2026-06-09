import { useState, useEffect, useMemo } from 'react';
import { Box, LoadingOverlay, Stack } from '@mantine/core';
import { usePageTransition } from '../hooks/usePageTransition';
import { MatchToolbar } from '../components/filters/MatchToolbar';
import { formatMatchShortDate, useTranslation } from '../i18n';
import {
    UiBody,
    UiCard,
    UiH1,
    UiH3,
    UiMatchList,
    UiPageContainer,
    type MatchRowData,
} from '../components/ui';

interface TodayMatch {
    id: string;
    competitionName: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    venue: string;
    homeScore?: number;
    awayScore?: number;
    hasTickets?: boolean;
    isLive?: boolean;
}

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
    'Team K': 'https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png',
    'Team L': 'https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png',
};

function toMatchRowData(m: TodayMatch): MatchRowData {
    const kickoff = new Date(m.date).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (m.isLive && m.homeScore != null && m.awayScore != null) {
        return {
            id: m.id,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            homeLogo: teamCrests[m.homeTeam],
            awayLogo: teamCrests[m.awayTeam],
            time: 'LIVE',
            isLive: true,
            hasTickets: m.hasTickets,
        };
    }

    if (m.homeScore != null && m.awayScore != null) {
        return {
            id: m.id,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            homeLogo: teamCrests[m.homeTeam],
            awayLogo: teamCrests[m.awayTeam],
            time: 'FT',
            isLive: false,
            hasTickets: m.hasTickets,
        };
    }

    return {
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeLogo: teamCrests[m.homeTeam],
        awayLogo: teamCrests[m.awayTeam],
        time: kickoff,
        isLive: false,
        hasTickets: m.hasTickets,
    };
}

export function MatchesPage() {
    const { navigateWithTransition } = usePageTransition();
    const { t } = useTranslation();
    const [matches, setMatches] = useState<TodayMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLive, setShowLive] = useState(false);
    const [showAvailableTickets, setShowAvailableTickets] = useState(false);
    const [teamSearch, setTeamSearch] = useState('');

    const windowSize = 7;

    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const [currentStartDate, setCurrentStartDate] = useState(() => {
        const d = new Date(today);
        d.setDate(d.getDate() - 3);
        return d;
    });

    const [selectedDateIndex, setSelectedDateIndex] = useState(3);

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

        const indexInWindow = dates.findIndex((d) => d.toDateString() === selected.toDateString());

        if (indexInWindow !== -1) {
            setSelectedDateIndex(indexInWindow);
        } else {
            const newStart = new Date(selected);
            newStart.setDate(selected.getDate() - 3);
            setCurrentStartDate(newStart);
            setSelectedDateIndex(3);
        }
    }

    function onReturnToToday() {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        const newStart = new Date(t);
        newStart.setDate(t.getDate() - 3);
        setCurrentStartDate(newStart);
        setSelectedDateIndex(3);
    }

    function getDateLabelForNav(d: Date): string {
        const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diff = (dayDate.getTime() - dayToday.getTime()) / (24 * 3600 * 1000);

        if (diff === 0) return t('matches.today');
        if (diff === -1) return t('matches.yesterday');
        if (diff === 1) return t('matches.tomorrow');
        return formatMatchShortDate(d);
    }

    useEffect(() => {
        const date = dates[selectedDateIndex];
        if (!date) return;

        setLoading(true);
        const timer = window.setTimeout(() => {
            const isPast = date < today && date.toDateString() !== today.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            const now = new Date();
            const currentHour = now.getHours();

            const mockMatches: TodayMatch[] = [
                {
                    id: 'match1',
                    competitionName: 'Premier League',
                    homeTeam: 'Team A',
                    awayTeam: 'Team B',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0).toISOString(),
                    venue: 'Stadium A',
                    homeScore: isPast ? 2 : isToday && currentHour >= 15 && currentHour < 17 ? 1 : undefined,
                    awayScore: isPast ? 1 : isToday && currentHour >= 15 && currentHour < 17 ? 0 : undefined,
                    hasTickets: true,
                    isLive: isToday && currentHour >= 15 && currentHour < 17,
                },
                {
                    id: 'match2',
                    competitionName: 'Premier League',
                    homeTeam: 'Team C',
                    awayTeam: 'Team D',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium B',
                    homeScore: isPast ? 0 : isToday && currentHour >= 17 && currentHour < 19 ? 2 : undefined,
                    awayScore: isPast ? 0 : isToday && currentHour >= 17 && currentHour < 19 ? 1 : undefined,
                    hasTickets: true,
                    isLive: isToday && currentHour >= 17 && currentHour < 19,
                },
                {
                    id: 'match3',
                    competitionName: 'Premier League',
                    homeTeam: 'Team E',
                    awayTeam: 'Team F',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium C',
                    homeScore: isPast ? 0 : undefined,
                    awayScore: isPast ? 0 : undefined,
                    hasTickets: false,
                    isLive: false,
                },
                {
                    id: 'match4',
                    competitionName: 'Premier League',
                    homeTeam: 'Team G',
                    awayTeam: 'Team H',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 30).toISOString(),
                    venue: 'Stadium D',
                    homeScore: isPast ? 0 : undefined,
                    awayScore: isPast ? 0 : undefined,
                    hasTickets: true,
                    isLive: false,
                },
                {
                    id: 'match5',
                    competitionName: 'Champions League',
                    homeTeam: 'Team I',
                    awayTeam: 'Team J',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
                    venue: 'Stadium E',
                    homeScore: isPast ? 3 : undefined,
                    awayScore: isPast ? 2 : undefined,
                    hasTickets: true,
                    isLive: false,
                },
                {
                    id: 'match6',
                    competitionName: 'FA Cup',
                    homeTeam: 'Team K',
                    awayTeam: 'Team L',
                    date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 45).toISOString(),
                    venue: 'Stadium F',
                    homeScore: isPast ? 3 : undefined,
                    awayScore: isPast ? 2 : undefined,
                    hasTickets: false,
                    isLive: false,
                },
            ];
            setMatches(mockMatches);
            setLoading(false);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [selectedDateKey, today, dates, selectedDateIndex]);

    const filteredMatches = useMemo(() => {
        const query = teamSearch.trim().toLowerCase();
        return matches.filter((match) => {
            if (showLive && !match.isLive) return false;
            if (showAvailableTickets && !match.hasTickets) return false;
            if (query) {
                const inHome = match.homeTeam.toLowerCase().includes(query);
                const inAway = match.awayTeam.toLowerCase().includes(query);
                if (!inHome && !inAway) return false;
            }
            return true;
        });
    }, [matches, showLive, showAvailableTickets, teamSearch]);

    const matchGroups = useMemo(() => {
        const byCompetition = filteredMatches.reduce<Record<string, TodayMatch[]>>((acc, match) => {
            if (!acc[match.competitionName]) acc[match.competitionName] = [];
            acc[match.competitionName].push(match);
            return acc;
        }, {});

        return Object.entries(byCompetition).map(([league, compMatches]) => ({
            league,
            matches: compMatches.map(toMatchRowData),
        }));
    }, [filteredMatches]);

    const isEmpty = matchGroups.length === 0 && !loading;

    return (
        <Box style={{ backgroundColor: 'var(--ui-bg-base)', minHeight: '100vh' }}>
            <UiPageContainer size="lg">
                <Stack gap="lg">
                    <UiH1>{t('matches.title')}</UiH1>

                    <MatchToolbar
                        dates={dates}
                        selectedDateIndex={selectedDateIndex}
                        setSelectedDateIndex={setSelectedDateIndex}
                        onPrevClick={onPrevClick}
                        onNextClick={onNextClick}
                        onDateSelect={onDateSelect}
                        onReturnToToday={onReturnToToday}
                        getDateLabel={getDateLabelForNav}
                        showLive={showLive}
                        setShowLive={setShowLive}
                        showAvailableTickets={showAvailableTickets}
                        setShowAvailableTickets={setShowAvailableTickets}
                        teamSearch={teamSearch}
                        onTeamSearchChange={setTeamSearch}
                    />

                    <Box pos="relative" mih={200}>
                        <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} zIndex={10} />

                        {isEmpty ? (
                            <UiCard density="spacious" style={{ textAlign: 'center' }}>
                                <UiH3 style={{ marginBottom: '0.5rem' }}>
                                    {showLive || showAvailableTickets || teamSearch.trim()
                                        ? t('matches.noMatchesFilters')
                                        : t('matches.noMatchesDate')}
                                </UiH3>
                                <UiBody>
                                    {showLive || showAvailableTickets || teamSearch.trim()
                                        ? t('matches.tryAdjustingFilters')
                                        : t('matches.checkBackLater')}
                                </UiBody>
                            </UiCard>
                        ) : (
                            <UiMatchList
                                groups={matchGroups}
                                onMatchClick={(id) => navigateWithTransition(`/match/${id}`)}
                            />
                        )}
                    </Box>
                </Stack>
            </UiPageContainer>
        </Box>
    );
}
