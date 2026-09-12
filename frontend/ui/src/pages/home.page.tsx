import React, { useMemo, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Center,
    Container,
    Grid,
    Group,
    Skeleton,
    Stack,
    Text,
    useMantineTheme
} from '@mantine/core';
import { useMediaQuery, useInterval } from '@mantine/hooks';
import {
    IconBell,
    IconClock,
    IconPlayerPlay,
    IconTicket,
    IconVideo,
    IconUsers,
    IconBuildingStadium,
    IconShoppingCart,
    IconStar,
    IconMap
} from '@tabler/icons-react';
import {Carousel, type Embla} from '@mantine/carousel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/homepage.css';
import carouselClasses from '../components/carousel/news.carousel.module.css';
import {usePageTransition} from "../hooks/usePageTransition";
import {useScrollAnimation} from "../hooks/useScrollAnimation";
import {ModernBody, ModernButton, ModernCaption, ModernCard, ModernH1, ModernH2, ModernH3} from '../components/modern';
import { UiAccent, UiBody, UiCaption, UiMatchList, UiSectionHeader, type MatchRowData } from '../components/ui';
import { useTranslation } from '../i18n/useTranslation';
import { useGetAllNewsArticle } from '@iWatchFootball/clients/controllers/news-article';
import { useGetQueryFixture } from '@iWatchFootball/clients/controllers/fixture';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetQueryCompetition } from '@iWatchFootball/clients/controllers/competition';
import type { Competition, Fixture, Team } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import { scoresFromFixtureRow } from '../shared/fixtureScores';
import { formatLiveClockLabel, LIVE_FIXTURE_POLL_MS } from '../shared/liveClock';

dayjs.extend(relativeTime);

const NEWS_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=600&q=80';

function HeroSection() {
    const { t } = useTranslation();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);
    
    return (
        <Box
            style={{
                padding: isMobile ? '3rem 0' : '6rem 0',
                position: 'relative',
                overflowX: 'hidden',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--modern-bg-primary)',
                color: 'var(--modern-text-primary)',
                width: '100%',
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

            <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
                <Grid align="center" gutter="xl">
                    <Grid.Col span={{base: 12, md: 6}}>
                        <Stack gap="xl" className="hero-content">
                            <UiCaption>{t('home.heroTagline')}</UiCaption>
                            <ModernH1>
                                {t('home.heroTitlePrefix')}{' '}
                                <UiAccent>{t('home.heroTitleAccent')}</UiAccent>{' '}
                                {t('home.heroTitleSuffix')}
                            </ModernH1>
                            <ModernBody>
                                {t('home.heroDescription')}
                            </ModernBody>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{base: 12, md: 6}}>
                        <Center>
                            <Box
                                component="img"
                                src="/images/hero-football.png"
                                alt="Football player celebrating"
                                className="hero-image"
                                style={{
                                    borderRadius: '1rem',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease'
                                }}
                            />
                        </Center>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}

function uniqueIds(values: Array<number | undefined>): number[] {
    const ids: number[] = [];
    const seen = new Set<number>();
    for (const id of values) {
        if (typeof id === 'number' && !seen.has(id)) {
            seen.add(id);
            ids.push(id);
        }
    }
    return ids;
}

function todayRangeIso(): { from: string; to: string } {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { from: from.toISOString(), to: to.toISOString() };
}

function fixtureToHomeRow(
    fix: Fixture,
    teamById: Map<number, Team>,
    competitionById: Map<number, Competition>,
): { league: string; row: MatchRowData } {
    const home = typeof fix.homeTeamId === 'number' ? teamById.get(fix.homeTeamId) : undefined;
    const away = typeof fix.awayTeamId === 'number' ? teamById.get(fix.awayTeamId) : undefined;
    const competition = competitionById.get(fix.competitionId);
    const scores = scoresFromFixtureRow(fix);
    const isLive = fix.status === 'Live';
    return {
        league: competition?.name?.trim() || 'Competition',
        row: {
            id: fix.id,
            homeTeam: home?.name?.trim() || (fix.homeTeamId != null ? `Team ${fix.homeTeamId}` : 'Home'),
            awayTeam: away?.name?.trim() || (fix.awayTeamId != null ? `Team ${fix.awayTeamId}` : 'Away'),
            homeLogo: home?.logoUrl,
            awayLogo: away?.logoUrl,
            homeScore: scores.homeScore,
            awayScore: scores.awayScore,
            time: formatLiveClockLabel({
                status: fix.status,
                metadata: fix.metadata,
                kickoffIso: fix.date,
            }),
            isLive,
        },
    };
}

