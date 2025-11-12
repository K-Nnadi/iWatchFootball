import {ActionIcon, AppShell, Box, Button, Container, Divider, Grid, Group, Stack, Text, Title, Anchor, useMantineTheme} from '@mantine/core';
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

// CTA Section Component - OneFootball Style
function CTASection() {
    const theme = useMantineTheme();
    return (
        <Box
            style={{
                backgroundColor: theme.colors.blue[6],
                color: 'white',
                padding: '3rem 0',
                textAlign: 'center'
            }}
        >
            <Container size="xl">
                <Stack align="center" gap="lg">
                    <Title order={2} size="2rem" fw={700}>
                        Download I Watch Football
                    </Title>
                    <Text size="lg" maw="500px">
                        Stay connected with live scores, news, and tickets. Available on all platforms.
                    </Text>
                    <Group gap="md">
                        <Button
                            size="md"
                            variant="white"
                            color="blue"
                            leftSection={<IconApple size={18} />}
                            style={{ color: '#1e40af' }}
                        >
                            App Store
                        </Button>
                        <Button
                            size="md"
                            variant="white"
                            color="blue"
                            leftSection={<IconBrandGooglePlay size={18} />}
                            style={{ color: '#1e40af' }}
                        >
                            Google Play
                        </Button>
                    </Group>
                </Stack>
            </Container>
        </Box>
    );
}

// OneFootball Style Footer
function OneFootballStyleFooter() {
    const { navigateWithTransition } = usePageTransition();
    const theme = useMantineTheme();

    const quickLinks = [
        { label: 'All matches', path: '/matches' },
        { label: 'All teams', path: '/teams' },
        { label: 'All competitions', path: '/competitions' },
        { label: 'Tickets', path: '/tickets' }
    ];

    const leagues = [
        'Premier League',
        'La Liga', 
        'Bundesliga',
        'Serie A',
        'Ligue 1',
        'Champions League'
    ];

    const aboutLinks = [
        'Company',
        'Careers', 
        'Contact Us',
        'Help Center'
    ];

    const partnerLinks = [
        'Sales',
        'Partnerships',
        'Brand Solutions',
        'API Access'
    ];

    const legalLinks = [
        'Privacy Policy',
        'Terms and Conditions',
        'Cookie Policy',
        'Licenses'
    ];

    return (
        <Box
            style={{
                backgroundColor: theme.colors.dark[9],
                color: 'white',
                padding: '3rem 0 1rem'
            }}
        >
            <Container size="xl">
                {/* Main Footer Content */}
                <Grid gutter="xl" mb="xl">
                    {/* Brand Section */}
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Stack gap="md">
                            <Group gap="xs">
                                <IconTrophy color="#60a5fa" size={28} />
                                <Text size="xl" fw={700}>I Watch Football</Text>
                            </Group>
                            <Text color="dimmed" size="sm">
                                Your ultimate football companion for live scores, news, statistics, and ticket bookings.
                            </Text>
                            <Stack gap="xs">
                                <Group gap="xs">
                                    <IconMail size={16} color="#9ca3af" />
                                    <Text size="sm" color="dimmed">contact@iwatchfootball.com</Text>
                                </Group>
                                <Group gap="xs">
                                    <IconPhone size={16} color="#9ca3af" />
                                    <Text size="sm" color="dimmed">+1 (555) 123-4567</Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Quick Links */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="white">
                                Quick Links
                            </Title>
                            <Stack gap="xs">
                                {quickLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        color="dimmed"
                                        size="sm"
                                        style={{ 
                                            cursor: 'pointer', 
                                            textDecoration: 'none'
                                        }}
                                        onClick={() => navigateWithTransition(link.path)}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                                    >
                                        {link.label}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Leagues */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="white">
                                Leagues
                            </Title>
                            <Stack gap="xs">
                                {leagues.map((league) => (
                                    <Anchor
                                        key={league}
                                        color="dimmed"
                                        size="sm"
                                        style={{ 
                                            cursor: 'pointer', 
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                                    >
                                        {league}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* About Us */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="white">
                                About Us
                            </Title>
                            <Stack gap="xs">
                                {aboutLinks.map((link) => (
                                    <Anchor
                                        key={link}
                                        color="dimmed"
                                        size="sm"
                                        style={{ 
                                            cursor: 'pointer', 
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                                    >
                                        {link}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Partner With Us */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="white">
                                Partner With Us
                            </Title>
                            <Stack gap="xs">
                                {partnerLinks.map((link) => (
                                    <Anchor
                                        key={link}
                                        color="dimmed"
                                        size="sm"
                                        style={{ 
                                            cursor: 'pointer', 
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                                    >
                                        {link}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Legal */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 1 }}>
                        <Stack gap="md">
                            <Title order={5} fw={600} size="sm" c="white">
                                Legal
                            </Title>
                            <Stack gap="xs">
                                {legalLinks.map((link) => (
                                    <Anchor
                                        key={link}
                                        color="dimmed"
                                        size="sm"
                                        style={{ 
                                            cursor: 'pointer', 
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                                    >
                                        {link}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>
                </Grid>

                {/* Social Media Section */}
                <Box mb="xl">
                    <Title order={5} fw={600} size="sm" c="white" mb="md">
                        Follow I Watch Football
                    </Title>
                    <Group gap="md">
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1877f2'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                        >
                            <IconBrandFacebook size={20} />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1da1f2'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                        >
                            <IconBrandTwitter size={20} />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e4405f'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                        >
                            <IconBrandInstagram size={20} />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ff0000'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                        >
                            <IconBrandYoutube size={20} />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                        >
                            <IconBrandTiktok size={20} />
                        </ActionIcon>
                    </Group>
                </Box>

                <Divider color="dark.6" mb="xl" />

                {/* Bottom Section */}
                <Grid align="center">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Text color="dimmed" size="sm">
                            © 2025 I Watch Football. All rights reserved.
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Group gap="lg" justify="flex-end">
                            <Anchor color="dimmed" size="sm" href="#privacy">
                                Privacy Policy
                            </Anchor>
                            <Anchor color="dimmed" size="sm" href="#terms">
                                Terms of Service
                            </Anchor>
                            <Anchor color="dimmed" size="sm" href="#cookies">
                                Cookie Policy
                            </Anchor>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}


export function Footer() {
    return(
        <AppShell.Footer>
            <CTASection />
            <OneFootballStyleFooter />
        </AppShell.Footer>
    )
}