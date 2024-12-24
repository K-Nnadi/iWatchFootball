import React from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Paper,
    Group,
    Image,
    Space,
    useMantineTheme,
    rem,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
    const theme = useMantineTheme();
    const navigate = useNavigate();

    return (
        <Container size="xl" style={{ position: 'relative', padding: rem(50) }}>
            {/* Hero Section */}
            <Paper
                shadow="md"
                radius="md"
                p="xl"
                style={{
                    backgroundColor: theme.colors.indigo[1],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: rem(320),
                }}
            >
                <div style={{ maxWidth: '50%' }}>
                    <Title order={1} mb="xs">
                        Welcome to I Watch Football
                    </Title>
                    <Text size="lg" color="dimmed" mb="md">
                        Track all your football adventures: personal stats, match logs, and ticketing in one place.
                    </Text>
                    <Button
                        variant="filled"
                        color="indigo"
                        size="md"
                        onClick={() => navigate('/home')}
                    >
                        Explore Now
                    </Button>
                </div>

                <Image
                    src="https://images.unsplash.com/photo-1618247674062-3bf7d57ea5b5?auto=format&w=700&q=80"
                    alt="Football fans in stadium"
                    radius="md"
                    fit="cover"
                    width={300}
                    height={200}
                />
            </Paper>

            <Space h="xl" />

            {/* Feature Highlights */}
            <Group position="center" spacing="xl" align="start">
                {/* Personal Stats */}
                <Paper shadow="xs" radius="md" p="md" style={{ maxWidth: rem(280) }}>
                    <Title order={3} mb="xs">
                        Personal Stats
                    </Title>
                    <Text size="sm" color="dimmed">
                        Measure your football journey—track games attended, goals you’ve witnessed, and total stadiums visited.
                    </Text>
                </Paper>

                {/* Match Logs */}
                <Paper shadow="xs" radius="md" p="md" style={{ maxWidth: rem(280) }}>
                    <Title order={3} mb="xs">
                        Match Logs
                    </Title>
                    <Text size="sm" color="dimmed">
                        Keep detailed records of every match you attend—dates, results, and memorable moments, all in one log.
                    </Text>
                </Paper>

                {/* Ticketing */}
                <Paper shadow="xs" radius="md" p="md" style={{ maxWidth: rem(280) }}>
                    <Title order={3} mb="xs">
                        Ticketing
                    </Title>
                    <Text size="sm" color="dimmed">
                        Never miss a game! Easily browse upcoming matches and secure tickets right from our platform.
                    </Text>
                </Paper>
            </Group>

            <Space h="xl" />

            {/* Call-to-action Section */}
            <Paper
                shadow="xs"
                radius="md"
                p="lg"
                mt="xl"
                style={{
                    backgroundColor: theme.colors.teal[1],
                    textAlign: 'center',
                }}
            >
                <Title order={2} mb="sm">Join the Community</Title>
                <Text size="md" color="dimmed" mb="md">
                    Sign up now and begin logging matches, analyzing your stats, and grabbing the best tickets for your next live experience.
                </Text>
                <Group position="center">
                    <Button variant="outline" color="teal" size="md" onClick={() => navigate('/join')}>
                        Join
                    </Button>
                    <Button variant="outline" color="teal" size="md" onClick={() => navigate('/signIn')}>
                        Sign In
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
}