function LiveMatchesSection() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const scrollAnimation = useScrollAnimation({ animationType: 'fadeUp', delay: 0, threshold: 0.2 });
    const todayRange = useMemo(() => todayRangeIso(), []);

    const { data: liveFixturesRaw = [], isLoading: loadingLive } = useGetQueryFixture(
        { where: { status: 'Live' }, take: 80, order: { date: 'ASC' } } as any,
        { query: { refetchInterval: LIVE_FIXTURE_POLL_MS } as any },
    );
    const { data: todayFixturesRaw = [], isLoading: loadingToday } = useGetQueryFixture(
        {
            where: { date: { $gte: todayRange.from, $lte: todayRange.to } },
            take: 80,
            order: { date: 'ASC' },
        } as any,
        { query: { refetchInterval: LIVE_FIXTURE_POLL_MS } as any },
    );

    const liveFixtures = Array.isArray(liveFixturesRaw) ? liveFixturesRaw : [];
    const todayFixtures = Array.isArray(todayFixturesRaw) ? todayFixturesRaw : [];
    const fixtures = liveFixtures.length > 0 ? liveFixtures : todayFixtures;

    const teamIds = useMemo(
        () => uniqueIds(fixtures.flatMap((f) => [f.homeTeamId, f.awayTeamId])),
        [fixtures],
    );
    const competitionIds = useMemo(
        () => uniqueIds(fixtures.map((f) => f.competitionId)),
        [fixtures],
    );

    const { data: teamsData = [], isLoading: loadingTeams } = useGetQueryTeam(
        { where: { id: { $in: teamIds.length ? teamIds : [-1] } }, take: Math.max(teamIds.length, 1) } as any,
        { query: { enabled: teamIds.length > 0 } as any },
    );
    const { data: competitionsData = [], isLoading: loadingCompetitions } = useGetQueryCompetition(
        {
            where: { id: { $in: competitionIds.length ? competitionIds : [-1] } },
            take: Math.max(competitionIds.length, 1),
        } as any,
        { query: { enabled: competitionIds.length > 0 } as any },
    );

    const matchGroups = useMemo(() => {
        const teams = Array.isArray(teamsData) ? teamsData : [];
        const competitions = Array.isArray(competitionsData) ? competitionsData : [];
        const teamById = new Map(teams.map((t) => [t.id, t]));
        const competitionById = new Map(competitions.map((c) => [c.id, c]));
        const byLeague = new Map<string, MatchRowData[]>();
        for (const fix of fixtures) {
            const { league, row } = fixtureToHomeRow(fix, teamById, competitionById);
            const list = byLeague.get(league) ?? [];
            list.push(row);
            byLeague.set(league, list);
        }
        const groups: { league: string; matches: MatchRowData[] }[] = [];
        byLeague.forEach((matches, league) => {
            groups.push({ league, matches });
        });
        return groups;
    }, [fixtures, teamsData, competitionsData]);

    const loading =
        loadingLive ||
        loadingToday ||
        (teamIds.length > 0 && loadingTeams) ||
        (competitionIds.length > 0 && loadingCompetitions);

    return (
        <Box
            ref={scrollAnimation.ref}
            className={scrollAnimation.className}
            py={{ base: '2rem', md: '4rem' }}
            style={{
                backgroundColor: 'var(--ui-bg-surface)',
                borderTop: '1px solid var(--ui-divider)',
                borderBottom: '1px solid var(--ui-divider)',
            }}
        >
            <Container size="xl" px={{ base: 'md', md: 'xl' }}>
                <UiSectionHeader
                    title={
                        <>
                            {t('home.liveTitlePrefix')}{' '}
                            <UiAccent>{t('home.liveTitleAccent')}</UiAccent>
                        </>
                    }
                    action={{ label: t('home.viewAll'), onClick: () => navigateWithTransition('/matches') }}
                />
                {loading ? (
                    <Stack gap="sm">
                        <Skeleton height={64} radius="md" />
                        <Skeleton height={64} radius="md" />
                        <Skeleton height={64} radius="md" />
                    </Stack>
                ) : matchGroups.length === 0 ? (
                    <Stack gap={4}>
                        <UiBody>{t('home.liveEmpty')}</UiBody>
                        <UiCaption>{t('home.liveEmptyHint')}</UiCaption>
                    </Stack>
                ) : (
                    <UiMatchList
                        groups={matchGroups}
                        onMatchClick={(id) => navigateWithTransition(`/match/${id}`)}
                    />
                )}
            </Container>
        </Box>
    );
}

