import { Box, Center, LoadingOverlay, Stack, Text } from '@mantine/core';
import { IconExternalLink, IconMapPin } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useTranslation } from '../../i18n';
import { UiH2 } from '../../components/ui';
import { useStadiumProfile } from '../../shared/api/stadiumProfile.api';
import { scoresFromFixtureRow } from '../../shared/fixtureScores';
import matchClasses from '../player/player.page.module.css';
import classes from './stadium.page.module.css';

type MainTab = 'lore' | 'clubs' | 'matches';

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatCapacity(n?: number): string {
    if (n == null || !Number.isFinite(n) || n <= 0) return '—';
    return n.toLocaleString();
}

function formatOpenedYear(raw?: string): string {
    if (!raw) return '—';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '—';
    return String(d.getFullYear());
}

function displayCountryLabel(raw: unknown): string {
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

function heroImageFromProfile(
    loreThumb?: string,
    metadata?: unknown,
): string | undefined {
    if (loreThumb) return loreThumb;
    if (metadata && typeof metadata === 'object' && metadata !== null) {
        const apisports = (metadata as { apisports?: { image?: string } }).apisports;
        if (apisports?.image) return apisports.image;
    }
    return undefined;
}

export function StadiumPage() {
    const { id } = useParams<{ id?: string }>();
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const [mainTab, setMainTab] = useState<MainTab>('lore');

    const stadiumId = id ? Number.parseInt(id, 10) : NaN;
    const fetchFromApi = Number.isFinite(stadiumId) && stadiumId > 0;

    const { data: profile, isLoading, isError } = useStadiumProfile(stadiumId, fetchFromApi);
    const stadium = profile?.stadium;
    const homeClubs = profile?.homeClubs ?? [];
    const recentFixtures = profile?.recentFixtures ?? [];
    const lore = profile?.lore;

    const fixtureTeamIds = useMemo(() => {
        const ids = new Set<number>();
        for (const f of recentFixtures) {
            ids.add(f.homeTeamId);
            ids.add(f.awayTeamId);
        }
        return Array.from(ids);
    }, [recentFixtures]);

    const { data: teams = [] } = useGetQueryTeam(
        { where: { id: { $in: fixtureTeamIds.length ? fixtureTeamIds : [-1] } }, take: 100 } as any,
        { query: { enabled: fetchFromApi && fixtureTeamIds.length > 0 } as any },
    );

    const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

    const primaryClub = homeClubs.find((c) => c.relationship === 'primary_home') ?? homeClubs[0];
    const heroImage = heroImageFromProfile(lore?.thumbnailUrl, stadium?.metadata);

    const countryLabel = displayCountryLabel(stadium?.country);

    const highlights = useMemo(
        () => [
            { value: formatCapacity(stadium?.capacity), label: t('stadiumPage.capacity') },
            { value: formatOpenedYear(stadium?.opened), label: t('stadiumPage.opened') },
            { value: countryLabel, label: t('stadiumPage.country') },
            { value: primaryClub?.name ?? '—', label: t('stadiumPage.homeOf') },
        ],
        [stadium?.capacity, stadium?.opened, countryLabel, primaryClub?.name, t],
    );

    if (fetchFromApi && isLoading) {
        return (
            <Box className={classes.page} pos="relative" mih={360}>
                <LoadingOverlay visible zIndex={10} overlayProps={{ blur: 1 }} />
            </Box>
        );
    }

    if (isError || !stadium) {
        return (
            <Box className={classes.page}>
                <Center py="xl">
                    <Stack align="center" gap="md">
                        <IconMapPin size={48} color="var(--ui-text-muted)" />
                        <UiH2>{t('stadiumPage.notFound')}</UiH2>
                        <Text c="dimmed">{t('stadiumPage.notFoundDetail', { id: id ?? '' })}</Text>
                    </Stack>
                </Center>
            </Box>
        );
    }

    const mainTabs: { id: MainTab; label: string }[] = [
        { id: 'lore', label: t('stadiumPage.tabLore') },
        { id: 'clubs', label: t('stadiumPage.tabClubs') },
        { id: 'matches', label: t('stadiumPage.tabMatches') },
    ];

    return (
        <Box className={classes.page}>
            <header
                className={`${classes.hero} ${heroImage ? classes.heroWithImage : ''}`}
                style={
                    heroImage
                        ? ({ ['--hero-image' as string]: `url(${heroImage})` } as React.CSSProperties)
                        : undefined
                }
            >
                {heroImage && (
                    <div
                        aria-hidden
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${heroImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.22,
                        }}
                    />
                )}
                <div className={classes.heroBody}>
                    <div className={classes.heroPhotoFallback}>{initials(stadium.name)}</div>
                    <div className={classes.heroMeta}>
                        <span className={classes.roleLabel}>{t('stadiumPage.role')}</span>
                        <h1 className={classes.stadiumName}>{stadium.name}</h1>
                        <span className={classes.countryLine}>{countryLabel}</span>
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

                    {mainTab === 'lore' && (
                        <>
                            {!lore?.extract ? (
                                <p className={classes.emptyNote}>{t('stadiumPage.noLore')}</p>
                            ) : (
                                <>
                                    {lore.thumbnailUrl && !heroImage && (
                                        <img
                                            src={lore.thumbnailUrl}
                                            alt=""
                                            className={classes.loreThumb}
                                        />
                                    )}
                                    <p className={classes.loreExtract}>{lore.extract}</p>
                                    {lore.pageUrl && (
                                        <a
                                            href={lore.pageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={classes.wikiLink}
                                        >
                                            {t('stadiumPage.readOnWikipedia')}
                                            <IconExternalLink size={14} />
                                        </a>
                                    )}
                                    {lore.attribution && (
                                        <p className={classes.attribution}>{lore.attribution}</p>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {mainTab === 'clubs' && (
                        <>
                            {homeClubs.length === 0 ? (
                                <p className={classes.emptyNote}>{t('stadiumPage.noClubs')}</p>
                            ) : (
                                homeClubs.map((club) => (
                                    <div key={club.teamId} className={classes.clubRow}>
                                        <button
                                            type="button"
                                            className={classes.clubBtn}
                                            onClick={() =>
                                                navigateWithTransition(`/team/${club.teamId}`, {
                                                    transitionType: 'loading',
                                                    duration: 900,
                                                })
                                            }
                                        >
                                            {club.logoUrl && (
                                                <img
                                                    src={club.logoUrl}
                                                    alt=""
                                                    className={classes.clubCrest}
                                                />
                                            )}
                                            {club.name}
                                        </button>
                                        {club.relationship === 'primary_home' && (
                                            <span className={classes.primaryBadge}>
                                                {t('stadiumPage.primaryHome')}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {mainTab === 'matches' && (
                        <>
                            {recentFixtures.length === 0 ? (
                                <p className={classes.emptyNote}>{t('stadiumPage.noMatches')}</p>
                            ) : (
                                <div className={matchClasses.matchGrid}>
                                    {recentFixtures.map((f) => {
                                        const homeTeam = teamById.get(f.homeTeamId);
                                        const awayTeam = teamById.get(f.awayTeamId);
                                        const homeName = homeTeam?.name ?? `Team #${f.homeTeamId}`;
                                        const awayName = awayTeam?.name ?? `Team #${f.awayTeamId}`;
                                        const scores = scoresFromFixtureRow(f);
                                        const score =
                                            scores.homeScore != null && scores.awayScore != null
                                                ? `${scores.homeScore}-${scores.awayScore}`
                                                : '—';
                                        const dateLabel = new Date(f.date).toLocaleDateString(undefined, {
                                            day: 'numeric',
                                            month: 'short',
                                        });

                                        return (
                                            <article
                                                key={f.id}
                                                className={matchClasses.matchCard}
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
                                                    <span className={matchClasses.matchCardDate}>
                                                        {dateLabel}
                                                    </span>
                                                </div>
                                                <div className={matchClasses.matchCardScoreRow}>
                                                    <span className={matchClasses.matchCardOppName}>
                                                        {homeName} vs {awayName}
                                                    </span>
                                                </div>
                                                <div className={matchClasses.matchCardScoreRow}>
                                                    <span className={matchClasses.matchCardScore}>
                                                        {score}
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
