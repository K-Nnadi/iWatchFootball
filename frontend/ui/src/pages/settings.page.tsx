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
    Chip,
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
import { commsLanguageToLocale, useI18nStore, useTranslation } from '../i18n';
import { useAuthStore } from '../shared/stores/auth.store';
import { notify } from '../shared/notify';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useGetOneUser, useUpdateOneUser } from '@iWatchFootball/clients/controllers/user';
import { useGetQueryCommsPreference, useUpdateOneCommsPreference } from '@iWatchFootball/clients/controllers/comms-preference';
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
    updateTrackerPrivacy,
    useTrackerPrivacy,
    type TrackerVisibility,
} from '../shared/api/tracker.api';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import { useAdPreferences, useUpdateAdPreferences } from '../shared/api/adPreferences.api';

export function SettingsPage() {
    const { navigateWithTransition } = usePageTransition();
    const { attendanceAdvancedStatsEnabled } = usePlatformFeaturesStore();
    const { isLoggedIn, logout, user, mergeUser } = useAuthStore();
    const { t } = useTranslation();
    const setLocale = useI18nStore((s) => s.setLocale);

    const handleLogout = () => {
        logout();
        notify.info(t('settings.signedOutTitle'), t('settings.signedOutMessage'));
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
    const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>(user?.favouriteTeamIds ?? []);
    const [trackerVisibility, setTrackerVisibility] = useState<TrackerVisibility>('PRIVATE');
    const [shareVerifiedOnly, setShareVerifiedOnly] = useState(true);
    const [savingTrackerPrivacy, setSavingTrackerPrivacy] = useState(false);
    const [showGamblingContent, setShowGamblingContent] = useState(false);

    const { data: adPrefs } = useAdPreferences(isLoggedIn && !!user?.id);
    const updateAdPrefMutation = useUpdateAdPreferences();
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const locale = useI18nStore((s) => s.locale);

    const { data: profileUser } = useGetOneUser(user?.id ?? 0, {
        query: { enabled: isLoggedIn && !!user?.id } as never,
    });

    useEffect(() => {
        if (profileUser) {
            mergeUser(profileUser);
        }
    }, [profileUser, mergeUser]);

    const { data: trackerPrivacy } = useTrackerPrivacy(isLoggedIn && !!user?.id);

    useEffect(() => {
        if (!trackerPrivacy) return;
        setTrackerVisibility(trackerPrivacy.trackerVisibility);
        setShareVerifiedOnly(trackerPrivacy.shareVerifiedOnly);
    }, [trackerPrivacy]);

    useEffect(() => {
        if (adPrefs) {
            setShowGamblingContent(adPrefs.showGamblingContent);
        }
    }, [adPrefs]);

    const handleGamblingToggle = (checked: boolean) => {
        setShowGamblingContent(checked);
        updateAdPrefMutation.mutate(
            { showGamblingContent: checked },
            {
                onSuccess: () => notify.success('Preferences saved', ''),
                onError: () => notify.error('Could not save', 'Please try again'),
            },
        );
    };

    const handleSaveTrackerPrivacy = async () => {
        setSavingTrackerPrivacy(true);
        try {
            const updated = await updateTrackerPrivacy({
                trackerVisibility,
                shareVerifiedOnly,
            });
            setTrackerVisibility(updated.trackerVisibility);
            setShareVerifiedOnly(updated.shareVerifiedOnly);
            notify.success(t('settings.trackerUpdated'), '');
        } catch (e) {
            notify.error(t('settings.couldNotSave'), e instanceof Error ? e.message : String(e));
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

    const favouriteTeamIds = user?.favouriteTeamIds ?? [];

    const { data: favouriteTeamsData = [] } = useGetQueryTeam(
        {
            where: { id: { $in: favouriteTeamIds.length ? favouriteTeamIds : [-1] } },
            take: 50,
        } as any,
        {
            query: {
                enabled: favouriteTeamIds.length > 0,
            } as any,
        },
    );

    const favouriteTeamsLabel = useMemo(
        () => favouriteTeamsData.map((team) => team.name).join(', '),
        [favouriteTeamsData],
    );

    const selectedTeamNames = useMemo(() => {
        const byId = new Map(favouriteTeamsData.map((team) => [team.id, team.name]));
        for (const team of teamsData) {
            byId.set(team.id, team.name);
        }
        return selectedTeamIds
            .map((id) => byId.get(id))
            .filter((name): name is string => Boolean(name));
    }, [selectedTeamIds, favouriteTeamsData, teamsData]);

    // Update user mutation
    const updateUserMutation = useUpdateOneUser({
        mutation: {
            onSuccess: (updated) => {
                notify.success('Success', 'Favourite teams updated successfully!');
                setIsEditingTeam(false);
                if (user && updated) {
                    const updatedUser = { ...user, ...updated, favouriteTeamIds: updated.favouriteTeamIds ?? selectedTeamIds };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    useAuthStore.setState((state) => ({ ...state, user: updatedUser }));
                }
            },
            onError: (error: any) => {
                notify.error('Error', error?.response?.data?.message || 'Failed to update favourite teams');
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

    const { data: commsPreferences } = useGetQueryCommsPreference(undefined, {
        query: { enabled: isLoggedIn && !!user?.id } as any,
    });
    const commsPreferenceData = commsPreferences?.[0];

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
            const nextLocale = commsLanguageToLocale(commsPreferenceData.language);
            if (nextLocale !== locale) {
                setLocale(nextLocale);
            }
        }
    }, [commsPreferenceData, locale, setLocale]);

    const updateCommsPrefMutation = useUpdateOneCommsPreference({
        mutation: {
            onSuccess: () => {
                notify.success(t('settings.prefsSavedTitle'), t('settings.prefsSavedMessage'));
            },
            onError: (error: any) => {
                notify.error(t('common.error'), error?.response?.data?.message || t('settings.couldNotSave'));
            },
        },
    });

    const handleSaveCommsPrefs = () => {
        if (!commsPreferenceData?.id) return;
        updateCommsPrefMutation.mutate({
            id: commsPreferenceData.id,
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

    // Get user data from auth store, refreshed from API when available
    const activeUser = profileUser ?? user;
    const userData = activeUser ? {
        firstName: activeUser.firstName ?? '',
        lastName: activeUser.lastName ?? '',
        userName: activeUser.userName ?? '',
        email: activeUser.email ?? '',
    } : {
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
    };


    // Team options for Autocomplete - results come directly from server-side search
    const teamOptions = useMemo(() => {
        return teamsData.map(team => ({
            value: team.id.toString(),
            label: team.name,
        }));
    }, [teamsData]);

    const frequencyOptions = useMemo(() => [
        { value: CommsPreferenceEmailNotifications.IMMEDIATE, label: t('frequency.immediate') },
        { value: CommsPreferenceEmailNotifications.DAILY, label: t('frequency.daily') },
        { value: CommsPreferenceEmailNotifications.WEEKLY, label: t('frequency.weekly') },
        { value: CommsPreferenceEmailNotifications.MONTHLY, label: t('frequency.monthly') },
        { value: CommsPreferenceEmailNotifications.NEVER, label: t('frequency.never') },
    ], [t]);

    const languageOptions = useMemo(() => [
        { value: CommsPreferenceLanguage.EN, label: t('languages.EN') },
        { value: CommsPreferenceLanguage.ES, label: t('languages.ES') },
        { value: CommsPreferenceLanguage.FR, label: t('languages.FR') },
        { value: CommsPreferenceLanguage.DE, label: t('languages.DE') },
        { value: CommsPreferenceLanguage.IT, label: t('languages.IT') },
        { value: CommsPreferenceLanguage.PT, label: t('languages.PT') },
    ], [t]);

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
        if (isLoggedIn && commsPreferenceData?.id) {
            updateCommsPrefMutation.mutate({
                id: commsPreferenceData.id,
                data: {
                    ...commsPreferenceData,
                    language,
                },
            });
        }
        notify.success(t('settings.savedTitle'), t('settings.savedMessage'));
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
        setTeamSearchValue('');
        setSelectedTeamIds(user?.favouriteTeamIds ?? []);
    };

    const handleSaveTeam = () => {
        if (user) {
            updateUserMutation.mutate({
                id: user.id,
                data: {
                    ...user,
                    favouriteTeamIds: selectedTeamIds,
                },
            });
        } else {
            setIsEditingTeam(false);
        }
    };

    const handleCancelEdit = () => {
        setTeamSearchValue('');
        setSelectedTeamIds(user?.favouriteTeamIds ?? []);
        setIsEditingTeam(false);
    };

    const handleTeamSelect = (value: string | null) => {
        if (!value) {
            setTeamSearchValue('');
            return;
        }
        const teamId = parseInt(value, 10);
        if (!Number.isFinite(teamId)) {
            return;
        }
        setSelectedTeamIds((prev) => (prev.includes(teamId) ? prev : [...prev, teamId]));
        const selectedTeam = teamsData.find((team) => team.id === teamId);
        setTeamSearchValue(selectedTeam?.name ?? '');
    };

    const handleRemoveTeam = (teamId: number) => {
        setSelectedTeamIds((prev) => prev.filter((id) => id !== teamId));
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
                {t('settings.title')}
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
                                    {t('settings.wallet')}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {t('settings.walletDescription')}
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
                                            {t('settings.fullName')}
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
                                            {t('settings.emailLabel')}
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
                                        <Stack gap="sm" style={{ paddingLeft: '28px' }}>
                                            {selectedTeamIds.length > 0 && (
                                                <Group gap="xs">
                                                    {selectedTeamIds.map((teamId, index) => (
                                                        <Chip
                                                            key={teamId}
                                                            checked
                                                            onChange={() => handleRemoveTeam(teamId)}
                                                        >
                                                            {selectedTeamNames[index] ?? `Team #${teamId}`}
                                                        </Chip>
                                                    ))}
                                                </Group>
                                            )}
                                            <Group gap="sm">
                                            <Autocomplete
                                                placeholder="Search to add a favourite team"
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
                                                disabled={selectedTeamIds.length === 0 || updateUserMutation.isPending}
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
                                        </Stack>
                                    ) : (
                                        <Text 
                                            style={{ 
                                                color: 'var(--modern-text-secondary)',
                                                paddingLeft: '28px',
                                            }}
                                        >
                                            {favouriteTeamsLabel || 'Not set'}
                                        </Text>
                                    )}
                                </Box>

                                <Box>
                                    {attendanceAdvancedStatsEnabled ? (
                                    <>
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
                                    </>
                                    ) : null}
                                </Box>
                            </Stack>

                            <Divider style={{ borderColor: 'var(--modern-border-color)' }} />

                            {/* Ad Preferences */}
                            <Box>
                                <Text fw={600} mb="xs" style={{ color: 'var(--modern-text-primary)' }}>
                                    Ad preferences
                                </Text>
                                <Text size="xs" c="dimmed" mb="sm">
                                    Control the types of ads you see on I Watch Football.
                                </Text>
                                <Stack gap="xs">
                                    <Group justify="space-between" align="flex-start">
                                        <Box style={{ flex: 1 }}>
                                            <Text size="sm" style={{ color: 'var(--modern-text-primary)' }}>
                                                Show betting &amp; gambling content
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                18+ only. Enable to see sponsored odds, promotions and betting partner content.
                                                You can turn this off at any time.
                                            </Text>
                                        </Box>
                                        <Switch
                                            checked={showGamblingContent}
                                            disabled={adPrefs?.selfExcluded || updateAdPrefMutation.isPending}
                                            onChange={(e) => handleGamblingToggle(e.currentTarget.checked)}
                                        />
                                    </Group>
                                    {adPrefs?.selfExcluded && (
                                        <Text size="xs" c="red">
                                            Self-exclusion is active on your account. Gambling content is permanently disabled.
                                        </Text>
                                    )}
                                </Stack>
                            </Box>

                            <Divider style={{ borderColor: 'var(--modern-border-color)' }} />

                            {/* Notification Preferences */}
                            {commsPreferenceData && (
                                <>
                                    <Box>
                                        <Group gap="sm" mb="md">
                                            <IconBell size={20} style={{ color: 'var(--modern-lime)' }} />
                                            <Text fw={600} style={{ color: 'var(--modern-text-primary)' }}>
                                                {t('settings.notifications')}
                                            </Text>
                                        </Group>

                                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                            <Box>
                                                <Text size="xs" mb={4} style={{ color: 'var(--modern-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {t('settings.channelEmail')}
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
                                                    {t('settings.sms')}
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
                                                    {t('settings.push')}
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
                                                    {t('settings.inApp')}
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
                                                    {t('settings.marketingEmails')}
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
                                                    {t('settings.newsletterEmails')}
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
                                                {t('settings.savePreferences')}
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
                            <Text style={{ color: 'var(--modern-text-primary)' }}>{t('settings.darkMode')}</Text>
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
                            <Text style={{ color: 'var(--modern-text-primary)' }}>{t('settings.language')}</Text>
                            <Select
                                value={language}
                                onChange={(value) => {
                                    if (value) {
                                        const next = value as LanguageType;
                                        setLanguage(next);
                                        setLocale(commsLanguageToLocale(next));
                                    }
                                }}
                                data={languageOptions}
                                style={{ width: 140 }}
                                styles={selectStyles}
                            />
                        </Group>

                    </Stack>

                    {/* Action Buttons */}
                <Group justify="flex-end" mt="lg">
                    <UiButton variant="outline" onClick={() => window.history.back()}>
                        {t('settings.cancel')}
                    </UiButton>
                    <UiButton onClick={handleSave}>
                        {t('settings.saveChanges')}
                    </UiButton>
                </Group>

                {/* Sign Out Section - Only shown when logged in */}
                {isLoggedIn && (
                    <>
                        <Divider my="xl" />
                        <Group justify="flex-end">
                            <UiButton variant="danger" onClick={handleLogout}>
                                {t('settings.signOut')}
                            </UiButton>
                        </Group>
                    </>
                )}
                </Stack>
            </Paper>
        </Container>
    );
}