// Top News Section Component
function TopNewsSection() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const scrollAnimation = useScrollAnimation({ animationType: 'fadeUp', delay: 150, threshold: 0.2 });
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);
    const [newsEmbla, setNewsEmbla] = useState<Embla | null>(null);
    const [newsIsPaused, setNewsIsPaused] = useState(false);

    useInterval(() => {
        if (!newsIsPaused && newsEmbla) {
            newsEmbla.scrollNext();
        }
    }, 3500, { autoInvoke: true });

    const { data: allArticles, isLoading } = useGetAllNewsArticle();

    const latestArticles = useMemo(() => {
        if (!allArticles) return [];
        return [...allArticles]
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, 9);
    }, [allArticles]);

    const featuredArticle = latestArticles[0];
    const topNews = latestArticles.slice(1);

    return (
        <Box
            ref={scrollAnimation.ref}
            className={scrollAnimation.className}
            py={{ base: '3rem', md: '6rem' }}
            style={{
                backgroundColor: 'var(--modern-bg-primary)',
                color: 'var(--modern-text-primary)',
                borderTop: '1px solid var(--modern-section-divider)',
                borderBottom: '1px solid var(--modern-section-divider)',
                position: 'relative',
                overflowX: 'hidden',
                width: '100%',
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
            <Container size="xl" style={{ position: 'relative', zIndex: 1 }} px={{ base: 'md', md: 'xl' }}>
                <Group justify="space-between" mb="3rem" wrap="wrap" gap="md">
                    <ModernH2 style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}>
                        {t('home.topNewsPrefix')}{' '}
                        <span style={{color: 'var(--modern-lime)'}}>{t('home.topNewsAccent')}</span>
                    </ModernH2>
                    <ModernButton 
                        variant="secondary"
                        size="sm"
                        onClick={() => navigateWithTransition('/news')}
                    >
                        {t('home.viewAll')}
                    </ModernButton>
                </Group>

                {/* Featured Article */}
                {isLoading ? (
                    <Grid gutter={0} mb="3rem">
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Skeleton height={isMobile ? 250 : 400} style={{ borderRadius: isMobile ? '8px 8px 0 0' : '8px 0 0 8px' }} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Box
                                style={{
                                    height: isMobile ? 'auto' : '400px',
                                    backgroundColor: 'var(--modern-card-bg)',
                                    padding: isMobile ? '1.5rem' : '3rem',
                                    borderRadius: isMobile ? '0 0 8px 8px' : '0 8px 8px 0',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                }}
                            >
                                <Stack gap="md">
                                    <Skeleton height={28} />
                                    <Skeleton height={28} width="80%" />
                                    <Skeleton height={16} />
                                    <Skeleton height={16} width="90%" />
                                    <Skeleton height={12} width="40%" mt="md" />
                                </Stack>
                            </Box>
                        </Grid.Col>
                    </Grid>
                ) : featuredArticle ? (
                    <Grid gutter={0} mb="3rem">
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Box
                                onClick={() => navigateWithTransition(`/news/${featuredArticle.id}`)}
                                style={{
                                    cursor: 'pointer',
                                    position: 'relative',
                                    height: isMobile ? '250px' : '400px',
                                    borderRadius: isMobile ? '8px 8px 0 0' : '8px 0 0 8px',
                                    overflow: 'hidden',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Box
                                    component="img"
                                    src={featuredArticle.imageUrl || NEWS_FALLBACK_IMAGE}
                                    alt={featuredArticle.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Box
                                onClick={() => navigateWithTransition(`/news/${featuredArticle.id}`)}
                                style={{
                                    cursor: 'pointer',
                                    minHeight: isMobile ? 'auto' : '400px',
                                    height: isMobile ? 'auto' : '400px',
                                    backgroundColor: 'var(--modern-card-bg)',
                                    padding: isMobile ? '1.5rem' : '3rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    borderRadius: isMobile ? '0 0 8px 8px' : '0 8px 8px 0',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Stack gap="md">
                                    <ModernH2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', lineHeight: 1.3 }}>
                                        {featuredArticle.title}
                                    </ModernH2>
                                    {featuredArticle.summary && (
                                        <ModernBody style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                                            {featuredArticle.summary}
                                        </ModernBody>
                                    )}
                                    <Group gap="xs" mt="md">
                                        <Text size="sm" c="dimmed">{featuredArticle.source}</Text>
                                        <Text size="sm" c="dimmed">•</Text>
                                        <Text size="sm" c="dimmed">{dayjs(featuredArticle.publishedAt).fromNow()}</Text>
                                    </Group>
                                </Stack>
                            </Box>
                        </Grid.Col>
                    </Grid>
                ) : null}

                {/* Top News Carousel */}
                {(isLoading || topNews.length > 0) && (
                    <Box
                        style={{ position: 'relative', paddingBottom: '32px' }}
                        onMouseEnter={() => setNewsIsPaused(true)}
                        onMouseLeave={() => setNewsIsPaused(false)}
                    >
                        <Carousel
                            slideSize={{base: '85%', sm: '50%', md: '25%'}}
                            slideGap="lg"
                            align="start"
                            slidesToScroll={1}
                            withIndicators
                            loop
                            dragFree
                            height="100%"
                            getEmblaApi={setNewsEmbla}
                            classNames={
                                carouselClasses as {
                                    control?: string;
                                    indicator?: string;
                                    indicators?: string;
                                    card?: string;
                                    category?: string;
                                    title?: string;
                                }
                            }
                        >
                            {isLoading
                                ? Array.from({ length: 4 }).map((_, i) => (
                                      <Carousel.Slide key={i}>
                                          <ModernCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                              <Stack gap="md" style={{ flex: 1 }}>
                                                  <Skeleton height={180} radius="xs" />
                                                  <Skeleton height={14} />
                                                  <Skeleton height={14} width="70%" />
                                                  <Skeleton height={10} width="50%" mt="auto" />
                                              </Stack>
                                          </ModernCard>
                                      </Carousel.Slide>
                                  ))
                                : topNews.map((article) => (
                                      <Carousel.Slide key={article.id}>
                                          <Box
                                              onClick={() => navigateWithTransition(`/news/${article.id}`)}
                                              style={{ cursor: 'pointer', height: '100%' }}
                                          >
                                              <ModernCard hover style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                  <Stack gap="md" style={{ flex: 1 }}>
                                                      <Box
                                                          component="img"
                                                          src={article.imageUrl || NEWS_FALLBACK_IMAGE}
                                                          alt={article.title}
                                                          style={{
                                                              width: '100%',
                                                              height: '180px',
                                                              objectFit: 'cover',
                                                              borderRadius: '4px',
                                                          }}
                                                      />
                                                      <Stack gap="xs" style={{ flex: 1 }}>
                                                          <ModernH3 style={{ fontSize: '1rem', lineHeight: 1.4 }}>
                                                              {article.title}
                                                          </ModernH3>
                                                          <Group gap="xs" mt="auto">
                                                              <Text size="xs" c="dimmed">{article.source}</Text>
                                                              <Text size="xs" c="dimmed">•</Text>
                                                              <Text size="xs" c="dimmed">{dayjs(article.publishedAt).fromNow()}</Text>
                                                          </Group>
                                                      </Stack>
                                                  </Stack>
                                              </ModernCard>
                                          </Box>
                                      </Carousel.Slide>
                                  ))}
                        </Carousel>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

// Features Section Component
function FeaturesSection() {
    const { t } = useTranslation();
    const scrollAnimation = useScrollAnimation({ animationType: 'fadeUp', delay: 200, threshold: 0.2 });
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);

    const features = [
        { icon: IconBell,            title: t('home.featurePersonalisedStats'),   description: t('home.featurePersonalisedStatsDesc') },
        { icon: IconTicket,          title: t('home.featureEasyTicketing'),        description: t('home.featureEasyTicketingDesc') },
        { icon: IconVideo,           title: t('home.featureHighlights'),           description: t('home.featureHighlightsDesc') },
        { icon: IconStar,            title: t('home.featureFollowTeams'),          description: t('home.featureFollowTeamsDesc') },
        { icon: IconUsers,           title: t('home.featureFriendsStats'),         description: t('home.featureFriendsStatsDesc') },
        { icon: IconShoppingCart,    title: t('home.featureTicketMarketplace'),    description: t('home.featureTicketMarketplaceDesc') },
        { icon: IconPlayerPlay,      title: t('home.featureLiveScores'),           description: t('home.featureLiveScoresDesc') },
        { icon: IconBuildingStadium, title: t('home.featureStadiumExplorer'),      description: t('home.featureStadiumExplorerDesc') },
        { icon: IconMap,             title: t('home.featureAttendance'),           description: t('home.featureAttendanceDesc') },
    ];

    // Duplicate items so the seamless loop works (track is 2× wide, animate by -50%)
    const tickerItems = [...features, ...features];

    const cardWidth = isMobile ? 280 : 340;
    const cardGap = 24;

    return (
        <Box
            ref={scrollAnimation.ref}
            className={scrollAnimation.className}
            py={{ base: '3rem', md: '6rem' }}
            style={{
                backgroundColor: 'var(--modern-bg-secondary)',
                color: 'var(--modern-text-primary)',
                borderTop: '1px solid var(--modern-section-divider)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                className="section-background-pattern"
                style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    opacity: 0.03, pointerEvents: 'none', zIndex: 0,
                }}
            />

            <Box style={{ position: 'relative', zIndex: 1 }}>
                <Container size="xl" px={{ base: 'md', md: 'xl' }}>
                    <ModernH2 style={{
                        textAlign: 'center',
                        marginBottom: isMobile ? '2rem' : '4rem',
                        fontSize: 'clamp(1.25rem, 4vw, 2rem)',
                    }}>
                        {t('home.whyChoosePrefix')}{' '}
                        <span style={{ color: 'var(--modern-lime)' }}>{t('home.whyChooseAccent')}</span>
                        {t('home.whyChooseSuffix')}
                    </ModernH2>
                </Container>

                <div className="features-ticker-wrapper">
                    <div className="features-ticker-track">
                        {tickerItems.map((feature, index) => (
                            <div
                                key={index}
                                style={{
                                    width: `${cardWidth}px`,
                                    flexShrink: 0,
                                    marginRight: `${cardGap}px`,
                                }}
                            >
                                <ModernCard accent style={{ height: '280px' }}>
                                    <Stack align="center" gap="lg" p="xl" style={{ height: '100%' }}>
                                        <Box
                                            style={{
                                                backgroundColor: 'var(--modern-lime)',
                                                borderRadius: '50%',
                                                width: '4.5rem',
                                                height: '4.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <feature.icon size={28} color="var(--modern-bg-primary)" stroke={2} />
                                        </Box>
                                        <ModernH3 style={{ textAlign: 'center', fontSize: '1rem' }}>
                                            {feature.title}
                                        </ModernH3>
                                        <ModernBody style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                                            {feature.description}
                                        </ModernBody>
                                    </Stack>
                                </ModernCard>
                            </div>
                        ))}
                    </div>
                </div>
            </Box>
        </Box>
    );
}

export function HomePage() {
    return (
        <>
            <HeroSection/>
            <LiveMatchesSection/>
            <TopNewsSection/>
            <FeaturesSection/>
        </>
    );
}
