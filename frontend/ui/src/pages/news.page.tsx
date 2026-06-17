import React, { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Grid,
    Group,
    Stack,
    Text,
    Select,
    Pagination,
    Skeleton,
} from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { usePageTransition } from '../hooks/usePageTransition';
import { ModernBody, ModernButton, ModernCard, ModernH2, ModernH3 } from '../components/modern';
import { useGetAllNewsArticle } from '@iWatchFootball/clients/controllers/news-article';

dayjs.extend(relativeTime);

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=600&q=80';
const ITEMS_PER_PAGE = 12;
const categories = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Champions League', 'Transfer News', 'International', 'World Cup', 'General'];

function NewsCardSkeleton() {
    return (
        <ModernCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack gap="md" style={{ flex: 1 }}>
                <Skeleton height={200} radius="xs" />
                <Stack gap="xs" style={{ flex: 1 }}>
                    <Skeleton height={10} width="40%" />
                    <Skeleton height={16} />
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={12} width="60%" mt="auto" />
                </Stack>
            </Stack>
        </ModernCard>
    );
}

export function NewsPage() {
    const { navigateWithTransition } = usePageTransition();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [activePage, setActivePage] = useState(1);

    const { data: allArticles, isLoading } = useGetAllNewsArticle();

    const sortedArticles = useMemo(() => {
        if (!allArticles) return [];
        return [...allArticles].sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        );
    }, [allArticles]);

    const filteredArticles = useMemo(() => {
        if (selectedCategory === 'All') return sortedArticles;
        return sortedArticles.filter((a) => a.category === selectedCategory);
    }, [sortedArticles, selectedCategory]);

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const paginatedArticles = filteredArticles.slice(
        (activePage - 1) * ITEMS_PER_PAGE,
        activePage * ITEMS_PER_PAGE,
    );

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                <Group justify="space-between" align="center">
                    <ModernH2>
                        Latest <span style={{ color: 'var(--modern-lime)' }}>News</span>
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

                <Grid gutter="lg">
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                                  <NewsCardSkeleton />
                              </Grid.Col>
                          ))
                        : paginatedArticles.map((article) => (
                              <Grid.Col key={article.id} span={{ base: 12, sm: 6, md: 4 }}>
                                  <Box
                                      onClick={() => navigateWithTransition(`/news/${article.id}`)}
                                      style={{ cursor: 'pointer', height: '100%' }}
                                  >
                                      <ModernCard hover style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                          <Stack gap="md" style={{ flex: 1 }}>
                                              <Box
                                                  component="img"
                                                  src={article.imageUrl || FALLBACK_IMAGE}
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
                                                  {article.summary && (
                                                      <ModernBody style={{ fontSize: '0.9rem', flex: 1 }}>
                                                          {article.summary}
                                                      </ModernBody>
                                                  )}
                                                  <Group gap="xs" mt="auto">
                                                      <Text size="xs" c="dimmed">{article.source}</Text>
                                                      <Text size="xs" c="dimmed">•</Text>
                                                      <Group gap={4}>
                                                          <IconClock size={12} color="var(--modern-gray)" />
                                                          <Text size="xs" c="dimmed">
                                                              {dayjs(article.publishedAt).fromNow()}
                                                          </Text>
                                                      </Group>
                                                  </Group>
                                              </Stack>
                                          </Stack>
                                      </ModernCard>
                                  </Box>
                              </Grid.Col>
                          ))}

                    {!isLoading && paginatedArticles.length === 0 && (
                        <Grid.Col span={12}>
                            <Stack align="center" py="xl" gap="md">
                                <Text c="dimmed" size="lg">No articles found.</Text>
                                {selectedCategory !== 'All' && (
                                    <ModernButton variant="secondary" size="sm" onClick={() => setSelectedCategory('All')}>
                                        Clear filter
                                    </ModernButton>
                                )}
                            </Stack>
                        </Grid.Col>
                    )}
                </Grid>

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
