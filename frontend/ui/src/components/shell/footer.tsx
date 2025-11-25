import {Box, Container, Divider, Grid, Group, Stack, Text, Title, Anchor, useMantineColorScheme} from '@mantine/core';
import {
    IconTrophy,
    IconMail,
    IconPhone
} from '@tabler/icons-react';
import React from "react";
import { usePageTransition } from "../../hooks/usePageTransition";
import classes from './styles/footer.module.css';


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
    ];

    return(
        <Box className={classes.footer}>
            <Container size="xl">
                {/* Main Footer Content */}
                <Grid gutter="xl" mb="xl">
                    {/* Brand Section */}
                    <Grid.Col span={{ base: 12, md: 3 }} className={classes.brandSection}>
                        <Stack gap="md">
                            <Group gap="xs">
                                <IconTrophy color="var(--modern-lime)" size={28} />
                                <Text size="xl" fw={700} className={classes.brandTitle}>I Watch Football</Text>
                            </Group>
                            <Text className={classes.brandDescription} size="sm">
                                Your ultimate football companion for live scores, news, statistics, and ticket bookings.
                            </Text>
                            <Stack gap="xs">
                                <Group gap="xs">
                                    <IconMail size={16} color="var(--modern-text-secondary)" />
                                    <Text size="sm" className={classes.contactInfo}>kenneth_nnadi@aol.co.uk</Text>
                                </Group>
                                <Group gap="xs">
                                    <IconPhone size={16} color="var(--modern-text-secondary)" />
                                    <Text size="sm" className={classes.contactInfo}>+447931100353</Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Quick Links */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" className={classes.sectionTitle}>
                                Quick Links
                            </Title>
                            <Stack gap="xs">
                                {quickLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        size="sm"
                                        className={classes.link}
                                        onClick={() => navigateWithTransition(link.path)}
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
                            <Title order={5} fw={600} size="sm" className={classes.sectionTitle}>
                                About Us
                            </Title>
                            <Stack gap="xs">
                                {aboutLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        size="sm"
                                        className={classes.link}
                                        onClick={() => navigateWithTransition(link.path)}
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
                            <Title order={5} fw={600} size="sm" className={classes.sectionTitle}>
                                Legal
                            </Title>
                            <Stack gap="xs">
                                {legalLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        size="sm"
                                        className={classes.link}
                                        onClick={() => link.external ? window.open(link.path, '_blank') : navigateWithTransition(link.path)}
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
                            <Title order={5} fw={600} size="sm" className={classes.sectionTitle}>
                                More I Watch Football
                            </Title>
                            <Stack gap="xs">
                                {moreLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        size="sm"
                                        className={classes.link}
                                        onClick={() => link.external ? window.open(link.path, '_blank') : navigateWithTransition(link.path)}
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
                        <Text className={classes.copyright} size="sm">
                            2025 I Watch Football
                        </Text>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}