import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Paper,
    Group,
    Stack,
    Switch,
    Select,
    Button,
    Text,
    Avatar,
    Divider,
    Box,
    ActionIcon
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useLocalStorage } from "@mantine/hooks";
import { IconMail, IconUser, IconHeart, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import { useAuthStore } from '../shared/stores/auth.store';
import { notifications } from '@mantine/notifications';
import '../styles/modern.css';

export function SettingsPage() {
    const { navigateWithTransition } = usePageTransition();
    const { isLoggedIn, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        notifications.show({
            title: 'Signed Out',
            message: 'You have been successfully signed out.',
            color: 'blue',
        });
        navigateWithTransition('/');
    };

    const [appColourScheme, setAppColourScheme] = useLocalStorage({
        key: 'color-scheme',
        defaultValue: 'dark',
    });
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    // Local state for settings
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [language, setLanguage] = useState('en');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Profile data (only used when logged in)
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
        // Load user preferences if any
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);

    function handleSave() {
        console.log('Saved settings:', { 
            isDarkMode, 
            language, 
            notificationsEnabled: isLoggedIn ? notificationsEnabled : undefined,
            favoriteTeam: isLoggedIn ? favoriteTeam : undefined
        });
        // Save to store or backend
    }

    const toggleColourScheme = (dark: boolean) => {
        const newColorScheme = dark ? 'dark' : 'light';
        setColorScheme(newColorScheme);
        setAppColourScheme(newColorScheme);
    };

    const handleDarkModeChange = (checked: boolean) => {
        setIsDarkMode(checked);
        toggleColourScheme(checked);
    };

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
                Settings
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
                    {/* Profile Section - Only shown when logged in */}
                    {isLoggedIn && (
                        <>
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

                            <Divider 
                                style={{ 
                                    borderColor: 'var(--modern-border-color)',
                                }} 
                            />
                        </>
                    )}

                    {/* General Settings */}
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Text style={{ color: 'var(--modern-text-primary)' }}>Dark Mode</Text>
                    <Switch
                        checked={isDarkMode}
                        onChange={(event) => handleDarkModeChange(event.currentTarget.checked)}
                        styles={{
                            track: {
                                backgroundColor: isDarkMode ? 'var(--modern-lime)' : undefined,
                            },
                            thumb: {
                                backgroundColor: isDarkMode ? 'var(--modern-bg-primary)' : undefined,
                            }
                        }}
                    />
                </Group>

                        <Group justify="space-between">
                            <Text style={{ color: 'var(--modern-text-primary)' }}>Language</Text>
                    <Select
                        value={language}
                        onChange={(value) => value && setLanguage(value)}
                        data={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Español' },
                            { value: 'fr', label: 'Français' },
                        ]}
                        style={{ width: 120 }}
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
                </Group>

                        {/* Match Notifications - Only shown when logged in */}
                        {isLoggedIn && (
                            <Group justify="space-between">
                                <Text style={{ color: 'var(--modern-text-primary)' }}>Match Notifications</Text>
                    <Switch
                        checked={notificationsEnabled}
                        onChange={(event) => setNotificationsEnabled(event.currentTarget.checked)}
                        styles={{
                            track: {
                                backgroundColor: notificationsEnabled ? 'var(--modern-lime)' : undefined,
                            },
                            thumb: {
                                backgroundColor: notificationsEnabled ? 'var(--modern-bg-primary)' : undefined,
                            }
                        }}
                    />
                </Group>
                        )}
                    </Stack>

                    {/* Action Buttons */}
                <Group justify="flex-end" mt="lg">
                    <Button 
                        variant="outline" 
                        onClick={() => window.history.back()}
                        style={{
                            borderColor: 'var(--modern-lime)',
                            color: 'var(--modern-lime)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                            borderRadius: '0',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave}
                        style={{
                            backgroundColor: 'var(--modern-lime)',
                            color: 'var(--modern-bg-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                            borderRadius: '0',
                            border: '2px solid var(--modern-lime)',
                        }}
                    >
                        Save Changes
                    </Button>
                </Group>

                {/* Sign Out Section - Only shown when logged in */}
                {isLoggedIn && (
                    <>
                        <Divider my="xl" />
                        <Group justify="flex-end">
                            <Button 
                                variant="outline" 
                                onClick={handleLogout}
                                style={{
                                    borderColor: 'var(--mantine-color-red-6)',
                                    color: 'var(--mantine-color-red-6)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 600,
                                    borderRadius: '0',
                                }}
                            >
                                Sign Out
                            </Button>
                        </Group>
                    </>
                )}
                </Stack>
            </Paper>
        </Container>
    );
}
