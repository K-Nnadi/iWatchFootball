import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Container,
    Title,
    Paper,
    Group,
    Stack,
    Switch,
    Select,
    Autocomplete,
    Text,
    Avatar,
    Divider,
    Box,
    ActionIcon,
    SimpleGrid,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useLocalStorage } from "@mantine/hooks";
import {
    IconMail,
    IconUser,
    IconHeart,
    IconEdit,
    IconCheck,
    IconX,
    IconBell,
    IconWallet,
    IconChevronRight,
} from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import { UiButton } from '../components/ui';
import { useAuthStore } from '../shared/stores/auth.store';
import { notify } from '../shared/notify';
import { useGetQueryTeam, useGetOneTeam } from '@iWatchFootball/clients/controllers/team';
import { useUpdateOneUser } from '@iWatchFootball/clients/controllers/user';
import { useGetOneCommsPreference, useUpdateOneCommsPreference } from '@iWatchFootball/clients/controllers/comms-preference';
import {
    CommsPreferenceEmailNotifications,
    CommsPreferenceSmsNotifications,
    CommsPreferencePushNotifications,
    CommsPreferenceInAppNotifications,
    CommsPreferenceMarketingEmails,
    CommsPreferenceNewsletterEmails,
    CommsPreferenceMatchReminders,
    CommsPreferenceLanguage,
} from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import type {
    CommsPreferenceEmailNotifications as EmailNotifType,
    CommsPreferenceSmsNotifications as SmsNotifType,
    CommsPreferencePushNotifications as PushNotifType,
    CommsPreferenceInAppNotifications as InAppNotifType,
    CommsPreferenceMarketingEmails as MarketingEmailsType,
    CommsPreferenceNewsletterEmails as NewsletterEmailsType,
    CommsPreferenceMatchReminders as MatchRemindersType,
    CommsPreferenceLanguage as LanguageType,
} from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import {
    getTrackerPrivacy,
    updateTrackerPrivacy,
    type TrackerVisibility,
} from '../shared/api/tracker.api';

