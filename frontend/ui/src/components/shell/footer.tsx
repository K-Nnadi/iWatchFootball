import {Box, Container, Divider, Grid, Group, Stack, Text, Title, Anchor, useMantineColorScheme} from '@mantine/core';
import {
    IconTrophy,
    IconMail,
    IconPhone
} from '@tabler/icons-react';
import React from "react";
import { usePageTransition } from "../../hooks/usePageTransition";
import { useTranslation } from "../../i18n";
import classes from './styles/footer.module.css';


// OneFootball Style Footer


export function Footer() {
    const { navigateWithTransition } = usePageTransition();
    const { colorScheme } = useMantineColorScheme();
    const { t } = useTranslation();
    const isDark = colorScheme === 'dark';

    const quickLinks = [
        { label: t('footer.allMatches'), path: '/matches' },
        { label: t('footer.allTeams'), path: '/teams' },
        { label: t('footer.allCompetitions'), path: '/competitions' },
        { label: t('footer.tickets'), path: '/tickets' }
    ];

    const aboutLinks = [
        { label: t('footer.contactUs'), path: '/contact' },
        { label: t('footer.help'), path: '/help' }
    ];

    const legalLinks = [
        { label: t('footer.privacyPolicy'), path: '/privacy', external: false },
        { label: t('footer.terms'), path: '/terms', external: false },
        { label: t('footer.cookiePolicy'), path: '/cookies', external: false },
        { label: t('footer.licenses'), path: '/licenses', external: false }
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
                                    <Text size="sm" className={classes.contactInfo}>iwatchfootball@gmail.com</Text>
                                </Group>
                                <Group gap="xs">
                                    <IconPhone size={16} color="var(--modern-text-secondary)" />
                                    <Text size="sm" className={classes.contactInfo}>+447912345678</Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Quick Links */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" className={classes.sectionTitle}>
                                {t('footer.quickLinks')}
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
                                {t('footer.about')}
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
                                {t('footer.legal')}
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
                            {t('footer.copyright', { year: new Date().getFullYear() })}
                        </Text>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}