import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Paper,
    Group,
    Switch,
    Select,
    Button,
    Text
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useLocalStorage } from "@mantine/hooks";
import { usePageTransition } from '../hooks/usePageTransition';

// Example: If you have a global store for user preferences
// import { useUserPreferencesStore } from '../stores/userPreferences.store';

export function SettingsPage() {
    const { navigateWithTransition } = usePageTransition();

    const [appColourScheme, setAppColourScheme] = useLocalStorage({
        key: 'color-scheme',
        defaultValue: 'dark',
    });
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    // Local state for settings
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [language, setLanguage] = useState('en');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Example: If you have a global store or backend API, load settings on mount
    useEffect(() => {
        // Load user preferences if any
    }, []);

    function handleSave() {
        console.log('Saved settings:', { isDarkMode, language, notificationsEnabled });
        // Save to store or backend
    }

    const toggleColourScheme = (dark: boolean) => {
        const newColorScheme = dark ? 'dark' : 'light';
        setColorScheme(newColorScheme);
        setAppColourScheme(newColorScheme);
    };

    // Instead of using an effect to toggle the colour scheme,
    // directly call toggleColourScheme in the Switch onChange handler
    const handleDarkModeChange = (checked: boolean) => {
        setIsDarkMode(checked);
        toggleColourScheme(checked);
    };

    return (
        <Container size="sm" my="xl">
            <Title order={2} mb="lg">
                Settings
            </Title>

            <Paper withBorder shadow="sm" p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <Text c="var(--modern-text-primary)">Dark Mode</Text>
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

                <Group justify="space-between" mb="md">
                    <Text c="var(--modern-text-primary)">Language</Text>
                    <Select
                        value={language}
                        onChange={(value) => value && setLanguage(value)}
                        data={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Español' },
                            { value: 'fr', label: 'Français' },
                        ]}
                        style={{ width: 120 }}
                    />
                </Group>

                <Group justify="space-between" mb="md">
                    <Text c="var(--modern-text-primary)">Match Notifications</Text>
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
            </Paper>
        </Container>
    );
}
