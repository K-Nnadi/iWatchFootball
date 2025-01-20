import React from 'react';
import { Grid, Skeleton, Container, Title, Text, Paper, Space } from '@mantine/core';
import { NewsCarousel } from '../components/carousel/news.carousel';

const skeletonStyle = { height: 140, borderRadius: 'md' };

export function HomePage() {
    return (
        <Container my="md" w="100%" size="xl">
            <Title order={1} mb="xs">
                Welcome to I Watch Football
            </Title>
            <Text color="dimmed" mb="lg">
                Stay updated with the latest news, upcoming matches, and transfer rumors from top competitions around the world.
            </Text>

            {/* Main news carousel */}
            <Paper shadow="sm" radius="md" p="md" mb="lg">
                <Title order={3} mb="xs">
                    Latest Headlines
                </Title>
                <Text color="dimmed" size="sm" mb="md">
                    Breaking news and trending stories in world football
                </Text>
                <NewsCarousel />
            </Paper>

            <Space h="xl" />

            {/* Grid with thematic placeholders */}
            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, xs: 4 }}>
                    <Title order={4} mb="xs">
                        Upcoming Matches
                    </Title>
                    <Skeleton {...skeletonStyle} animate />
                </Grid.Col>

                <Grid.Col span={{ base: 12, xs: 8 }}>
                    <Title order={4} mb="xs">
                        League Table
                    </Title>
                    <Skeleton {...skeletonStyle} animate />
                </Grid.Col>

                <Grid.Col span={12}>
                    {/* Another carousel or content could go here if desired */}
                </Grid.Col>

                <Grid.Col span={{ base: 12, xs: 8 }}>
                    <Title order={4} mb="xs">
                        Transfer Rumors
                    </Title>
                    <Skeleton {...skeletonStyle} animate />
                </Grid.Col>

                <Grid.Col span={{ base: 12, xs: 4 }}>
                    <Title order={4} mb="xs">
                        Featured Interviews
                    </Title>
                    <Skeleton {...skeletonStyle} animate />
                </Grid.Col>

                <Grid.Col span={{ base: 12, xs: 3 }}>
                    <Title order={5} mb="xs">
                        Team Spotlight
                    </Title>
                    <Skeleton {...skeletonStyle} animate />
                </Grid.Col>

                <Grid.Col span={{ base: 12, xs: 3 }}>
                    <Title order={5} mb="xs">
                        Player of the Week
                    </Title>
                    <Skeleton {...skeletonStyle} animate />
                </Grid.Col>

                <Grid.Col span={{ base: 12, xs: 6 }}>
                    <Title order={4} mb="xs">
                        Fan Poll
                    </Title>
                    <Skeleton {...skeletonStyle} animate />
                </Grid.Col>
            </Grid>
        </Container>
    );
}
