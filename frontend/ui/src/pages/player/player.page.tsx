import { Box, Center, LoadingOverlay, Stack, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useTranslation } from '../../i18n';
import { useGetOnePlayer } from '@iWatchFootball/clients/controllers/player';
import { useGetOneTeam } from '@iWatchFootball/clients/controllers/team';
import { UiH2 } from '../../components/ui';
import {
    MOCK_PLAYERS,
    buildApiPlayerViewModel,
    mergePlayerMatchesIntoViewModel,
    type CareerRow,
    type HighlightStat,
    type PlayerViewModel,
    type RecentMatch,
    type StatCategory,
    type UpcomingFixture,
} from './playerPage.model';
import classes from './player.page.module.css';
import { usePlayerMatches } from '../../shared/api/playerMatches.api';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';
import { fetchPlayerAdvancedStats } from '../../shared/api/advancedStats.api';
import { useQuery } from '@tanstack/react-query';

type MainTab = 'matches' | 'stats' | 'history';
type MatchSegment = 'results' | 'fixtures';
type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function formatDob(dateOfBirth?: string): string {
    if (!dateOfBirth) return '';
    const d = new Date(dateOfBirth);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function roleLabel(position: string, t: TranslateFn): string {
    const p = position.toLowerCase();
    if (/goalkeeper|keeper/.test(p)) return t('player.roleGoalkeeper');
    if (/centre back|center back|defender|full.?back/.test(p)) return t('player.roleDefender');
    if (/midfield|midfielder/.test(p)) return t('player.roleMidfielder');
    if (/striker|forward|wing/.test(p)) return t('player.roleForward');
    return position || t('player.rolePlayer');
}

function resultLabel(result: RecentMatch['result'], t: TranslateFn): string {
    if (result === 'W') return t('teamPage.outcomeWin');
    if (result === 'D') return t('teamPage.outcomeDraw');
    return t('teamPage.outcomeLoss');
}

function resultCardClass(result: RecentMatch['result']): string {
    if (result === 'W') return classes.matchCardWin;
    if (result === 'D') return classes.matchCardDraw;
    return classes.matchCardLoss;
}

function matchContribution(m: RecentMatch): string {
    const parts: string[] = [];
    if (m.goals > 0) parts.push(`${m.goals}G`);
    if (m.assists > 0) parts.push(`${m.assists}A`);
    return parts.length > 0 ? parts.join(' ') : `${m.rating.toFixed(1)}`;
}

function scorePillClass(result: RecentMatch['result']): string {
    if (result === 'W') return classes.scoreWin;
    if (result === 'D') return classes.scoreDraw;
    return classes.scoreLoss;
}

function HighlightRow({ stats, t }: { stats: HighlightStat[]; t: TranslateFn }) {
    if (stats.length === 0) return null;
    return (
        <div className={classes.highlightRow}>
            {stats.map((s) => (
                <div key={s.labelKey} className={classes.highlightCell}>
                    <span className={classes.highlightValue}>{s.value}</span>
                    <span className={classes.highlightLabel}>{t(s.labelKey)}</span>
                    <span className={classes.highlightContext}>
                        {t(s.contextKey, s.contextParams)}
                    </span>
                </div>
            ))}
        </div>
    );
}

function MatchList({
    matches,
    t,
    onMatchClick,
}: {
    matches: RecentMatch[];
    t: TranslateFn;
    onMatchClick?: (fixtureId: number) => void;
}) {
    if (matches.length === 0) {
        return <p className={classes.emptyNote}>{t('player.noRecentMatches')}</p>;
    }

    return (
        <div className={classes.matchGrid}>
            {matches.map((m) => {
                const hasContribution = m.goals > 0 || m.assists > 0;
                return (
                    <article
                        key={`${m.fixtureId ?? m.date}-${m.opponent}`}
                        className={`${classes.matchCard} ${resultCardClass(m.result)}`}
                        role={m.fixtureId != null ? 'button' : undefined}
                        tabIndex={m.fixtureId != null ? 0 : undefined}
                        onClick={() => m.fixtureId != null && onMatchClick?.(m.fixtureId)}
                        onKeyDown={(e) => {
                            if (m.fixtureId != null && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                onMatchClick?.(m.fixtureId);
                            }
                        }}
                    >
                        <div className={classes.matchCardTop}>
                            <span className={classes.matchCardDate}>{m.gameweek ?? m.date}</span>
                            <span
                                className={`${classes.matchVenueBadge} ${m.home ? classes.matchVenueHome : classes.matchVenueAway}`}
                            >
                                {m.home ? t('teamPage.home') : t('teamPage.away')}
                            </span>
                        </div>

                        <div className={classes.matchCardOppRow}>
                            <div className={classes.matchOppAvatar}>{initials(m.opponent)}</div>
                            <div className={classes.matchOppText}>
                                <span className={classes.matchCardOppName}>{m.opponent}</span>
                                <span className={classes.matchCardOppMeta}>
                                    {m.opponentCode ?? m.opponent.slice(0, 3).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className={classes.matchCardScoreRow}>
                            <span className={classes.matchCardScore}>{m.score}</span>
                            <span className={`${classes.resultBadge} ${scorePillClass(m.result)}`}>
                                {resultLabel(m.result, t)}
                            </span>
                        </div>

                        <div className={classes.matchCardFooter}>
                            <div className={classes.matchCardChips}>
                                {m.goals > 0 && (
                                    <span className={classes.statChipAccent}>
                                        {m.goals} {t('player.goals').toLowerCase()}
                                    </span>
                                )}
                                {m.assists > 0 && (
                                    <span className={classes.statChipAccent}>
                                        {m.assists} {t('player.assists').toLowerCase()}
                                    </span>
                                )}
                                {m.minutes > 0 && (
                                    <span className={classes.statChipMuted}>{m.minutes}&apos;</span>
                                )}
                            </div>
                            <span
                                className={`${classes.matchRating} ${hasContribution ? classes.matchRatingHot : ''}`}
                                title={t('player.rating')}
                            >
                                {hasContribution ? matchContribution(m) : m.rating.toFixed(1)}
                            </span>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

function FixtureList({
    fixtures,
    t,
    onMatchClick,
}: {
    fixtures: UpcomingFixture[];
    t: TranslateFn;
    onMatchClick?: (fixtureId: number) => void;
}) {
    if (fixtures.length === 0) {
        return <p className={classes.emptyNote}>{t('player.noUpcomingFixtures')}</p>;
    }

    return (
        <div className={classes.matchGrid}>
            {fixtures.map((f) => (
                <article
                    key={`${f.fixtureId ?? f.date}-${f.opponent}`}
                    className={`${classes.matchCard} ${classes.matchCardUpcoming}`}
                    role={f.fixtureId != null ? 'button' : undefined}
                    tabIndex={f.fixtureId != null ? 0 : undefined}
                    onClick={() => f.fixtureId != null && onMatchClick?.(f.fixtureId)}
                    onKeyDown={(e) => {
                        if (f.fixtureId != null && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            onMatchClick?.(f.fixtureId);
                        }
                    }}
                >
                    <div className={classes.matchCardTop}>
                        <span className={classes.matchCardDate}>{f.date}</span>
                        <span className={classes.upcomingBadge}>{t('player.fixtures')}</span>
                    </div>
                    <div className={classes.matchCardOppRow}>
                        <div className={classes.matchOppAvatar}>{initials(f.opponent)}</div>
                        <div className={classes.matchOppText}>
                            <span className={classes.matchCardOppName}>{f.opponent}</span>
                            <span className={classes.matchCardOppMeta}>
                                {f.opponentCode ?? f.opponent.slice(0, 3).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div className={classes.matchCardScoreRow}>
                        <span
                            className={`${classes.matchVenueBadge} ${f.home ? classes.matchVenueHome : classes.matchVenueAway}`}
                        >
                            {f.home ? t('teamPage.home') : t('teamPage.away')}
                        </span>
                    </div>
                </article>
            ))}
        </div>
    );
}

function SeasonStatGroups({
    categories,
    minutes,
    t,
}: {
    categories: StatCategory[];
    minutes: number;
    t: TranslateFn;
}) {
    const [mode, setMode] = useState<'total' | 'per90'>('total');

    const hasData = categories.some((c) => c.rows.some((r) => r.total !== 0 && r.total !== '0'));
    if (!hasData) {
        return <p className={classes.emptyNote}>{t('player.noSeasonStats')}</p>;
    }

    return (
        <>
            <div className={classes.segmented}>
                <button
                    type="button"
                    className={`${classes.segmentBtn} ${mode === 'total' ? classes.segmentBtnActive : ''}`}
                    onClick={() => setMode('total')}
                >
                    {t('player.total')}
                </button>
                <button
                    type="button"
                    className={`${classes.segmentBtn} ${mode === 'per90' ? classes.segmentBtnActive : ''}`}
                    onClick={() => setMode('per90')}
                >
                    {t('player.per90')}
                </button>
            </div>
            {categories.map((cat) => (
                <div key={cat.title} className={classes.statGroup}>
                    <h3 className={classes.statGroupTitle}>{cat.title}</h3>
                    {cat.rows.map((row) => {
                        const display =
                            mode === 'per90' && row.per90 !== undefined ? row.per90 : row.total;
                        if (display === 0 && mode === 'per90' && minutes === 0) return null;
                        return (
                            <div key={row.label} className={classes.statLine}>
                                <span className={classes.statName}>{row.label}</span>
                                <span className={classes.statVal}>{display}</span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </>
    );
}

function CareerList({
    rows,
    onClubClick,
    t,
}: {
    rows: CareerRow[];
    onClubClick: (teamId: number) => void;
    t: TranslateFn;
}) {
    if (rows.length === 0) {
        return <p className={classes.emptyNote}>{t('player.noCareerHistory')}</p>;
    }

    return (
        <>
            {rows.map((row) => (
                <div key={`${row.club}-${row.from}`} className={classes.careerRow}>
                    <button
                        type="button"
                        className={classes.careerClubBtn}
                        disabled={!row.teamId}
                        onClick={() => row.teamId && onClubClick(row.teamId)}
                    >
                        {row.crest && <img src={row.crest} alt="" className={classes.careerCrest} />}
                        <span>{row.club}</span>
                    </button>
                    <span className={classes.careerDates}>
                        {row.from} – {row.to}
                    </span>
                    <span className={classes.careerNums}>
                        <span title={t('player.appearances')}>{row.apps}</span>
                        <span title={t('player.goals')}>{row.goals}</span>
                    </span>
                </div>
            ))}
        </>
    );
}

export function PlayerPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const { playerAdvancedStatsEnabled } = usePlatformFeaturesStore();
    const [mainTab, setMainTab] = useState<MainTab>('matches');
    const [matchSegment, setMatchSegment] = useState<MatchSegment>('results');

    const mockPlayer = useMemo(() => MOCK_PLAYERS.find((p) => p.id === id) ?? null, [id]);
    const numericId = id ? Number.parseInt(id, 10) : NaN;
    const fetchFromApi = !mockPlayer && Number.isFinite(numericId) && numericId > 0;

    const { data: apiPlayer, isLoading: apiLoading } = useGetOnePlayer(numericId, {
        query: { enabled: fetchFromApi } as any,
    });

    const firstTeamId = useMemo(() => {
        const raw = apiPlayer?.currentTeamId;
        if (raw == null) return undefined;
        const n = Number.parseInt(String(raw), 10);
        return Number.isFinite(n) ? n : undefined;
    }, [apiPlayer?.currentTeamId]);

    const { data: apiTeam } = useGetOneTeam(firstTeamId ?? 0, {
        query: { enabled: fetchFromApi && firstTeamId != null } as any,
    });

    const { data: matchesData } = usePlayerMatches(numericId, fetchFromApi);

    const { data: advancedStatsData } = useQuery({
        queryKey: ['playerAdvancedStats', numericId],
        queryFn: () => fetchPlayerAdvancedStats(numericId),
        enabled: fetchFromApi && playerAdvancedStatsEnabled && Number.isFinite(numericId) && numericId > 0,
        staleTime: 60_000,
    });

    const player = useMemo((): PlayerViewModel | null => {
        if (mockPlayer) return mockPlayer;
        if (!apiPlayer) return null;
        const clubTeam =
            apiTeam && firstTeamId
                ? { id: firstTeamId, name: apiTeam.name, crest: apiTeam.logoUrl }
                : undefined;
        const base = buildApiPlayerViewModel(apiPlayer, clubTeam);
        if (!matchesData) return base;
        return mergePlayerMatchesIntoViewModel(
            base,
            matchesData.season,
            matchesData.results,
            matchesData.fixtures,
        );
    }, [mockPlayer, apiPlayer, apiTeam, firstTeamId, matchesData]);

    const openFixture = (fixtureId: number) => {
        navigateWithTransition(`/match/${fixtureId}`, { transitionType: 'loading', duration: 900 });
    };

    if (fetchFromApi && apiLoading) {
        return (
            <Box className={classes.page} pos="relative" mih={360}>
                <LoadingOverlay visible zIndex={10} overlayProps={{ blur: 1 }} />
            </Box>
        );
    }

    if (!player) {
        return (
            <Box className={classes.page}>
                <Center py="xl">
                    <Stack align="center" gap="md">
                        <IconUser size={48} color="var(--ui-text-muted)" />
                        <UiH2>{t('player.notFound')}</UiH2>
                        <Text c="dimmed">{t('player.notFoundDetail', { id: id ?? '' })}</Text>
                    </Stack>
                </Center>
            </Box>
        );
    }

    const dobLabel = player.dateOfBirth
        ? `${player.age} (${formatDob(player.dateOfBirth)})`
        : String(player.age);

    const profileFacts = [
        {
            value: player.heightCm != null ? `${player.heightCm} cm` : '—',
            label: t('player.height'),
        },
        {
            value: player.shirtNumber != null ? String(player.shirtNumber) : '—',
            label: t('player.shirt'),
        },
        { value: dobLabel, label: t('player.age') },
        { value: player.preferredFoot ?? '—', label: t('player.foot') },
        { value: player.nationality, label: t('player.country') },
        { value: player.marketValue ?? '—', label: t('player.value') },
        { value: player.primaryPosition, label: t('player.position') },
        {
            value: player.season.matches > 0 ? String(player.season.matches) : '—',
            label: t('player.apps'),
        },
    ];

    const seasonTitle =
        player.season.competition === 'Current season'
            ? t('player.currentSeason')
            : player.season.competition;

    const mainTabs: { id: MainTab; label: string }[] = [
        { id: 'matches', label: t('player.tabMatches') },
        { id: 'stats', label: t('player.tabStats') },
        { id: 'history', label: t('player.tabHistory') },
    ];

    return (
        <Box className={classes.page}>
            <header className={classes.hero}>
                <div className={classes.heroBody}>
                    {player.photoUrl ? (
                        <img src={player.photoUrl} alt="" className={classes.heroPhoto} />
                    ) : (
                        <div className={`${classes.heroPhoto} ${classes.heroPhotoFallback}`}>
                            {initials(player.name)}
                        </div>
                    )}
                    <div className={classes.heroMeta}>
                        <span className={classes.roleLabel}>{roleLabel(player.primaryPosition, t)}</span>
                        <h1 className={classes.playerName}>{player.name}</h1>
                        {player.clubTeam && (
                            <button
                                type="button"
                                className={classes.teamLink}
                                onClick={() => navigateWithTransition(`/team/${player.clubTeam!.id}`)}
                            >
                                {player.clubTeam.crest && (
                                    <img src={player.clubTeam.crest} alt="" className={classes.teamCrest} />
                                )}
                                {player.clubTeam.name}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className={classes.shell}>
                <HighlightRow stats={player.highlights} t={t} />

                <div className={classes.sectionCard}>
                    <div className={classes.mainTabs}>
                        {mainTabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                className={`${classes.mainTab} ${mainTab === tab.id ? classes.mainTabActive : ''}`}
                                onClick={() => setMainTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {mainTab === 'matches' && (
                        <>
                            <div className={classes.segmented}>
                                <button
                                    type="button"
                                    className={`${classes.segmentBtn} ${matchSegment === 'results' ? classes.segmentBtnActive : ''}`}
                                    onClick={() => setMatchSegment('results')}
                                >
                                    {t('player.results')}
                                </button>
                                <button
                                    type="button"
                                    className={`${classes.segmentBtn} ${matchSegment === 'fixtures' ? classes.segmentBtnActive : ''}`}
                                    onClick={() => setMatchSegment('fixtures')}
                                >
                                    {t('player.fixtures')}
                                </button>
                            </div>
                            {matchSegment === 'results' ? (
                                <MatchList
                                    matches={player.recentMatches}
                                    t={t}
                                    onMatchClick={openFixture}
                                />
                            ) : (
                                <FixtureList
                                    fixtures={player.upcomingFixtures}
                                    t={t}
                                    onMatchClick={openFixture}
                                />
                            )}
                        </>
                    )}

                    {mainTab === 'stats' && (
                        <>
                            <div className={classes.profileGrid}>
                                {profileFacts.map((f) => (
                                    <div key={f.label} className={classes.profileItem}>
                                        <span className={classes.profileValue}>{f.value}</span>
                                        <span className={classes.profileLabel}>{f.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={classes.statGroup}>
                                <h3 className={classes.statGroupTitle}>{seasonTitle}</h3>
                                <div className={classes.statLine}>
                                    <span className={classes.statName}>{t('player.goals')}</span>
                                    <span className={classes.statVal}>{player.season.goals}</span>
                                </div>
                                <div className={classes.statLine}>
                                    <span className={classes.statName}>{t('player.assists')}</span>
                                    <span className={classes.statVal}>{player.season.assists}</span>
                                </div>
                                <div className={classes.statLine}>
                                    <span className={classes.statName}>{t('player.matches')}</span>
                                    <span className={classes.statVal}>{player.season.matches}</span>
                                </div>
                                <div className={classes.statLine}>
                                    <span className={classes.statName}>{t('player.minutes')}</span>
                                    <span className={classes.statVal}>
                                        {player.season.minutes.toLocaleString()}
                                    </span>
                                </div>
                                <div className={classes.statLine}>
                                    <span className={classes.statName}>{t('player.avgRating')}</span>
                                    <span className={classes.statVal}>
                                        {player.season.rating > 0 ? player.season.rating.toFixed(2) : '—'}
                                    </span>
                                </div>
                            </div>

                            {playerAdvancedStatsEnabled ? (
                                <SeasonStatGroups
                                    categories={
                                        advancedStatsData?.hasRollupData
                                            ? advancedStatsData.categories
                                            : player.performance
                                    }
                                    minutes={
                                        advancedStatsData?.hasRollupData
                                            ? advancedStatsData.minutes
                                            : player.season.minutes
                                    }
                                    t={t}
                                />
                            ) : (
                                <p className={classes.emptyNote}>{t('player.advancedStatsDisabled')}</p>
                            )}
                        </>
                    )}

                    {mainTab === 'history' && (
                        <CareerList
                            rows={player.career}
                            onClubClick={(teamId) => navigateWithTransition(`/team/${teamId}`)}
                            t={t}
                        />
                    )}
                </div>
            </div>
        </Box>
    );
}
