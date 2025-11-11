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
                <Group position="apart" mb="md">
                    <Text>Dark Mode</Text>
                    <Switch
                        checked={isDarkMode}
                        onChange={(event) => handleDarkModeChange(event.currentTarget.checked)}
                    />
                </Group>

                <Group position="apart" mb="md">
                    <Text>Language</Text>
                    <Select
                        value={language}
                        onChange={setLanguage}
                        data={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Español' },
                            { value: 'fr', label: 'Français' },
                        ]}
                        style={{ width: 120 }}
                    />
                </Group>

                <Group position="apart" mb="md">
                    <Text>Match Notifications</Text>
                    <Switch
                        checked={notificationsEnabled}
                        onChange={(event) => setNotificationsEnabled(event.currentTarget.checked)}
                    />
                </Group>

                <Group position="right" mt="lg">
                    <Button variant="outline" onClick={() => navigateWithTransition(-1, { transitionType: 'loading', duration: 1000 })}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </Group>
            </Paper>
        </Container>
    );
}
