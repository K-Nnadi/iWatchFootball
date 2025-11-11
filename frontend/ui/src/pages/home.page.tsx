import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Center,
    Container,
    Grid,
    Group,
    Stack,
    Text
} from '@mantine/core';
import {
    IconBell,
    IconClock,
    IconPlayerPlay,
    IconTicket,
    IconVideo
} from '@tabler/icons-react';
import {Carousel} from '@mantine/carousel';
import '../styles/homepage.css';
import {usePageTransition} from "../hooks/usePageTransition";
import {ModernBody, ModernButton, ModernCaption, ModernCard, ModernH1, ModernH2, ModernH3} from '../components/modern';

// Hero Section Component - Lando Style
function HeroSection() {
    return (
        <Box
            className="dark-theme"
            style={{
                padding: '6rem 0',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                width: '100vw',
                marginLeft: 'calc(-50vw + 50%)',
                marginRight: 'calc(-50vw + 50%)'
            }}
        >
            {/* Background Pattern */}
            <Box
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 0%, rgba(0, 255, 136, 0.05) 100%)',
                    pointerEvents: 'none'
                }}
            />

            <Container size="xl">
                <Grid align="center" gutter="xl">
                    <Grid.Col span={{base: 12, md: 6}}>
                        <Stack gap="xl" className="hero-content">
                            <ModernCaption>Football Tracking Platform</ModernCaption>
                            <ModernH1>
                                Your Ultimate <span style={{color: 'var(--modern-lime)'}}>Football</span> Companion
                            </ModernH1>
                            <ModernBody>
                                Live scores, personalised statistics, and ticket bookings all in one place.
                                Experience football like never before with our cutting-edge platform.
                            </ModernBody>
                            <Group gap="md">
                                <ModernButton variant="primary" size="lg">
                                    Download App
                                </ModernButton>
                                <ModernButton variant="secondary" size="lg">
                                    Explore Features
                                </ModernButton>
                            </Group>
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

