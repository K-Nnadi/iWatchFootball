import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Paper,
    Group,
    Stack,
    Text,
    Avatar,
    Divider,
    Box,
    Select,
    Button,
    ActionIcon
} from '@mantine/core';
import { IconMail, IconUser, IconHeart, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import { useAuthStore } from '../shared/stores/auth.store';
import { useLocalStorage } from '@mantine/hooks';
import '../styles/modern.css';

export function ProfilePage() {
    const { navigateWithTransition } = usePageTransition();
    const { isLoggedIn } = useAuthStore();
    
    // Mock user data - replace with actual user data from auth store/API
    const [userData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john.doe@example.com',
    });

    const [favoriteTeam, setFavoriteTeam] = useLocalStorage<string | null>({
        key: 'favorite-team',
        defaultValue: null,
    });

    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(favoriteTeam);

    // Mock teams list - replace with actual API call
    const teams = [
        'Arsenal',
        'Chelsea',
        'Liverpool',
        'Manchester City',
        'Manchester United',
        'Tottenham',
        'Newcastle',
        'Brighton',
        'Aston Villa',
        'West Ham',
        'Crystal Palace',
        'Fulham',
        'Brentford',
        'Wolves',
        'Everton',
        'Nottingham Forest',
        'Bournemouth',
        'Burnley',
        'Sheffield United',
        'Luton Town'
    ];

    // Get user initials for avatar
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    useEffect(() => {
        // TODO: Load actual user data from auth store or API
        // For now using mock data
    }, [isLoggedIn]);

    const handleEditTeam = () => {
        setIsEditingTeam(true);
        setSelectedTeam(favoriteTeam);
    };

    const handleSaveTeam = () => {
        if (selectedTeam) {
            setFavoriteTeam(selectedTeam);
        }
        setIsEditingTeam(false);
    };

    const handleCancelEdit = () => {
        setSelectedTeam(favoriteTeam);
        setIsEditingTeam(false);
    };

    return (
        <Container size="sm" my="xl">
            <Title 
                order={2} 
                mb="xl"
                style={{
                    color: 'var(--modern-text-primary)',
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                }}
            >
                Profile
            </Title>

            <Paper 
                withBorder 
                shadow="sm" 
                p="xl" 
                radius={0}
                style={{
                    backgroundColor: 'var(--modern-card-bg)',
                    border: '1px solid var(--modern-border-color)',
                }}
            >
                <Stack gap="xl">
                    {/* Avatar and Name Section */}
                    <Group gap="lg" align="center">
                        <Avatar
                            size={100}
                            radius="xl"
                            style={{
                                backgroundColor: 'var(--modern-bg-tertiary)',
                                border: '2px solid var(--modern-lime)',
                                color: 'var(--modern-lime)',
                                fontWeight: 700,
                                fontSize: '2rem',
                            }}
                        >
                            {getInitials(userData.firstName, userData.lastName)}
                        </Avatar>
                        <Stack gap="xs">
                            <Title 
                                order={3}
                                style={{
                                    color: 'var(--modern-text-primary)',
                                    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                                }}
                            >
                                {userData.firstName} {userData.lastName}
                            </Title>
                            <Text 
                                size="sm" 
                                style={{ color: 'var(--modern-text-secondary)' }}
                            >
                                @{userData.userName}
                            </Text>
                        </Stack>
                    </Group>

                    <Divider 
                        style={{ 
                            borderColor: 'var(--modern-border-color)',
                        }} 
                    />

                    {/* User Details */}
                    <Stack gap="md">
                        <Box>
                            <Group gap="sm" mb="xs">
                                <IconUser 
                                    size={20} 
                                    style={{ color: 'var(--modern-lime)' }} 
                                />
                                <Text 
                                    fw={600}
                                    style={{ color: 'var(--modern-text-primary)' }}
                                >
                                    Full Name
                                </Text>
                            </Group>
                            <Text 
                                style={{ 
                                    color: 'var(--modern-text-secondary)',
                                    paddingLeft: '28px',
                                }}
                            >
                                {userData.firstName} {userData.lastName}
                            </Text>
                        </Box>

                        <Box>
                            <Group gap="sm" mb="xs">
                                <IconMail 
                                    size={20} 
                                    style={{ color: 'var(--modern-lime)' }} 
                                />
                                <Text 
                                    fw={600}
                                    style={{ color: 'var(--modern-text-primary)' }}
                                >
                                    Email
                                </Text>
                            </Group>
                            <Text 
                                style={{ 
                                    color: 'var(--modern-text-secondary)',
                                    paddingLeft: '28px',
                                }}
                            >
                                {userData.email}
                            </Text>
                        </Box>

                        <Box>
                            <Group gap="sm" mb="xs">
                                <IconUser 
                                    size={20} 
                                    style={{ color: 'var(--modern-lime)' }} 
                                />
                                <Text 
                                    fw={600}
                                    style={{ color: 'var(--modern-text-primary)' }}
                                >
                                    Username
                                </Text>
                            </Group>
                            <Text 
                                style={{ 
                                    color: 'var(--modern-text-secondary)',
                                    paddingLeft: '28px',
                                }}
                            >
                                @{userData.userName}
                            </Text>
                        </Box>

                        <Box>
                            <Group gap="sm" mb="xs" justify="space-between">
                                <Group gap="sm">
                                    <IconHeart 
                                        size={20} 
                                        style={{ color: 'var(--modern-lime)' }} 
                                    />
                                    <Text 
                                        fw={600}
                                        style={{ color: 'var(--modern-text-primary)' }}
                                    >
                                        Favorite Team
                                    </Text>
                                </Group>
                                {!isEditingTeam && (
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={handleEditTeam}
                                        style={{
                                            color: 'var(--modern-lime)',
                                        }}
                                    >
                                        <IconEdit size={18} />
                                    </ActionIcon>
                                )}
                            </Group>
                            {isEditingTeam ? (
                                <Group gap="sm" style={{ paddingLeft: '28px' }}>
                                    <Select
                                        placeholder="Select your favorite team"
                                        data={teams}
                                        value={selectedTeam}
                                        onChange={setSelectedTeam}
                                        searchable
                                        style={{ flex: 1 }}
                                        styles={{
                                            input: {
                                                backgroundColor: 'var(--modern-bg-primary)',
                                                border: '1px solid var(--modern-border-color)',
                                                color: 'var(--modern-text-primary)',
                                                borderRadius: '0',
                                            },
                                            dropdown: {
                                                backgroundColor: 'var(--modern-card-bg)',
                                                border: '1px solid var(--modern-border-color)',
                                            },
                                            option: {
                                                color: 'var(--modern-text-primary)',
                                            }
                                        }}
                                    />
                                    <ActionIcon
                                        variant="filled"
                                        onClick={handleSaveTeam}
                                        disabled={!selectedTeam}
                                        style={{
                                            backgroundColor: 'var(--modern-lime)',
                                            color: 'var(--modern-bg-primary)',
                                        }}
                                    >
                                        <IconCheck size={18} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={handleCancelEdit}
                                        style={{
                                            color: 'var(--modern-text-secondary)',
                                        }}
                                    >
                                        <IconX size={18} />
                                    </ActionIcon>
                                </Group>
                            ) : (
                                <Text 
                                    style={{ 
                                        color: 'var(--modern-text-secondary)',
                                        paddingLeft: '28px',
                                    }}
                                >
                                    {favoriteTeam || 'Not set'}
                                </Text>
                            )}
                        </Box>
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
}

