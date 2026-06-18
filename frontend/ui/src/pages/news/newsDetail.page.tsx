import React from 'react';
import {
    Box,
    Container,
    Group,
    Stack,
    Text,
    Button,
    Divider,
    Skeleton,
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import { IconClock, IconExternalLink, IconArrowLeft } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { usePageTransition } from '../../hooks/usePageTransition';
import { ModernBody, ModernH1, ModernH2 } from '../../components/modern';
import { useGetOneNewsArticle } from '@iWatchFootball/clients/controllers/news-article';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=1200&q=80';

export function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { navigateWithTransition } = usePageTransition();

    const { data: article, isLoading } = useGetOneNewsArticle(Number(id), {
        query: {
            enabled: !!id && !isNaN(Number(id)),
            queryKey: [`/newsArticle/${id}`],
        },
    });

    const backButton = (
        <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigateWithTransition('/news')}
            style={{ alignSelf: 'flex-start', color: 'var(--modern-lime)' }}
        >
            Back to News
        </Button>
    );

    if (isLoading) {
        return (
            <Container size="md" py="xl">
                <Stack gap="xl">
                    {backButton}
                    <Stack gap="md">
                        <Skeleton height={12} width="30%" />
                        <Skeleton height={36} />
                        <Skeleton height={36} width="70%" />
                        <Skeleton height={12} width="40%" />
                    </Stack>
                    <Skeleton height={400} radius="md" />
                    <Stack gap="sm">
                        <Skeleton height={14} />
                        <Skeleton height={14} />
                        <Skeleton height={14} width="80%" />
                    </Stack>
                </Stack>
            </Container>
        );
    }

    if (!article) {
        return (
            <Container size="md" py="xl">
                <Stack gap="md">
                    <Text size="xl" fw={600}>Article not found</Text>
                    <Button
                        variant="outline"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={() => navigateWithTransition('/news')}
                    >
                        Back to News
                    </Button>
                </Stack>
            </Container>
        );
    }

    return (
        <Container size="md" py="xl">
            <Stack gap="xl">
                {backButton}

                <Stack gap="md">
                    {article.category && (
                        <Text size="sm" c="var(--modern-lime)" fw={600} style={{ textTransform: 'uppercase' }}>
                            {article.category}
                        </Text>
                    )}
                    <ModernH1>{article.title}</ModernH1>
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">{article.source}</Text>
                        {article.author && (
                            <>
                                <Text size="sm" c="dimmed">•</Text>
                                <Text size="sm" c="dimmed">{article.author}</Text>
                            </>
                        )}
                        <Text size="sm" c="dimmed">•</Text>
                        <Group gap={4}>
                            <IconClock size={14} color="var(--modern-gray)" />
                            <Text size="sm" c="dimmed">
                                {dayjs(article.publishedAt).format('D MMMM YYYY, HH:mm')}
                            </Text>
                        </Group>
                    </Group>
                </Stack>

                <Box
                    component="img"
                    src={article.imageUrl || FALLBACK_IMAGE}
                    alt={article.title}
                    style={{
                        width: '100%',
                        maxHeight: '500px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                    }}
                />

                <Divider />

                <Stack gap="lg">
                    <ModernBody style={{ fontSize: '1.125rem', lineHeight: 1.8 }}>
                        {article.summary}
                    </ModernBody>

                    {article.url && (
                        <Button
                            component="a"
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            rightSection={<IconExternalLink size={16} />}
                            variant="outline"
                            style={{
                                borderColor: 'var(--modern-lime)',
                                color: 'var(--modern-lime)',
                                alignSelf: 'flex-start',
                            }}
                        >
                            Read Full Article on {article.source}
                        </Button>
                    )}
                </Stack>

                <Divider />

                <Stack gap="md">
                    <ModernH2>Related Articles</ModernH2>
                    <Text c="dimmed">More articles coming soon...</Text>
                </Stack>
            </Stack>
        </Container>
    );
}
