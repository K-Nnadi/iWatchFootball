import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Group,
    Stack,
    Text,
    Button,
    Divider,
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import { IconBookmark, IconClock, IconExternalLink, IconArrowLeft } from '@tabler/icons-react';
import { usePageTransition } from '../../hooks/usePageTransition';
import { ModernBody, ModernH1, ModernH2 } from '../../components/modern';

// Mock news data - replace with API call later
const mockNewsArticles: Record<number, any> = {
    1: {
        id: 1,
        title: 'How Thomas Tuchel plans to turn England headache into World Cup advantage',
        summary: 'The German manager has been analyzing England\'s recent performances and believes he has found key weaknesses to exploit in the upcoming World Cup campaign. Tuchel\'s tactical acumen and attention to detail have been evident throughout his career, and he sees this as an opportunity to showcase his strategic thinking on the world stage.',
        fullContent: `The German manager has been analyzing England's recent performances and believes he has found key weaknesses to exploit in the upcoming World Cup campaign. Tuchel's tactical acumen and attention to detail have been evident throughout his career, and he sees this as an opportunity to showcase his strategic thinking on the world stage.

        In a recent interview, Tuchel revealed that he has been studying England's patterns of play, particularly focusing on their defensive transitions and set-piece vulnerabilities. "Every team has areas where they can be exploited," Tuchel explained. "The key is identifying these moments and having the right players to capitalize on them."

        The former Chelsea and Bayern Munich manager has been working closely with his coaching staff to develop specific game plans that target England's perceived weaknesses. His approach involves detailed video analysis and statistical breakdowns of England's recent matches.

        "We're not just looking at the obvious things," Tuchel added. "We're examining their pressing triggers, their spacing in different phases of play, and how they react under pressure. These small details can make the difference in a tournament setting."

        England manager Gareth Southgate has acknowledged the challenge ahead, noting that facing a tactician of Tuchel's caliber requires thorough preparation. "We know we'll be analyzed in depth," Southgate said. "That's part of modern football. We need to be adaptable and ready for whatever approach they take."

        The World Cup match between Germany and England is expected to be one of the most tactically intriguing encounters of the tournament, with both managers known for their meticulous preparation and strategic thinking.`,
        source: 'The Independent',
        author: 'John Smith',
        time: '7 hours ago',
        publishedAt: new Date('2025-01-24T10:00:00Z'),
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=1200&q=80',
        category: 'International',
        url: 'https://www.independent.co.uk/sport/football/thomas-tuchel-england-world-cup',
    },
    2: {
        id: 2,
        title: 'Mauricio Pochettino hails MLS decision to make calendar change',
        source: 'OneFootball',
        time: 'about an hour ago',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=600&q=80',
        publishedAt: new Date(),
        category: 'General',
        url: 'https://onefootball.com/en/news/mauricio-pochettino-mls',
    },
    3: {
        id: 3,
        title: '5 spicy fixtures you must watch this weekend',
        source: 'The Football Faithful',
        time: '13 hours ago',
        image: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?auto=format&w=600&q=80',
        publishedAt: new Date(),
        category: 'General',
        url: 'https://thefootballfaithful.com/weekend-fixtures',
    },
    4: {
        id: 4,
        title: 'Croatia win to secure 2026 WC spot; Germany victorious & Netherlands draw',
        source: 'OneFootball',
        time: '6 hours ago',
        image: 'https://images.unsplash.com/photo-1592206112774-73d688f6e46e?auto=format&w=600&q=80',
        publishedAt: new Date(),
        category: 'International',
        url: 'https://onefootball.com/en/news/world-cup-qualifiers',
    },
    5: {
        id: 5,
        title: 'Chelsea dealt new injury worry ahead of Barcelona and Arsenal fixtures',
        source: 'Evening Standard',
        time: '3 hours ago',
        image: 'https://images.unsplash.com/photo-1594450890928-98d96ebf2ad0?auto=format&w=600&q=80',
        publishedAt: new Date(),
        category: 'Premier League',
        url: 'https://www.standard.co.uk/sport/football/chelsea-injury',
    },
};

export function NewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { navigateWithTransition } = usePageTransition();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                const foundArticle = mockNewsArticles[parseInt(id)];
                setArticle(foundArticle);
                setLoading(false);
            }, 300);
        }
    }, [id]);

    if (loading) {
        return (
            <Container size="md" py="xl">
                <Text>Loading...</Text>
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

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <Container size="md" py="xl">
            <Stack gap="xl">
                {/* Back Button */}
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => navigateWithTransition('/news')}
                    style={{
                        alignSelf: 'flex-start',
                        color: 'var(--modern-lime)',
                    }}
                >
                    Back to News
                </Button>

                {/* Article Header */}
                <Stack gap="md">
                    {article.category && (
                        <Text size="sm" c="var(--modern-lime)" fw={600} style={{ textTransform: 'uppercase' }}>
                            {article.category}
                        </Text>
                    )}
                    <ModernH1>{article.title}</ModernH1>
                    <Group gap="md">
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
                                    {article.publishedAt ? formatDate(article.publishedAt) : article.time}
                                </Text>
                            </Group>
                        </Group>
                        <IconBookmark 
                            size={20} 
                            color="var(--modern-lime)" 
                            style={{ cursor: 'pointer', marginLeft: 'auto' }}
                            onClick={() => {
                                // Handle bookmark
                            }}
                        />
                    </Group>
                </Stack>

                {/* Featured Image */}
                {article.image && (
                    <Box
                        component="img"
                        src={article.image}
                        alt={article.title}
                        style={{
                            width: '100%',
                            maxHeight: '500px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                        }}
                    />
                )}

                <Divider />

                {/* Article Content */}
                <Stack gap="lg">
                    {article.fullContent ? (
                        <ModernBody style={{ fontSize: '1.125rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                            {article.fullContent}
                        </ModernBody>
                    ) : (
                        <ModernBody style={{ fontSize: '1.125rem', lineHeight: 1.8 }}>
                            {article.summary}
                        </ModernBody>
                    )}

                    {/* Read More Button */}
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

                {/* Related Articles Section */}
                <Stack gap="md">
                    <ModernH2>Related Articles</ModernH2>
                    <Text c="dimmed">More articles coming soon...</Text>
                </Stack>
            </Stack>
        </Container>
    );
}

