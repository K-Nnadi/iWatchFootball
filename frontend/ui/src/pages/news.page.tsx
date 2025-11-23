import React, { useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Group,
    Stack,
    Text,
    Select,
    Pagination,
} from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import { ModernBody, ModernButton, ModernCard, ModernH2, ModernH3 } from '../components/modern';

// Mock news data - replace with API call later
const mockNews = [
    {
        id: 1,
        title: 'Guardiola Signs New 3-Year Contract with Man City',
        excerpt: 'The Spanish manager has committed his future to the club until 2026 after winning four Premier League titles.',
        category: 'Premier League',
        source: 'BBC Sport',
        time: '2 hours ago',
        image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 2,
        title: '2026 World Cup Stadiums Revealed Across USA, Canada & Mexico',
        excerpt: 'FIFA has announced the 16 host cities for the expanded 48-team tournament in North America.',
        category: 'World Cup',
        source: 'ESPN',
        time: '5 hours ago',
        image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 3,
        title: 'Bellingham Set for Record Move to Real Madrid',
        excerpt: 'The English midfielder is reportedly close to completing a €120m transfer from Dortmund this summer.',
        category: 'Transfer News',
        source: 'The Athletic',
        time: 'Yesterday',
        image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 4,
        title: 'How Thomas Tuchel plans to turn England headache into World Cup advantage',
        excerpt: 'The German manager has been analyzing England\'s recent performances and believes he has found key weaknesses to exploit.',
        category: 'International',
        source: 'The Independent',
        time: '7 hours ago',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=1200&q=80',
        publishedAt: new Date(),
    },
    {
        id: 5,
        title: 'Mauricio Pochettino hails MLS decision to make calendar change',
        source: 'OneFootball',
        time: 'about an hour ago',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 6,
        title: '5 spicy fixtures you must watch this weekend',
        excerpt: 'A look at the most exciting matches coming up this weekend across Europe\'s top leagues.',
        category: 'General',
        source: 'The Football Faithful',
        time: '13 hours ago',
        image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 7,
        title: 'Croatia win to secure 2026 WC spot; Germany victorious & Netherlands draw',
        excerpt: 'European qualifiers wrap up with several teams booking their tickets to the 2026 World Cup.',
        category: 'International',
        source: 'OneFootball',
        time: '6 hours ago',
        image: 'https://images.unsplash.com/photo-1592206112774-73d688f6e46e?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 8,
        title: 'Chelsea dealt new injury worry ahead of Barcelona and Arsenal fixtures',
        excerpt: 'The Blues face a selection headache as key players face fitness tests before crucial matches.',
        category: 'Premier League',
        source: 'Evening Standard',
        time: '3 hours ago',
        image: 'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 9,
        title: 'Liverpool\'s Title Hopes Dented by Draw at Anfield',
        excerpt: 'The Reds dropped two crucial points in their pursuit of the Premier League title.',
        category: 'Premier League',
        source: 'Sky Sports',
        time: '1 hour ago',
        image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 10,
        title: 'Mbappé Announces Decision on Future',
        excerpt: 'The French superstar has finally revealed his plans for next season after months of speculation.',
        category: 'Transfer News',
        source: 'L\'Equipe',
        time: '4 hours ago',
        image: 'https://images.unsplash.com/photo-1592206112774-73d688f6e46e?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 11,
        title: 'Barcelona\'s Financial Recovery Plan Approved',
        excerpt: 'La Liga has given the green light to Barcelona\'s financial restructuring proposal.',
        category: 'La Liga',
        source: 'Marca',
        time: '8 hours ago',
        image: 'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
    {
        id: 12,
        title: 'Bayern Munich Appoint New Sporting Director',
        excerpt: 'The German champions have filled a key position in their management structure.',
        category: 'Bundesliga',
        source: 'Kicker',
        time: '12 hours ago',
        image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80',
        publishedAt: new Date(),
    },
];

const categories = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Transfer News', 'International', 'World Cup'];

export function NewsPage() {
    const { navigateWithTransition } = usePageTransition();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 12;

    const filteredNews = selectedCategory === 'All' 
        ? mockNews 
        : mockNews.filter(article => article.category === selectedCategory);

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice(
        (activePage - 1) * itemsPerPage,
        activePage * itemsPerPage
    );

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between" align="center">
                    <ModernH2>
                        Latest <span style={{color: 'var(--modern-lime)'}}>News</span>
                    </ModernH2>
                    <Select
                        placeholder="Filter by category"
                        data={categories}
                        value={selectedCategory}
                        onChange={(value) => {
                            setSelectedCategory(value || 'All');
                            setActivePage(1);
                        }}
                        style={{ width: 200 }}
                    />
                </Group>

                {/* News Grid */}
                <Grid gutter="lg">
                    {paginatedNews.map((article) => (
                        <Grid.Col key={article.id} span={{ base: 12, sm: 6, md: 4 }}>
                            <Box
                                onClick={() => navigateWithTransition(`/news/${article.id}`)}
                                style={{
                                    cursor: 'pointer',
                                    height: '100%',
                                }}
                            >
                                <ModernCard hover style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Stack gap="md" style={{ flex: 1 }}>
                                        <Box
                                            component="img"
                                            src={article.image}
                                            alt={article.title}
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                            }}
                                        />
                                        <Stack gap="xs" style={{ flex: 1 }}>
                                            {article.category && (
                                                <Text size="xs" c="var(--modern-lime)" fw={600} style={{ textTransform: 'uppercase' }}>
                                                    {article.category}
                                                </Text>
                                            )}
                                            <ModernH3 style={{ fontSize: '1.1rem', lineHeight: 1.4, flex: 1 }}>
                                                {article.title}
                                            </ModernH3>
                                            {article.excerpt && (
                                                <ModernBody style={{ fontSize: '0.9rem', flex: 1 }}>
                                                    {article.excerpt}
                                                </ModernBody>
                                            )}
                                            <Group gap="xs" mt="auto">
                                                <Text size="xs" c="dimmed">{article.source}</Text>
                                                <Text size="xs" c="dimmed">•</Text>
                                                <Group gap={4}>
                                                    <IconClock size={12} color="var(--modern-gray)" />
                                                    <Text size="xs" c="dimmed">{article.time}</Text>
                                                </Group>
                                            </Group>
                                        </Stack>
                                    </Stack>
                                </ModernCard>
                            </Box>
                        </Grid.Col>
                    ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Group justify="center" mt="xl">
                        <Pagination
                            total={totalPages}
                            value={activePage}
                            onChange={setActivePage}
                            color="lime"
                            size="md"
                        />
                    </Group>
                )}
            </Stack>
        </Container>
    );
}