export function SettingsPage() {
    const { navigateWithTransition } = usePageTransition();
    const { isLoggedIn, logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        notify.info('Signed Out', 'You have been successfully signed out.');
        navigateWithTransition('/');
    };

    const [appColourScheme, setAppColourScheme] = useLocalStorage({
        key: 'color-scheme',
        defaultValue: 'dark',
    });
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    // Local state for settings
    const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
    const [language, setLanguage] = useState<LanguageType>(CommsPreferenceLanguage.EN);

    // Team search state
    const [teamSearchValue, setTeamSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(user?.favouriteTeamId || null);
    const [favoriteTeamName, setFavoriteTeamName] = useState<string | null>(null);
    const [trackerVisibility, setTrackerVisibility] = useState<TrackerVisibility>('PRIVATE');
    const [shareVerifiedOnly, setShareVerifiedOnly] = useState(true);
    const [savingTrackerPrivacy, setSavingTrackerPrivacy] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        void getTrackerPrivacy()
            .then((p) => {
                setTrackerVisibility(p.trackerVisibility);
                setShareVerifiedOnly(p.shareVerifiedOnly);
            })
            .catch(() => {});
    }, [isLoggedIn]);

    const handleSaveTrackerPrivacy = async () => {
        setSavingTrackerPrivacy(true);
        try {
            const updated = await updateTrackerPrivacy({
                trackerVisibility,
                shareVerifiedOnly,
            });
            setTrackerVisibility(updated.trackerVisibility);
            setShareVerifiedOnly(updated.shareVerifiedOnly);
            notify.success('Tracker privacy updated');
        } catch (e) {
            notify.error('Could not save', e instanceof Error ? e.message : String(e));
        } finally {
            setSavingTrackerPrivacy(false);
        }
    };

    const trackerVisibilityOptions = [
        { value: 'PRIVATE', label: 'Private — only you' },
        { value: 'FRIENDS', label: 'Friends — accepted friends only' },
        { value: 'PUBLIC', label: 'Public — any signed-in user' },
    ];

    const handleTeamSearchChange = (value: string) => {
        setTeamSearchValue(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
    };

    // Server-side team search using $like filter
    const { data: teamsData = [], isLoading: isLoadingTeams } = useGetQueryTeam(
        {
            take: 20,
            ...(debouncedSearch ? { 'where[name][$like]': `%${debouncedSearch}%` } : {}),
        } as any,
        {
            query: {
                enabled: isEditingTeam && debouncedSearch.length > 0,
            } as any
        }
    );

    // Fetch the current favorite team name by ID (only once when not editing)
    const { data: favoriteTeamData } = useGetOneTeam(
        user?.favouriteTeamId as number,
        {
            query: {
                enabled: !!user?.favouriteTeamId && !favoriteTeamName,
            } as any
        }
    );

    useEffect(() => {
        if (favoriteTeamData && !favoriteTeamName) {
            setFavoriteTeamName(favoriteTeamData.name);
        }
    }, [favoriteTeamData, favoriteTeamName]);

    // Update user mutation
    const updateUserMutation = useUpdateOneUser({
        mutation: {
            onSuccess: () => {
                notify.success('Success', 'Favorite team updated successfully!');
                setIsEditingTeam(false);
                // teamSearchValue holds the selected team's name at point of selection
                if (teamSearchValue) {
                    setFavoriteTeamName(teamSearchValue);
                }
                // Refresh user data by reloading from localStorage
                if (user) {
                    const updatedUser = { ...user, favouriteTeamId: selectedTeamId || undefined };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    useAuthStore.setState((state) => ({ ...state, user: updatedUser }));
                }
            },
            onError: (error: any) => {
                notify.error('Error', error?.response?.data?.message || 'Failed to update favorite team');
            },
        },
    });

    // Comms preference state
    const [emailNotifications, setEmailNotifications] = useState<EmailNotifType>(CommsPreferenceEmailNotifications.DAILY);
    const [smsNotifications, setSmsNotifications] = useState<SmsNotifType>(CommsPreferenceSmsNotifications.NEVER);
    const [pushNotifications, setPushNotifications] = useState<PushNotifType>(CommsPreferencePushNotifications.IMMEDIATE);
    const [inAppNotifications, setInAppNotifications] = useState<InAppNotifType>(CommsPreferenceInAppNotifications.IMMEDIATE);
    const [marketingEmails, setMarketingEmails] = useState<MarketingEmailsType>(CommsPreferenceMarketingEmails.WEEKLY);
    const [newsletterEmails, setNewsletterEmails] = useState<NewsletterEmailsType>(CommsPreferenceNewsletterEmails.WEEKLY);
    const [matchReminders, setMatchReminders] = useState<MatchRemindersType>(CommsPreferenceMatchReminders.DAILY);

    const { data: commsPreferenceData } = useGetOneCommsPreference(
        user?.commsPreferenceId as number,
        { query: { enabled: !!user?.commsPreferenceId } as any }
    );

    useEffect(() => {
        if (commsPreferenceData) {
            setEmailNotifications(commsPreferenceData.emailNotifications);
            setSmsNotifications(commsPreferenceData.smsNotifications);
            setPushNotifications(commsPreferenceData.pushNotifications);
            setInAppNotifications(commsPreferenceData.inAppNotifications);
            setMarketingEmails(commsPreferenceData.marketingEmails);
            setNewsletterEmails(commsPreferenceData.newsletterEmails);
            setMatchReminders(commsPreferenceData.matchReminders);
            setLanguage(commsPreferenceData.language);
        }
    }, [commsPreferenceData]);

    const updateCommsPrefMutation = useUpdateOneCommsPreference({
        mutation: {
            onSuccess: () => {
                notify.success('Preferences Saved', 'Your notification preferences have been updated.');
            },
            onError: (error: any) => {
                notify.error('Error', error?.response?.data?.message || 'Failed to save notification preferences.');
            },
        },
    });

    const handleSaveCommsPrefs = () => {
        if (!commsPreferenceData || !user?.commsPreferenceId) return;
        updateCommsPrefMutation.mutate({
            id: user.commsPreferenceId,
            data: {
                ...commsPreferenceData,
                emailNotifications,
                smsNotifications,
                pushNotifications,
                inAppNotifications,
                marketingEmails,
                newsletterEmails,
                matchReminders,
                language,
            },
        });
    };

    // Get user data from auth store (API may omit name fields after login)
    const userData = user ? {
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        userName: user.userName ?? '',
        email: user.email ?? '',
    } : {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe',
        email: 'john.doe@example.com',
    };


    // Team options for Autocomplete - results come directly from server-side search
    const teamOptions = useMemo(() => {
        return teamsData.map(team => ({
            value: team.id.toString(),
            label: team.name,
        }));
    }, [teamsData]);

    const frequencyOptions = [
        { value: CommsPreferenceEmailNotifications.IMMEDIATE, label: 'Immediately' },
        { value: CommsPreferenceEmailNotifications.DAILY, label: 'Daily' },
        { value: CommsPreferenceEmailNotifications.WEEKLY, label: 'Weekly' },
        { value: CommsPreferenceEmailNotifications.MONTHLY, label: 'Monthly' },
        { value: CommsPreferenceEmailNotifications.NEVER, label: 'Never' },
    ];

    const selectStyles = {
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
        },
    };

    // Get user initials for avatar
    const getInitials = (firstName: string, lastName: string, fallback: string) => {
        const f = firstName.trim();
        const l = lastName.trim();
        if (f && l) return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
        const single = f || l;
        if (single) return single.slice(0, 2).toUpperCase();
        const fb = fallback.trim();
        if (fb) return fb.replace(/^@/, '').slice(0, 2).toUpperCase();
        return '?';
    };

    useEffect(() => {
        // Load user preferences if any
        setIsDarkMode(colorScheme === 'dark');
    }, [colorScheme]);

    function handleSave() {
        console.log('Saved settings:', { isDarkMode, language, favoriteTeam: isLoggedIn ? favoriteTeamName : undefined });
        // Save to store or backend
        notify.success('Settings Saved', 'Your settings have been saved.');
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
        handleTeamSearchChange(favoriteTeamName || '');
        setSelectedTeamId(user?.favouriteTeamId || null);
    };

    const handleSaveTeam = () => {
        if (selectedTeamId && user) {
            updateUserMutation.mutate({
                id: user.id,
                data: {
                    ...user,
                    favouriteTeamId: selectedTeamId,
                },
            });
        } else {
            setIsEditingTeam(false);
        }
    };

    const handleCancelEdit = () => {
        handleTeamSearchChange(favoriteTeamName || '');
        setSelectedTeamId(user?.favouriteTeamId || null);
        setIsEditingTeam(false);
    };

    const handleTeamSelect = (value: string | null) => {
        if (value) {
            const teamId = parseInt(value, 10);
            setSelectedTeamId(teamId);
            const selectedTeam = teamsData.find(t => t.id === teamId);
            if (selectedTeam) {
                setTeamSearchValue(selectedTeam.name);
            }
        } else {
            setSelectedTeamId(null);
            setTeamSearchValue('');
        }
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

            {/* Wallet — reachable from Settings (not main nav) */}
            {isLoggedIn && (
                <Paper
                    withBorder
                    p="md"
                    radius={0}
                    mb="xl"
                    onClick={() => navigateWithTransition('/wallet')}
                    style={{
                        cursor: 'pointer',
                        backgroundColor: 'var(--modern-card-bg)',
                        border: '1px solid var(--modern-border-color)',
                    }}
                >
                    <Group justify="space-between" wrap="nowrap">
                        <Group gap="md" wrap="nowrap">
                            <Box
                                style={{
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    borderRadius: '8px',
                                    padding: '0.65rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <IconWallet size={22} color="var(--mantine-color-teal-filled)" stroke={1.5} />
                            </Box>
                            <Stack gap={2}>
                                <Text fw={600} size="sm" c="var(--modern-text-primary)">
                                    Wallet
                                </Text>
                                <Text size="xs" c="dimmed">
                                    Platform credit balance and transaction history from marketplace sales
                                </Text>
                            </Stack>
                        </Group>
                        <IconChevronRight size={20} style={{ opacity: 0.6 }} />
                    </Group>
                </Paper>
            )}

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
                                    {getInitials(
                                        userData.firstName,
                                        userData.lastName,
                                        userData.userName || userData.email,
                                    )}
                                </Avatar>
                                <Stack gap="xs">
                                    <Title 
                                        order={3}
                                        style={{
                                            color: 'var(--modern-text-primary)',
                                            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
                                        }}
                                    >
                                        {userData.firstName || userData.lastName
                                            ? `${userData.firstName} ${userData.lastName}`.trim()
                                            : userData.userName || userData.email || 'Account'}
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
                                        {userData.firstName || userData.lastName
                                            ? `${userData.firstName} ${userData.lastName}`.trim()
                                            : '—'}
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
                                            <Autocomplete
                                                placeholder="Start typing to search for your favorite team"
                                                data={teamOptions}
                                                value={teamSearchValue}
                                                onChange={handleTeamSearchChange}
                                                onOptionSubmit={handleTeamSelect}
                                                style={{ flex: 1 }}
                                                disabled={isLoadingTeams}
                                                limit={20}
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
                                                disabled={!selectedTeamId || updateUserMutation.isPending}
                                                loading={updateUserMutation.isPending}
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
                                                disabled={updateUserMutation.isPending}
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
                                            {favoriteTeamName || 'Not set'}
                                        </Text>
                                    )}
                                </Box>

                                <Box>
                                    <Text fw={600} mb="xs" style={{ color: 'var(--modern-text-primary)' }}>
                                        Tracker privacy
                                    </Text>
                                    <Text size="xs" c="dimmed" mb="sm" style={{ paddingLeft: 0 }}>
                                        Controls who can see your match stats and compare with you.
                                    </Text>
                                    <Stack gap="sm" style={{ paddingLeft: '28px' }}>
                                        <Select
                                            label="Who can see your stats"
                                            data={trackerVisibilityOptions}
                                            value={trackerVisibility}
                                            onChange={(v) =>
                                                v && setTrackerVisibility(v as TrackerVisibility)
                                            }
                                            styles={selectStyles}
                                        />
                                        <Switch
                                            label="Share verified matches only"
                                            description="When on, friends compare using ticket-verified logs only"
                                            checked={shareVerifiedOnly}
                                            onChange={(e) =>
                                                setShareVerifiedOnly(e.currentTarget.checked)
                                            }
                                        />
                                        <UiButton
                                            size="xs"
                                            loading={savingTrackerPrivacy}
                                            onClick={() => void handleSaveTrackerPrivacy()}
                                        >
                                            Save tracker privacy
                                        </UiButton>
                                    </Stack>
                                </Box>
                            </Stack>

                            <Divider style={{ borderColor: 'var(--modern-border-color)' }} />

                            {/* Notification Preferences */}
                            {user?.commsPreferenceId && (
                                <>
                                    <Box>
                                        <Group gap="sm" mb="md">
                                            <IconBell size={20} style={{ color: 'var(--modern-lime)' }} />
                                            <Text fw={600} style={{ color: 'var(--modern-text-primary)' }}>
                                                Notification Preferences
                                            </Text>
                                        </Group>

                                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                            <Box>
                                                <Text size="xs" mb={4} style={{ color: 'var(--modern-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Email Notifications
                                                </Text>
                                                <Select
                                                    data={frequencyOptions}
                                                    value={emailNotifications}
                                                    onChange={(v) => v && setEmailNotifications(v as EmailNotifType)}
                                                    styles={selectStyles}
                                                />
                                            </Box>

                                            <Box>
                                                <Text size="xs" mb={4} style={{ color: 'var(--modern-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    SMS Notifications
                                                </Text>
                                                <Select
                                                    data={frequencyOptions}
                                                    value={smsNotifications}
                                                    onChange={(v) => v && setSmsNotifications(v as SmsNotifType)}
                                                    styles={selectStyles}
                                                />
                                            </Box>

                                            <Box>
                                                <Text size="xs" mb={4} style={{ color: 'var(--modern-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Push Notifications
                                                </Text>
                                                <Select
                                                    data={frequencyOptions}
                                                    value={pushNotifications}
                                                    onChange={(v) => v && setPushNotifications(v as PushNotifType)}
                                                    styles={selectStyles}
                                                />
                                            </Box>

                                            <Box>
                                                <Text size="xs" mb={4} style={{ color: 'var(--modern-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    In-App Notifications
                                                </Text>
                                                <Select
                                                    data={frequencyOptions}
                                                    value={inAppNotifications}
                                                    onChange={(v) => v && setInAppNotifications(v as InAppNotifType)}
                                                    styles={selectStyles}
                                                />
                                            </Box>

                                            <Box>
                                                <Text size="xs" mb={4} style={{ color: 'var(--modern-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Match Reminders
                                                </Text>
                                                <Select
                                                    data={frequencyOptions}
                                                    value={matchReminders}
                                                    onChange={(v) => v && setMatchReminders(v as MatchRemindersType)}
                                                    styles={selectStyles}
                                                />
                                            </Box>

                                            <Box>
                                                <Text size="xs" mb={4} style={{ color: 'var(--modern-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Marketing Emails
                                                </Text>
                                                <Select
                                                    data={frequencyOptions}
                                                    value={marketingEmails}
                                                    onChange={(v) => v && setMarketingEmails(v as MarketingEmailsType)}
                                                    styles={selectStyles}
                                                />
                                            </Box>

                                            <Box>
                                                <Text size="xs" mb={4} style={{ color: 'var(--modern-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Newsletter Emails
                                                </Text>
                                                <Select
                                                    data={frequencyOptions}
                                                    value={newsletterEmails}
                                                    onChange={(v) => v && setNewsletterEmails(v as NewsletterEmailsType)}
                                                    styles={selectStyles}
                                                />
                                            </Box>
                                        </SimpleGrid>

                                        <Group justify="flex-end" mt="md">
                                            <UiButton
                                                onClick={handleSaveCommsPrefs}
                                                loading={updateCommsPrefMutation.isPending}
                                            >
                                                Save preferences
                                            </UiButton>
                                        </Group>
                                    </Box>

                                    <Divider style={{ borderColor: 'var(--modern-border-color)' }} />
                                </>
                            )}
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
                                onChange={(value) => value && setLanguage(value as LanguageType)}
                                data={[
                                    { value: CommsPreferenceLanguage.EN, label: 'English' },
                                    { value: CommsPreferenceLanguage.ES, label: 'Español' },
                                    { value: CommsPreferenceLanguage.FR, label: 'Français' },
                                    { value: CommsPreferenceLanguage.DE, label: 'Deutsch' },
                                    { value: CommsPreferenceLanguage.IT, label: 'Italiano' },
                                    { value: CommsPreferenceLanguage.PT, label: 'Português' },
                                ]}
                                style={{ width: 140 }}
                                styles={selectStyles}
                            />
                        </Group>

                    </Stack>

                    {/* Action Buttons */}
                <Group justify="flex-end" mt="lg">
                    <UiButton variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </UiButton>
                    <UiButton onClick={handleSave}>
                        Save changes
                    </UiButton>
                </Group>

                {/* Sign Out Section - Only shown when logged in */}
                {isLoggedIn && (
                    <>
                        <Divider my="xl" />
                        <Group justify="flex-end">
                            <UiButton variant="danger" onClick={handleLogout}>
                                Sign out
                            </UiButton>
                        </Group>
                    </>
                )}
                </Stack>
            </Paper>
        </Container>
    );
}
