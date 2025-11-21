import {ActionIcon, Box, Button, Container, Divider, Grid, Group, Stack, Text, Title, Anchor, useMantineColorScheme} from '@mantine/core';
import {
    IconApple,
    IconBrandFacebook,
    IconBrandGooglePlay,
    IconBrandInstagram,
    IconBrandTwitter,
    IconBrandYoutube,
    IconTrophy,
    IconBrandTiktok,
    IconMail,
    IconPhone
} from '@tabler/icons-react';
import React from "react";
import { usePageTransition } from "../../hooks/usePageTransition";


// OneFootball Style Footer


export function Footer() {
    const { navigateWithTransition } = usePageTransition();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const quickLinks = [
        { label: 'All matches', path: '/matches' },
        { label: 'All teams', path: '/teams' },
        { label: 'All competitions', path: '/competitions' },
        { label: 'Tickets', path: '/tickets' }
    ];

    const aboutLinks = [
        { label: 'Contact Us', path: '/contact' },
        { label: 'Help', path: '/help' }
    ];

    const legalLinks = [
        { label: 'Privacy Policy', path: '/privacy', external: false },
        { label: 'Terms and Conditions', path: '/terms', external: false },
        { label: 'Cookie Policy', path: '/cookies', external: false },
        { label: 'Licenses', path: '/licenses', external: false }
    ];

    const moreLinks = [
        { label: 'App Store', path: '/app-store', external: true },
        { label: 'Google Play', path: '/google-play', external: true },
        { label: 'Merch', path: '/merch', external: false },
    ];

    return(
        <Box
            style={{
                backgroundColor: 'var(--modern-bg-primary)',
                color: 'var(--modern-text-primary)',
                padding: '3rem 0 1rem',
                borderTop: `1px solid var(--modern-border-color)`
            }}
        >
            <Container size="xl">
                {/* Main Footer Content */}
                <Grid gutter="xl" mb="xl">
                    {/* Brand Section */}
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Stack gap="md">
                            <Group gap="xs">
                                <IconTrophy color="var(--modern-lime)" size={28} />
                                <Text size="xl" fw={700} c="var(--modern-text-primary)">I Watch Football</Text>
                            </Group>
                            <Text c="var(--modern-text-secondary)" size="sm">
                                Your ultimate football companion for live scores, news, statistics, and ticket bookings.
                            </Text>
                            <Stack gap="xs">
                                <Group gap="xs">
                                    <IconMail size={16} color="var(--modern-text-secondary)" />
                                    <Text size="sm" c="var(--modern-text-secondary)">kenneth_nnadi@aol.co.uk</Text>
                                </Group>
                                <Group gap="xs">
                                    <IconPhone size={16} color="var(--modern-text-secondary)" />
                                    <Text size="sm" c="var(--modern-text-secondary)">+447931100353</Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Quick Links */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="var(--modern-text-primary)">
                                Quick Links
                            </Title>
                            <Stack gap="xs">
                                {quickLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        c="var(--modern-text-secondary)"
                                        size="sm"
                                        style={{
                                            cursor: 'pointer',
                                            textDecoration: 'none'
                                        }}
                                        onClick={() => navigateWithTransition(link.path)}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--modern-lime)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--modern-text-secondary)'; }}
                                    >
                                        {link.label}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>


                    {/* About Us */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="var(--modern-text-primary)">
                                About Us
                            </Title>
                            <Stack gap="xs">
                                {aboutLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        c="var(--modern-text-secondary)"
                                        size="sm"
                                        style={{
                                            cursor: 'pointer',
                                            textDecoration: 'none'
                                        }}
                                        onClick={() => navigateWithTransition(link.path)}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--modern-lime)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--modern-text-secondary)'; }}
                                    >
                                        {link.label}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>


                    {/* Legal */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="var(--modern-text-primary)">
                                Legal
                            </Title>
                            <Stack gap="xs">
                                {legalLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        c="var(--modern-text-secondary)"
                                        size="sm"
                                        style={{
                                            cursor: 'pointer',
                                            textDecoration: 'none'
                                        }}
                                        onClick={() => link.external ? window.open(link.path, '_blank') : navigateWithTransition(link.path)}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--modern-lime)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--modern-text-secondary)'; }}
                                    >
                                        {link.label}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* More I Watch Football */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="var(--modern-text-primary)">
                                More I Watch Football
                            </Title>
                            <Stack gap="xs">
                                {moreLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        c="var(--modern-text-secondary)"
                                        size="sm"
                                        style={{
                                            cursor: 'pointer',
                                            textDecoration: 'none'
                                        }}
                                        onClick={() => link.external ? window.open(link.path, '_blank') : navigateWithTransition(link.path)}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--modern-lime)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--modern-text-secondary)'; }}
                                    >
                                        {link.label}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>
                </Grid>

                <Divider color={isDark ? 'dark.6' : 'gray.3'} mb="xl" />

                {/* Bottom Section */}
                <Grid align="center">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Text c="var(--modern-text-secondary)" size="sm">
                            2025 I Watch Football
                        </Text>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}