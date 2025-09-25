import {ActionIcon, AppShell, Box, Button, Container, Divider, Grid, Group, Stack, Text, TextInput, Title} from '@mantine/core';
import {
    IconApple,
    IconBrandFacebook,
    IconBrandGooglePlay,
    IconBrandInstagram,
    IconBrandTwitter,
    IconBrandYoutube,
    IconSend,
    IconTrophy
} from '@tabler/icons-react';
import React from "react";

// CTA Section Component
function CTASection() {
    return (
        <Box
            sx={(theme) => ({
                backgroundColor: theme.colors.blue[6],
                color: 'white',
                padding: '4rem 0'
            })}
        >
            <Container size="xl">
                <Stack align="center" spacing="xl">
                    <Title order={2} size="2.5rem" weight={700} ta="center">
                        Never Miss a Match Again
                    </Title>
                    <Text size="xl" ta="center" maw="32rem">
                        Download I Watch Football now and stay updated with all the football action around the world.
                    </Text>
                    <Group spacing="md">
                        <Button
                            size="lg"
                            variant="white"
                            color="blue"
                            leftIcon={<IconApple size={20} />}
                            sx={{ color: '#1e40af' }}
                        >
                            App Store
                        </Button>
                        <Button
                            size="lg"
                            variant="white"
                            color="blue"
                            leftIcon={<IconBrandGooglePlay size={20} />}
                            sx={{ color: '#1e40af' }}
                        >
                            Google Play
                        </Button>
                    </Group>
                </Stack>
            </Container>
        </Box>
    );
}

// Enhanced Footer Component
function EnhancedFooter() {
    return (
        <Box
            sx={(theme) => ({
                backgroundColor: theme.colors.dark[9],
                color: 'white',
                padding: '3rem 0'
            })}
        >
            <Container size="xl">
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Stack spacing="md">
                            <Group spacing="xs">
                                <IconTrophy color="#60a5fa" size={24} />
                                <Text size="xl" weight={700}>I Watch Football</Text>
                            </Group>
                            <Text color="dimmed">
                                Your ultimate football companion for scores, news and tickets.
                            </Text>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Stack spacing="md">
                            <Title order={4} weight={600}>Quick Links</Title>
                            <Stack spacing="xs">
                                {['Home', 'Matches', 'News', 'Tickets'].map((link) => (
                                    <Text key={link} color="dimmed" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                                        {link}
                                    </Text>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Stack spacing="md">
                            <Title order={4} weight={600}>Leagues</Title>
                            <Stack spacing="xs">
                                {['Premier League', 'La Liga', 'Bundesliga', 'Serie A'].map((league) => (
                                    <Text key={league} color="dimmed" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                                        {league}
                                    </Text>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Stack spacing="md">
                            <Title order={4} weight={600}>Connect</Title>
                            <Group spacing="md">
                                <ActionIcon variant="subtle" color="gray">
                                    <IconBrandFacebook size={20} />
                                </ActionIcon>
                                <ActionIcon variant="subtle" color="gray">
                                    <IconBrandTwitter size={20} />
                                </ActionIcon>
                                <ActionIcon variant="subtle" color="gray">
                                    <IconBrandInstagram size={20} />
                                </ActionIcon>
                                <ActionIcon variant="subtle" color="gray">
                                    <IconBrandYoutube size={20} />
                                </ActionIcon>
                            </Group>
                            <Text color="dimmed" size="sm">Subscribe to our newsletter</Text>
                            <Group spacing="xs">
                                <TextInput
                                    placeholder="Your email"
                                    sx={{ flex: 1 }}
                                    styles={{
                                        input: {
                                            backgroundColor: '#374151',
                                            border: 'none',
                                            color: 'white',
                                            '&::placeholder': { color: '#9ca3af' }
                                        }
                                    }}
                                />
                                <ActionIcon color="blue" variant="filled">
                                    <IconSend size={16} />
                                </ActionIcon>
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>

                <Divider my="xl" color="dark.6" />

                <Text color="dimmed" ta="center">
                    © 2023 I Watch Football. All rights reserved.
                </Text>
            </Container>
        </Box>
    );
}


export function Footer() {
    return(
        <AppShell.Footer>
            <CTASection />
            <EnhancedFooter />
        </AppShell.Footer>
    )
}