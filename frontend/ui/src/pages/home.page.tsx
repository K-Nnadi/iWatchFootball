import React from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Group,
    Stack,
    Card,
    Badge,
    Avatar,
    Grid,
    Box,
    Paper,
    SimpleGrid,
    ActionIcon,
    TextInput,
    Flex,
    Divider,
    Center
} from '@mantine/core';
import {
    IconTrophy,
    IconBell,
    IconTicket,
    IconVideo,
    IconApple,
    IconBrandGooglePlay,
    IconChevronRight,
    IconArrowRight,
    IconSend,
    IconBrandFacebook,
    IconBrandTwitter,
    IconBrandInstagram,
    IconBrandYoutube
} from '@tabler/icons-react';
import { NewsCarousel } from '../components/carousel/news.carousel';
import '../styles/homepage.css';
import {useNavigate} from "react-router-dom";

// Hero Section Component
function HeroSection() {
    return (
        <Box
            sx={(theme) => ({
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
                color: 'white',
                padding: '4rem 0',
                position: 'relative',
                overflow: 'hidden',
                maxHeight: '120px',
            })}
        >
            <Container size="xl">
                <Grid align="center" gutter="xl">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack spacing="lg" className="hero-content">
                            <Title order={1} size="3rem" weight={700}>
                                Your Ultimate Football Companion
                            </Title>
                            <Text size="xl" opacity={0.9}>
                                Live scores, personalised statistics, and ticket bookings all in one place.
                            </Text>
                            <Group spacing="md">
                                <Button
                                    size="lg"
                                    variant="white"
                                    color="blue"
                                    className="btn-primary"
                                    sx={{ color: '#1e3a8a' }}
                                >
                                    Download App
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    color="white"
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                            color: '#1e3a8a'
                                        }
                                    }}
                                >
                                    Explore Features
                                </Button>
                            </Group>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Center>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80"
                                alt="Football action"
                                className="hero-image"
                                sx={{
                                    borderRadius: '1rem',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                    maxWidth: '100%',
                                    height: '120px'
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
    const navigate = useNavigate();

    const matches = [
        {
            id: 1,
            homeTeam: 'Arsenal',
            awayTeam: 'Chelsea',
            homeScore: 2,
            awayScore: 1,
            status: 'LIVE',
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
            homeScore: null,
            awayScore: null,
            status: 'UPCOMING',
            statusColor: 'green',
            league: 'La Liga',
            time: 'Tomorrow',
            homeLogo: 'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=120&q=80',
            awayLogo: 'https://images.unsplash.com/photo-1599245895529-3c0992ab3c91?auto=format&w=120&q=80',
        },
        {
            id: 3,
            homeTeam: 'Juventus',
            awayTeam: 'Inter',
            homeScore: 1,
            awayScore: 3,
            status: 'FINISHED',
            statusColor: 'gray',
            league: 'Serie A',
            time: 'FT',
            homeLogo: 'https://images.unsplash.com/photo-1605973174423-47046f81ec9b?auto=format&w=120&q=80',
            awayLogo: 'https://images.unsplash.com/photo-1616941360635-7d51b6607429?auto=format&w=120&q=80',
        }
    ];

    return (
        <Box py="4rem" bg="white">
            <Container size="xl">
                <Group position="apart" mb="2rem">
                    <Title order={2} size="2.5rem" weight={700}>
                        Live Matches
                    </Title>
                    <Button variant="subtle" rightIcon={<IconChevronRight size={16} onClick={() => navigate('/matches')}/>}>
                        View All
                    </Button>
                </Group>

                <Grid gutter="xl">
                    {matches.map((match) => (
                        <Grid.Col key={match.id} span={{ base: 12, md: 4 }}>
                            <Card
                                shadow="md"
                                padding="xl"
                                radius="md"
                                withBorder
                                className="match-card"
                            >
                                <Group position="apart" mb="md">
                                    <Badge color={match.statusColor} size="sm">
                                        {match.status}
                                    </Badge>
                                    <Text size="sm" color="dimmed">
                                        {match.league}
                                    </Text>
                                </Group>

                                <Group position="apart" align="center" mb="xl">
                                    <Stack align="center" spacing="xs">
                                        <Avatar
                                            src={match.homeLogo}
                                            size="xl"
                                            radius="md"
                                        />
                                        <Text weight={500}>{match.homeTeam}</Text>
                                    </Stack>

                                    <Stack align="center" spacing="xs">
                                        <Text size="2rem" weight={700}>
                                            {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : '- -'}
                                        </Text>
                                        <Text size="sm" color="dimmed">{match.time}</Text>
                                    </Stack>

                                    <Stack align="center" spacing="xs">
                                        <Avatar
                                            src={match.awayLogo}
                                            size="xl"
                                            radius="md"
                                        />
                                        <Text weight={500}>{match.awayTeam}</Text>
                                    </Stack>
                                </Group>
                            </Card>
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
            image: 'https://images.unsplash.com/photo-1592206112774-73d688f6e46e?auto=format&w=600&q=80'
        },
        {
            id: 3,
            title: 'Bellingham Set for Record Move to Real Madrid',
            excerpt: 'The English midfielder is reportedly close to completing a €120m transfer from Dortmund this summer.',
            category: 'Transfer News',
            time: 'Yesterday',
            image: 'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=600&q=80'
        }
    ];

    return (
        <Box py="4rem" bg="gray.0">
            <Container size="xl">
                <Group position="apart" mb="2rem">
                    <Title order={2} size="2.5rem" weight={700}>
                        Latest News
                    </Title>
                    <Button variant="subtle" rightIcon={<IconChevronRight size={16} />}>
                        View All
                    </Button>
                </Group>

                <Grid gutter="xl">
                    {news.map((article) => (
                        <Grid.Col key={article.id} span={{ base: 12, md: 4 }}>
                            <Card
                                shadow="md"
                                radius="md"
                                withBorder
                                className="news-card"
                            >
                                <Box
                                    component="img"
                                    src={article.image}
                                    alt={article.title}
                                    sx={{
                                        width: '100%',
                                        height: '12rem',
                                        objectFit: 'cover',
                                        borderRadius: '0.5rem 0.5rem 0 0'
                                    }}
                                />
                                <Stack spacing="md" p="xl">
                                    <Group spacing="xs">
                                        <Text size="sm" color="dimmed">{article.category}</Text>
                                        <Text size="sm" color="dimmed">•</Text>
                                        <Text size="sm" color="dimmed">{article.time}</Text>
                                    </Group>
                                    <Title order={3} size="lg" weight={600}>
                                        {article.title}
                                    </Title>
                                    <Text color="dimmed" lineClamp={3}>
                                        {article.excerpt}
                                    </Text>
                                    <Button
                                        variant="subtle"
                                        rightIcon={<IconArrowRight size={16} />}
                                        color="blue"
                                    >
                                        Read More
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
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
        <Box py="4rem" bg="white">
            <Container size="xl">
                <Title order={2} size="2.5rem" weight={700} ta="center" mb="3rem">
                    Why Choose I Watch Football?
                </Title>

                <Grid gutter="xl">
                    {features.map((feature, index) => (
                        <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                            <Stack align="center" spacing="md" p="xl">
                                <Box
                                    className="feature-icon"
                                    sx={(theme) => ({
                                        backgroundColor: theme.colors.blue[0],
                                        borderRadius: '50%',
                                        width: '4rem',
                                        height: '4rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    })}
                                >
                                    <feature.icon size={32} color="#1e40af" />
                                </Box>
                                <Title order={3} size="xl" weight={600} ta="center">
                                    {feature.title}
                                </Title>
                                <Text color="dimmed" ta="center">
                                    {feature.description}
                                </Text>
                            </Stack>
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
            <HeroSection />
            <LiveMatchesSection />
            <LatestNewsSection />
            <FeaturesSection />
        </>
    );
}
