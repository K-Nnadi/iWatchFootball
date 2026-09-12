import { Box, Center, LoadingOverlay, Stack, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useTranslation } from '../../i18n';
import { UiH2 } from '../../components/ui';
import {
    isPenaltyDecided,
    parseFixtureResultFromMetadata,
    resolveFixtureOutcome,
} from '../../shared/fixtureResult';
import { scoresFromFixtureRow } from '../../shared/fixtureScores';
import { useManagerProfile } from '../../shared/api/managerProfile.api';
import matchClasses from '../player/player.page.module.css';
import classes from './manager.page.module.css';

type MainTab = 'career' | 'matches';

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function asFiniteNumberId(v: unknown): number | undefined {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
}

function displayNationalityLabel(raw: unknown): string {
    if (raw == null) return '—';
    if (typeof raw === 'object' && raw !== null && 'name' in raw && typeof (raw as { name: unknown }).name === 'string') {
        return String((raw as { name: string }).name).trim() || '—';
    }
    const s = String(raw).trim();
    if (!s) return '—';
    if (s.startsWith('{') || s.startsWith('[')) {
        try {
            const parsed: unknown = JSON.parse(s);
            if (parsed && typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
                const n = (parsed as { name: unknown }).name;
                if (typeof n === 'string' && n.trim()) return n.trim();
            }
        } catch {
            /* keep raw */
        }
    }
    return s;
}

