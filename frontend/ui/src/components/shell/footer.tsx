import {ActionIcon, AppShell, Box, Button, Container, Divider, Grid, Group, Stack, Text, TextInput, Title, Anchor, Image} from '@mantine/core';
import {
    IconApple,
    IconBrandFacebook,
    IconBrandGooglePlay,
    IconBrandInstagram,
    IconBrandTwitter,
    IconBrandYoutube,
    IconSend,
    IconTrophy,
    IconBrandTiktok,
    IconBrandTwitch,
    IconExternalLink,
    IconMail,
    IconPhone,
    IconMapPin
} from '@tabler/icons-react';
import React from "react";
import { useNavigate } from "react-router-dom";

// CTA Section Component - OneFootball Style
function CTASection() {
    return (
        <Box
            sx={(theme) => ({
                backgroundColor: theme.colors.blue[6],
                color: 'white',
                padding: '3rem 0',
                textAlign: 'center'
            })}
        >
            <Container size="xl">
                <Stack align="center" spacing="lg">
                    <Title order={2} size="2rem" weight={700}>
                        Download I Watch Football
                    </Title>
                    <Text size="lg" maw="500px">
                        Stay connected with live scores, news, and tickets. Available on all platforms.
                    </Text>
                    <Group spacing="md">
                        <Button
                            size="md"
                            variant="white"
                            color="blue"
                            leftIcon={<IconApple size={18} />}
                            sx={{ color: '#1e40af' }}
                        >
                            App Store
                        </Button>
                        <Button
                            size="md"
                            variant="white"
                            color="blue"
                            leftIcon={<IconBrandGooglePlay size={18} />}
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

// OneFootball Style Footer
function OneFootballStyleFooter() {
    const navigate = useNavigate();

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
            sx={(theme) => ({
                backgroundColor: theme.colors.dark[9],
                color: 'white',
                padding: '3rem 0 1rem'
            })}
        >
            <Container size="xl">
                {/* Main Footer Content */}
                <Grid gutter="xl" mb="xl">
                    {/* Brand Section */}
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <Stack spacing="md">
                            <Group spacing="xs">
                                <IconTrophy color="#60a5fa" size={28} />
                                <Text size="xl" weight={700}>I Watch Football</Text>
                            </Group>
                            <Text color="dimmed" size="sm">
                                Your ultimate football companion for live scores, news, statistics, and ticket bookings.
                            </Text>
                            <Stack spacing="xs">
                                <Group spacing="xs">
                                    <IconMail size={16} color="#9ca3af" />
                                    <Text size="sm" color="dimmed">contact@iwatchfootball.com</Text>
                                </Group>
                                <Group spacing="xs">
                                    <IconPhone size={16} color="#9ca3af" />
                                    <Text size="sm" color="dimmed">+1 (555) 123-4567</Text>
                                </Group>
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Quick Links */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack spacing="md">
                            <Title order={5} weight={600} size="sm" color="white">
                                Quick Links
                            </Title>
                            <Stack spacing="xs">
                                {quickLinks.map((link) => (
                                    <Anchor
                                        key={link.label}
                                        color="dimmed"
                                        size="sm"
                                        sx={{ 
                                            cursor: 'pointer', 
                                            '&:hover': { color: 'white' },
                                            textDecoration: 'none'
                                        }}
                                        onClick={() => navigate(link.path)}
                                    >
                                        {link.label}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Leagues */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack spacing="md">
                            <Title order={5} weight={600} size="sm" color="white">
                                Leagues
                            </Title>
                            <Stack spacing="xs">
                                {leagues.map((league) => (
                                    <Anchor
                                        key={league}
                                        color="dimmed"
                                        size="sm"
                                        sx={{ 
                                            cursor: 'pointer', 
                                            '&:hover': { color: 'white' },
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {league}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* About Us */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack spacing="md">
                            <Title order={5} weight={600} size="sm" color="white">
                                About Us
                            </Title>
                            <Stack spacing="xs">
                                {aboutLinks.map((link) => (
                                    <Anchor
                                        key={link}
                                        color="dimmed"
                                        size="sm"
                                        sx={{ 
                                            cursor: 'pointer', 
                                            '&:hover': { color: 'white' },
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {link}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Partner With Us */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Stack spacing="md">
                            <Title order={5} weight={600} size="sm" color="white">
                                Partner With Us
                            </Title>
                            <Stack spacing="xs">
                                {partnerLinks.map((link) => (
                                    <Anchor
                                        key={link}
                                        color="dimmed"
                                        size="sm"
                                        sx={{ 
                                            cursor: 'pointer', 
                                            '&:hover': { color: 'white' },
                                            textDecoration: 'none'
                                        }}
                                    >
                                        {link}
                                    </Anchor>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    {/* Legal */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 1 }}>
                        <Stack spacing="md">
                            <Title order={5} weight={600} size="sm" color="white">
                                Legal
                            </Title>
                            <Stack spacing="xs">
                                {legalLinks.map((link) => (
                                    <Anchor
                                        key={link}
                                        color="dimmed"
                                        size="sm"
                                        sx={{ 
                                            cursor: 'pointer', 
                                            '&:hover': { color: 'white' },
                                            textDecoration: 'none'
                                        }}
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
                    <Title order={5} weight={600} size="sm" color="white" mb="md">
                        Follow I Watch Football
                    </Title>
                    <Group spacing="md">
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            sx={{ '&:hover': { backgroundColor: '#1877f2', color: 'white' } }}
                        >
                            <IconBrandFacebook size={20} />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            sx={{ '&:hover': { backgroundColor: '#1da1f2', color: 'white' } }}
                        >
                            <IconBrandTwitter size={20} />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            sx={{ '&:hover': { backgroundColor: '#e4405f', color: 'white' } }}
                        >
                            <IconBrandInstagram size={20} />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            sx={{ '&:hover': { backgroundColor: '#ff0000', color: 'white' } }}
                        >
                            <IconBrandYoutube size={20} />
                        </ActionIcon>
                        <ActionIcon 
                            variant="subtle" 
                            color="gray" 
                            size="lg"
                            sx={{ '&:hover': { backgroundColor: '#000000', color: 'white' } }}
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
                        <Group spacing="lg" position="right">
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