// Live Matches Section Component
function LiveMatchesSection() {
    const { navigateWithTransition } = usePageTransition();

    const matches = [
        {
            id: 1,
            homeTeam: 'Arsenal',
            awayTeam: 'Chelsea',
            homeScore: 2,
            awayScore: 1,
            statusColor: 'red',
            league: 'Premier League',
            time: '65\'',
            homeLogo: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=120&q=80',
            awayLogo: 'https://images.unsplash.com/photo-1592206112774-73d688f6e46e?auto=format&w=120&q=80',
        },
        {
            id: 2,
            homeTeam: 'Barcelona',
            awayTeam: 'Real Madrid',
            homeScore: 2,
            awayScore: 2,
            statusColor: 'green',
            league: 'La Liga',
            time: '86\'',
            homeLogo: 'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=120&q=80',
            awayLogo: 'https://images.unsplash.com/photo-1599245895529-3c0992ab3c91?auto=format&w=120&q=80',
        },
        {
            id: 3,
            homeTeam: 'Juventus',
            awayTeam: 'Inter',
            homeScore: 1,
            awayScore: 3,
            statusColor: 'gray',
            league: 'Serie A',
            time: 'FT',
            homeLogo: 'https://images.unsplash.com/photo-1605973174423-47046f81ec9b?auto=format&w=120&q=80',
            awayLogo: 'https://images.unsplash.com/photo-1616941360635-7d51b6607429?auto=format&w=120&q=80',
        }
    ];

    return (
        <Box
            py="6rem"
        >
            <Container size="xl">
                <Group justify="space-between" mb="3rem">
                    <ModernH2>
                        Live <span style={{color: 'var(--modern-lime)'}}>Matches</span>
                    </ModernH2>
                    <Button
                        variant="outline"
                        style={{ 
                            cursor: 'pointer',
                            borderColor: 'var(--modern-lime)',
                            color: 'var(--modern-lime)',
                            backgroundColor: 'transparent'
                        }}
                        onClick={() => navigateWithTransition('/matches')}
                    >
                        View All
                    </Button>
                </Group>

                <Grid gutter="xl">
                    {matches.map((match) => (
                        <Grid.Col key={match.id} span={{base: 12, md: 4}}>
                            <ModernCard hover accent>
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <ModernCaption>{match.league}</ModernCaption>
                                        <Group gap="xs">
                                            <IconPlayerPlay size={16} color="var(--modern-lime)"/>
                                            <Text size="sm" color="var(--modern-lime)" fw={600}>
                                                LIVE
                                            </Text>
                                        </Group>
                                    </Group>

                                    <Group justify="space-between" align="center">
                                        <Stack align="center" gap="xs">
                                            <Avatar
                                                src={match.homeLogo}
                                                size="xl"
                                                radius="md"
                                            />
                                            <Text fw={600} size="sm">{match.homeTeam}</Text>
                                        </Stack>

                                        <Stack align="center" gap="xs">
                                            <Text
                                                size="2.5rem"
                                                fw={900}
                                                style={{color: 'var(--modern-lime)'}}
                                            >
                                                {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : '- -'}
                                            </Text>
                                            <Group gap="xs">
                                                <IconClock size={14}/>
                                                <Text size="sm" c="dimmed">{match.time}</Text>
                                            </Group>
                                        </Stack>

                                        <Stack align="center" gap="xs">
                                            <Avatar
                                                src={match.awayLogo}
                                                size="xl"
                                                radius="md"
                                            />
                                            <Text fw={600} size="sm">{match.awayTeam}</Text>
                                        </Stack>
                                    </Group>
                                </Stack>
                            </ModernCard>
                        </Grid.Col>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

// Latest News Section Component
function LatestNewsSection() {
    const news = [
        {
            id: 1,
            title: 'Guardiola Signs New 3-Year Contract with Man City',
            excerpt: 'The Spanish manager has committed his future to the club until 2026 after winning four Premier League titles.',
            category: 'Premier League',
            time: '2 hours ago',
            image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80'
        },
        {
            id: 2,
            title: '2026 World Cup Stadiums Revealed Across USA, Canada & Mexico',
            excerpt: 'FIFA has announced the 16 host cities for the expanded 48-team tournament in North America.',
            category: 'World Cup',
            time: '5 hours ago',
            image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80'
        },
        {
            id: 3,
            title: 'Bellingham Set for Record Move to Real Madrid',
            excerpt: 'The English midfielder is reportedly close to completing a €120m transfer from Dortmund this summer.',
            category: 'Transfer News',
            time: 'Yesterday',
            image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80'
        },
        {
            id: 4,
            title: 'Bellingham Set for Record Move to Real Madrid',
            excerpt: 'The English midfielder is reportedly close to completing a €120m transfer from Dortmund this summer.',
            category: 'Transfer News',
            time: 'Yesterday',
            image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80'
        },
        {
            id: 5,
            title: 'Bellingham Set for Record Move to Real Madrid',
            excerpt: 'The English midfielder is reportedly close to completing a €120m transfer from Dortmund this summer.',
            category: 'Transfer News',
            time: 'Yesterday',
            image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80'
        }
    ];

    return (
        <Box
            className="dark-theme"
            py="6rem"
            style={{
                width: '100vw',
                marginLeft: 'calc(-50vw + 50%)',
                marginRight: 'calc(-50vw + 50%)'
            }}
        >
            <Container size="xl">
                <Group justify="space-between" mb="3rem">
                    <ModernH2>
                        Latest <span style={{color: 'var(--modern-lime)'}}>News</span>
                    </ModernH2>
                    <ModernButton variant="secondary">
                        View All
                    </ModernButton>
                </Group>

                <Carousel
                    slideSize={{base: '100%', sm: '50%', md: '33.333%'}}
                    slideGap="lg"
                    align="start"
                    slidesToScroll={1}
                    withIndicators
                    loop
                    dragFree
                    height="100%"
                >
                    {news.map((article) => (
                        <Carousel.Slide key={article.id}>
                            <ModernCard hover>
                                <Stack gap="md">
                                    <Box
                                        component="img"
                                        src={article.image}
                                        alt={article.title}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    />
                                    <Stack gap="md">
                                        <Group gap="xs">
                                            <ModernCaption>{article.category}</ModernCaption>
                                            <Text size="sm" c="dimmed">•</Text>
                                            <Text size="sm" c="dimmed">{article.time}</Text>
                                        </Group>
                                        <ModernH3>
                                            {article.title}
                                        </ModernH3>
                                        <ModernBody>
                                            {article.excerpt}
                                        </ModernBody>
                                        <ModernButton variant="secondary" size="sm">
                                            Read More
                                        </ModernButton>
                                    </Stack>
                                </Stack>
                            </ModernCard>
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Box>
    );
}

// Features Section Component
function FeaturesSection() {
    const features = [
        {
            icon: IconBell,
            title: 'Personalised Stats',
            description: 'Measure your football journey-track games attended, goals you’ve witnessed, and total stadiums visited.'
        },
        {
            icon: IconTicket,
            title: 'Easy Ticketing',
            description: 'Secure tickets for matches across all major leagues with our verified partners.'
        },
        {
            icon: IconVideo,
            title: 'Match Highlights',
            description: 'Watch extended highlights and key moments from all the top matches.'
        }
    ];

    return (
        <Box
            py="6rem"
        >
            <Container size="xl">
                <ModernH2 style={{textAlign: 'center', marginBottom: '4rem'}}>
                    Why Choose <span style={{color: 'var(--modern-lime)'}}>I Watch Football</span>?
                </ModernH2>

                <Grid gutter="xl">
                    {features.map((feature, index) => (
                        <Grid.Col key={index} span={{base: 12, md: 4}}>
                            <ModernCard hover accent>
                                <Stack align="center" gap="lg" p="xl">
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
                                        <feature.icon size={32} color="var(--lando-black)"/>
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
            <LatestNewsSection/>
            <FeaturesSection/>
        </>
    );
}
