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
    type CareerRow,
    type HighlightStat,
    type PlayerViewModel,
    type RecentMatch,
    type StatCategory,
} from './playerPage.model';
import classes from './player.page.module.css';

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

function FormStrip({ matches, t }: { matches: RecentMatch[]; t: TranslateFn }) {
    const form = matches.slice(0, 3);
    if (form.length === 0) return null;

    return (
        <div className={classes.sectionCard}>
            <h2 className={classes.sectionHeading}>{t('player.form')}</h2>
            <div className={classes.formScroll}>
                {form.map((m) => {
                    const pts = m.goals * 4 + m.assists * 3 + (m.rating >= 7.5 ? 2 : 0);
                    return (
                        <div key={`${m.gameweek}-${m.opponent}`} className={classes.formCard}>
                            <div className={classes.formGw}>{m.gameweek ?? m.date}</div>
                            <div className={classes.formOpp}>
                                {m.opponentCode ?? m.opponent.slice(0, 3).toUpperCase()}
                            </div>
                            <div className={classes.formVenue}>
                                {m.home ? t('player.homeShort') : t('player.awayShort')}
                            </div>
                            <div className={classes.formPts}>{t('player.pts', { count: pts })}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MatchList({ matches, t }: { matches: RecentMatch[]; t: TranslateFn }) {
    if (matches.length === 0) {
        return <p className={classes.emptyNote}>{t('player.noRecentMatches')}</p>;
    }

    return (
        <>
            {matches.map((m) => (
                <div key={`${m.date}-${m.opponent}`} className={classes.matchRow}>
                    <span className={classes.matchGw}>{m.gameweek ?? m.date}</span>
                    <div className={classes.matchOppBlock}>
                        <div className={classes.matchOppName}>
                            {m.opponentCode ?? m.opponent}
                            <span> {m.home ? t('player.homeShort') : t('player.awayShort')}</span>
                        </div>
                        <div className={classes.matchOppMeta}>{m.opponent}</div>
                    </div>
                    <span className={`${classes.scorePill} ${scorePillClass(m.result)}`}>{m.score}</span>
                    <span className={classes.contribBadge}>{matchContribution(m)}</span>
                </div>
            ))}
        </>
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
    const [mainTab, setMainTab] = useState<MainTab>('matches');
    const [matchSegment, setMatchSegment] = useState<MatchSegment>('results');

    const mockPlayer = useMemo(() => MOCK_PLAYERS.find((p) => p.id === id) ?? null, [id]);
    const numericId = id ? Number.parseInt(id, 10) : NaN;
    const fetchFromApi = !mockPlayer && Number.isFinite(numericId) && numericId > 0;

    const { data: apiPlayer, isLoading: apiLoading } = useGetOnePlayer(numericId, {
        query: { enabled: fetchFromApi },
    });

    const firstTeamId = useMemo(() => {
        const raw = apiPlayer?.teamIds?.[0];
        if (raw == null) return undefined;
        const n = Number.parseInt(String(raw), 10);
        return Number.isFinite(n) ? n : undefined;
    }, [apiPlayer?.teamIds]);

    const { data: apiTeam } = useGetOneTeam(firstTeamId ?? 0, {
        query: { enabled: fetchFromApi && firstTeamId != null },
    });

    const player = useMemo((): PlayerViewModel | null => {
        if (mockPlayer) return mockPlayer;
        if (!apiPlayer) return null;
        const clubTeam =
            apiTeam && firstTeamId
                ? { id: firstTeamId, name: apiTeam.name, crest: apiTeam.logoUrl }
                : undefined;
        return buildApiPlayerViewModel(apiPlayer, clubTeam);
    }, [mockPlayer, apiPlayer, apiTeam, firstTeamId]);

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
                <FormStrip matches={player.recentMatches} t={t} />

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
                                <MatchList matches={player.recentMatches} t={t} />
                            ) : (
                                <p className={classes.emptyNote}>{t('player.noUpcomingFixtures')}</p>
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

                            <SeasonStatGroups
                                categories={player.performance}
                                minutes={player.season.minutes}
                                t={t}
                            />
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
