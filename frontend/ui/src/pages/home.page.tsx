import React, { useMemo } from 'react';
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
import { useMediaQuery } from '@mantine/hooks';
import {
    IconBell,
    IconClock,
    IconPlayerPlay,
    IconTicket,
    IconVideo
} from '@tabler/icons-react';
import {Carousel} from '@mantine/carousel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../styles/homepage.css';
import carouselClasses from '../components/carousel/news.carousel.module.css';
import {usePageTransition} from "../hooks/usePageTransition";
import {useScrollAnimation} from "../hooks/useScrollAnimation";
import {ModernBody, ModernButton, ModernCaption, ModernCard, ModernH1, ModernH2, ModernH3} from '../components/modern';
import { UiAccent, UiCaption, UiMatchList, UiSectionHeader } from '../components/ui';
import { useTranslation } from '../i18n/useTranslation';
import { useGetAllNewsArticle } from '@iWatchFootball/clients/controllers/news-article';

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
                                src="https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80"
                                alt="Football action"
                                className="hero-image"
                                style={{
                                    borderRadius: '1rem',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    maxWidth: '100%',
                                    height: 'auto',
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

// Live Matches Section — Fotmob-style compact match list
function LiveMatchesSection() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const scrollAnimation = useScrollAnimation({ animationType: 'fadeUp', delay: 0, threshold: 0.2 });

    const matchGroups = [
        {
            league: 'Premier League',
            matches: [
                {
                    id: 1,
                    homeTeam: 'Arsenal',
                    awayTeam: 'Chelsea',
                    homeScore: 2,
                    awayScore: 1,
                    time: "65'",
                    isLive: true,
                    homeLogo: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=120&q=80',
                    awayLogo: 'https://images.unsplash.com/photo-1592206112774-73d688f6e46e?auto=format&w=120&q=80',
                },
            ],
        },
        {
            league: 'La Liga',
            matches: [
                {
                    id: 2,
                    homeTeam: 'Barcelona',
                    awayTeam: 'Real Madrid',
                    homeScore: 2,
                    awayScore: 2,
                    time: "86'",
                    isLive: true,
                    homeLogo: 'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=120&q=80',
                    awayLogo: 'https://images.unsplash.com/photo-1599245895529-3c0992ab3c91?auto=format&w=120&q=80',
                },
            ],
        },
        {
            league: 'Serie A',
            matches: [
                {
                    id: 3,
                    homeTeam: 'Juventus',
                    awayTeam: 'Inter',
                    homeScore: 1,
                    awayScore: 3,
                    time: 'FT',
                    isLive: false,
                    homeLogo: 'https://images.unsplash.com/photo-1605973174423-47046f81ec9b?auto=format&w=120&q=80',
                    awayLogo: 'https://images.unsplash.com/photo-1616941360635-7d51b6607429?auto=format&w=120&q=80',
                },
            ],
        },
    ];

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
                <UiMatchList
                    groups={matchGroups}
                    onMatchClick={(id) => navigateWithTransition(`/match/${id}`)}
                />
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
                    <Box style={{ position: 'relative', paddingBottom: '32px' }}>
                        <Carousel
                            slideSize={{base: '85%', sm: '50%', md: '25%'}}
                            slideGap="lg"
                            align="start"
                            slidesToScroll={1}
                            withIndicators
                            loop
                            dragFree
                            height="100%"
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
        {
            icon: IconBell,
            title: t('home.featurePersonalisedStats'),
            description: t('home.featurePersonalisedStatsDesc'),
        },
        {
            icon: IconTicket,
            title: t('home.featureEasyTicketing'),
            description: t('home.featureEasyTicketingDesc'),
        },
        {
            icon: IconVideo,
            title: t('home.featureHighlights'),
            description: t('home.featureHighlightsDesc'),
        },
    ];

    return (
        <Box
            ref={scrollAnimation.ref}
            className={scrollAnimation.className}
            py={{ base: '3rem', md: '6rem' }}
            px={{ base: 'md', md: 0 }}
            style={{
                backgroundColor: 'var(--modern-bg-secondary)',
                color: 'var(--modern-text-primary)',
                borderTop: '1px solid var(--modern-section-divider)',
                position: 'relative',
                overflowX: 'hidden',
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
                <ModernH2 style={{
                    textAlign: 'center', 
                    marginBottom: isMobile ? '2rem' : '4rem',
                    fontSize: 'clamp(1.25rem, 4vw, 2rem)'
                }}>
                    {t('home.whyChoosePrefix')}{' '}
                    <span style={{color: 'var(--modern-lime)'}}>{t('home.whyChooseAccent')}</span>
                    {t('home.whyChooseSuffix')}
                </ModernH2>

                <Grid gutter="xl" align="stretch">
                    {features.map((feature, index) => (
                        <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                            <ModernCard hover accent h="100%">
                                <Stack align="center" gap="lg" p="xl" style={{ height: '100%' }}>
                                    <Box
                                        style={{
                                            backgroundColor: 'var(--modern-lime)',
                                            borderRadius: '50%',
                                            width: '5rem',
                                            height: '5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <feature.icon size={32} color="var(--modern-bg-primary)" stroke={2}/>
                                    </Box>
                                    <ModernH3 style={{textAlign: 'center'}}>
                                        {feature.title}
                                    </ModernH3>
                                    <ModernBody style={{textAlign: 'center'}}>
                                        {feature.description}
                                    </ModernBody>
                                </Stack>
                            </ModernCard>
                        </Grid.Col>
                    ))}
                </Grid>
            </Container>
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