function formatEmploymentDate(raw?: string): string {
    if (!raw) return '—';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function scorePillClass(result: 'W' | 'D' | 'L'): string {
    if (result === 'W') return matchClasses.scoreWin;
    if (result === 'D') return matchClasses.scoreDraw;
    return matchClasses.scoreLoss;
}

export function ManagerPage() {
    const { id } = useParams<{ id?: string }>();
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const [mainTab, setMainTab] = useState<MainTab>('career');

    const managerId = id ? Number.parseInt(id, 10) : NaN;
    const fetchFromApi = Number.isFinite(managerId) && managerId > 0;

    const { data: profile, isLoading, isError } = useManagerProfile(managerId, fetchFromApi);
    const manager = profile?.manager;
    const career = profile?.career ?? [];
    const currentTeamId = profile?.currentTeamId;
    const profileMatches = profile?.recentMatches ?? [];

    const { data: homeFixtures = [] } = useGetQueryFixture(
        {
            where: { homeTeamId: currentTeamId ?? -1 },
            take: 20,
            order: { date: 'DESC' as const },
        } as any,
        { query: { enabled: fetchFromApi && currentTeamId != null && profileMatches.length === 0 } as any },
    );

    const { data: awayFixtures = [] } = useGetQueryFixture(
        {
            where: { awayTeamId: currentTeamId ?? -1 },
            take: 20,
            order: { date: 'DESC' as const },
        } as any,
        { query: { enabled: fetchFromApi && currentTeamId != null && profileMatches.length === 0 } as any },
    );

    const teamIds = useMemo(() => {
        const ids = new Set<number>();
        for (const row of career) ids.add(row.teamId);
        if (currentTeamId != null) ids.add(currentTeamId);
        for (const row of profileMatches) {
            ids.add(row.homeTeamId);
            ids.add(row.awayTeamId);
        }
        for (const raw of [...homeFixtures, ...awayFixtures]) {
            const h = asFiniteNumberId((raw as { homeTeamId?: unknown }).homeTeamId);
            const a = asFiniteNumberId((raw as { awayTeamId?: unknown }).awayTeamId);
            if (h != null) ids.add(h);
            if (a != null) ids.add(a);
        }
        return Array.from(ids);
    }, [career, currentTeamId, profileMatches, homeFixtures, awayFixtures]);

    const { data: teams = [] } = useGetQueryTeam(
        {
            where: { id: { $in: teamIds.length ? teamIds : [-1] } },
            take: Math.max(teamIds.length, 1),
        } as any,
        { query: { enabled: fetchFromApi && teamIds.length > 0 } as any },
    );

    const teamById = useMemo(() => {
        const m = new Map<number, (typeof teams)[number]>();
        for (const team of teams) {
            const id = asFiniteNumberId(team.id);
            if (id != null) m.set(id, team);
        }
        return m;
    }, [teams]);

    const teamNameById = useMemo(() => {
        const m = new Map<number, string>();
        for (const row of career) {
            if (row.teamName) m.set(row.teamId, row.teamName);
        }
        for (const row of profileMatches) {
            m.set(row.homeTeamId, row.homeTeamName);
            m.set(row.awayTeamId, row.awayTeamName);
        }
        for (const [id, team] of teamById) {
            if (team.name) m.set(id, team.name);
        }
        return m;
    }, [career, profileMatches, teamById]);

    const currentCareerRow =
        currentTeamId != null ? career.find((c) => c.teamId === currentTeamId) : undefined;
    const currentTeamFromQuery = currentTeamId != null ? teamById.get(currentTeamId) : undefined;
    const currentTeamName = currentTeamFromQuery?.name ?? currentCareerRow?.teamName;
    const currentTeamLogo = currentTeamFromQuery?.logoUrl ?? currentCareerRow?.crest ?? undefined;

    const recentFixtures = useMemo(() => {
        type Fx = {
            id: number;
            date: string;
            homeTeamId?: number;
            awayTeamId?: number;
            homeTeamName?: string;
            awayTeamName?: string;
            homeScore?: unknown;
            awayScore?: unknown;
            metadata?: unknown;
        };
        if (profileMatches.length > 0) {
            return profileMatches.map((row) => ({
                id: row.id,
                date: row.date,
                homeTeamId: row.homeTeamId,
                awayTeamId: row.awayTeamId,
                homeTeamName: row.homeTeamName,
                awayTeamName: row.awayTeamName,
                homeScore: row.homeScore,
                awayScore: row.awayScore,
                metadata: row.metadata,
            }));
        }
        if (currentTeamId == null) return [];
        const merged = new Map<number, Fx>();
        for (const raw of [...homeFixtures, ...awayFixtures] as Fx[]) {
            const nid = asFiniteNumberId(raw.id);
            if (nid == null) continue;
            merged.set(nid, { ...raw, id: nid });
        }
        const now = Date.now();
        return Array.from(merged.values())
            .filter((f) => {
                const tms = new Date(f.date).getTime();
                const scores = scoresFromFixtureRow(f);
                return tms <= now && scores.homeScore != null && scores.awayScore != null;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 12);
    }, [profileMatches, homeFixtures, awayFixtures, currentTeamId]);

    const careerRows = useMemo(() => {
        return career.map((row) => {
            const team = teamById.get(row.teamId);
            const from = formatEmploymentDate(row.from);
            const to = row.isCurrent
                ? t('managerPage.present')
                : formatEmploymentDate(row.to);
            return {
                id: row.teamId,
                teamId: row.teamId,
                club: team?.name ?? row.teamName,
                crest: team?.logoUrl ?? row.crest ?? undefined,
                from,
                to,
                isCurrent: row.isCurrent,
            };
        });
    }, [career, teamById, t]);

    const clubsManagedCount = profile?.clubsManagedCount ?? career.length;

    const highlights = useMemo(
        () => [
            {
                value: clubsManagedCount > 0 ? String(clubsManagedCount) : '—',
                label: t('managerPage.clubsManaged'),
            },
            {
                value: displayNationalityLabel(manager?.nationality),
                label: t('managerPage.nationality'),
            },
            {
                value: currentTeamName ?? '—',
                label: t('managerPage.currentClub'),
            },
        ],
        [clubsManagedCount, manager?.nationality, currentTeamName, t],
    );

    if (fetchFromApi && isLoading) {
        return (
            <Box className={classes.page} pos="relative" mih={360}>
                <LoadingOverlay visible zIndex={10} overlayProps={{ blur: 1 }} />
            </Box>
        );
    }

    if (isError || !manager) {
        return (
            <Box className={classes.page}>
                <Center py="xl">
                    <Stack align="center" gap="md">
                        <IconUser size={48} color="var(--ui-text-muted)" />
                        <UiH2>{t('managerPage.notFound')}</UiH2>
                        <Text c="dimmed">{t('managerPage.notFoundDetail', { id: id ?? '' })}</Text>
                    </Stack>
                </Center>
            </Box>
        );
    }

    const mainTabs: { id: MainTab; label: string }[] = [
        { id: 'career', label: t('managerPage.tabCareer') },
        { id: 'matches', label: t('managerPage.tabMatches') },
    ];

    return (
        <Box className={classes.page}>
            <header className={classes.hero}>
                <div className={classes.heroBody}>
                    <div className={classes.heroPhotoFallback}>{initials(manager.name)}</div>
                    <div className={classes.heroMeta}>
                        <span className={classes.roleLabel}>{t('managerPage.role')}</span>
                        <h1 className={classes.managerName}>{manager.name}</h1>
                        {manager.nickname && manager.nickname !== manager.name && (
                            <span className={classes.nickname}>{manager.nickname}</span>
                        )}
                        {currentTeamId != null && currentTeamName && (
                            <button
                                type="button"
                                className={classes.teamLink}
                                onClick={() => navigateWithTransition(`/team/${currentTeamId}`)}
                            >
                                {currentTeamLogo && (
                                    <img src={currentTeamLogo} alt="" className={classes.teamCrest} />
                                )}
                                {currentTeamName}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className={classes.shell}>
                <div className={classes.highlightRow}>
                    {highlights.map((h) => (
                        <div key={h.label} className={classes.highlightCell}>
                            <span className={classes.highlightValue}>{h.value}</span>
                            <span className={classes.highlightLabel}>{h.label}</span>
                        </div>
                    ))}
                </div>

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

                    {mainTab === 'career' && (
                        <>
                            {careerRows.length === 0 ? (
                                <p className={classes.emptyNote}>{t('managerPage.noCareer')}</p>
                            ) : (
                                careerRows.map((row) => (
                                    <div key={row.id} className={classes.careerRow}>
                                        <button
                                            type="button"
                                            className={classes.careerClubBtn}
                                            disabled={row.teamId == null}
                                            onClick={() =>
                                                row.teamId != null &&
                                                navigateWithTransition(`/team/${row.teamId}`)
                                            }
                                        >
                                            {row.crest && (
                                                <img src={row.crest} alt="" className={classes.careerCrest} />
                                            )}
                                            <span className={classes.careerClubName}>{row.club}</span>
                                        </button>
                                        <span className={classes.careerDates}>
                                            {row.from === '—' && row.to === t('managerPage.present')
                                                ? t('managerPage.knownClub')
                                                : `${row.from} – ${row.to}`}
                                        </span>
                                        {row.isCurrent && (
                                            <span className={classes.currentBadge}>{t('managerPage.current')}</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {mainTab === 'matches' && (
                        <>
                            {!currentTeamId ? (
                                <p className={classes.emptyNote}>{t('managerPage.noCurrentClub')}</p>
                            ) : recentFixtures.length === 0 ? (
                                <p className={classes.emptyNote}>{t('managerPage.noMatches')}</p>
                            ) : (
                                <div className={matchClasses.matchGrid}>
                                    {recentFixtures.map((f) => {
                                        const homeTeamId = asFiniteNumberId(f.homeTeamId);
                                        const awayTeamId = asFiniteNumberId(f.awayTeamId);
                                        const isHome = homeTeamId === currentTeamId;
                                        const homeName =
                                            f.homeTeamName ??
                                            (homeTeamId != null ? teamNameById.get(homeTeamId) : undefined) ??
                                            (homeTeamId != null ? `Team #${homeTeamId}` : 'Home');
                                        const awayName =
                                            f.awayTeamName ??
                                            (awayTeamId != null ? teamNameById.get(awayTeamId) : undefined) ??
                                            (awayTeamId != null ? `Team #${awayTeamId}` : 'Away');
                                        const scores = scoresFromFixtureRow(f);
                                        const resultMeta = parseFixtureResultFromMetadata(
                                            f.metadata,
                                            homeTeamId,
                                            awayTeamId,
                                        );
                                        const outcome = resolveFixtureOutcome(
                                            {
                                                homeScore: scores.homeScore,
                                                awayScore: scores.awayScore,
                                                homeTeamId,
                                                awayTeamId,
                                                metadata: f.metadata as Record<string, unknown> | undefined,
                                            },
                                            currentTeamId,
                                        );
                                        const result: 'W' | 'D' | 'L' =
                                            outcome === 'win' ? 'W' : outcome === 'draw' ? 'D' : 'L';
                                        const score =
                                            scores.homeScore != null && scores.awayScore != null
                                                ? `${scores.homeScore}-${scores.awayScore}`
                                                : '—';
                                        const dateLabel = new Date(f.date).toLocaleDateString(undefined, {
                                            day: 'numeric',
                                            month: 'short',
                                        });
                                        const decidedOnPens = isPenaltyDecided(resultMeta);

                                        return (
                                            <article
                                                key={f.id}
                                                className={`${matchClasses.matchCard} ${
                                                    result === 'W'
                                                        ? matchClasses.matchCardWin
                                                        : result === 'D'
                                                          ? matchClasses.matchCardDraw
                                                          : matchClasses.matchCardLoss
                                                }`}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    navigateWithTransition(`/match/${f.id}`, {
                                                        transitionType: 'loading',
                                                        duration: 900,
                                                    })
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        navigateWithTransition(`/match/${f.id}`, {
                                                            transitionType: 'loading',
                                                            duration: 900,
                                                        });
                                                    }
                                                }}
                                            >
                                                <div className={matchClasses.matchCardTop}>
                                                    <span className={matchClasses.matchCardDate}>{dateLabel}</span>
                                                    <span
                                                        className={`${matchClasses.matchVenueBadge} ${isHome ? matchClasses.matchVenueHome : matchClasses.matchVenueAway}`}
                                                    >
                                                        {isHome ? t('teamPage.home') : t('teamPage.away')}
                                                    </span>
                                                </div>
                                                <div className={matchClasses.matchCardScoreRow}>
                                                    <span className={matchClasses.matchCardOppName}>
                                                        {homeName} vs {awayName}
                                                    </span>
                                                </div>
                                                <div className={matchClasses.matchCardScoreRow}>
                                                    <span className={matchClasses.matchCardScore}>{score}</span>
                                                    <span
                                                        className={`${matchClasses.resultBadge} ${scorePillClass(result)}`}
                                                    >
                                                        {result === 'W'
                                                            ? decidedOnPens
                                                                ? t('teamPage.outcomeWinPens')
                                                                : t('teamPage.outcomeWin')
                                                            : result === 'D'
                                                              ? t('teamPage.outcomeDraw')
                                                              : decidedOnPens
                                                                ? t('teamPage.outcomeLossPens')
                                                                : t('teamPage.outcomeLoss')}
                                                    </span>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Box>
    );
}
