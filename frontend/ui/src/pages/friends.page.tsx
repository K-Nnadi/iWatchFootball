import { useCallback, useEffect, useState } from 'react';
import {
    ActionIcon,
    Autocomplete,
    Avatar,
    Badge,
    Box,
    Container,
    Group,
    Loader,
    Stack,
    Text,
} from '@mantine/core';
import {
    IconChartBar,
    IconCheck,
    IconClock,
    IconTrash,
    IconUserPlus,
    IconUsers,
    IconX,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePageTransition } from '../hooks/usePageTransition';
import { useTranslation } from '../i18n/useTranslation';
import { notify } from '../shared/notify';
import { ModernButton, ModernCard, ModernH2, ModernBody, ModernCaption } from '../components/modern';
import {
    acceptFriendRequest,
    declineFriendRequest,
    getFriendsList,
    removeFriend,
    searchUsers,
    sendFriendRequest,
    type PendingFriendRequest,
    type PublicUserSummary,
} from '../shared/api/tracker.api';

function userInitials(user: { firstName: string; lastName: string; userName: string }): string {
    const f = user.firstName?.trim();
    const l = user.lastName?.trim();
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    const single = f || l;
    if (single) return single.slice(0, 2).toUpperCase();
    return user.userName.replace(/^@/, '').slice(0, 2).toUpperCase();
}

function PendingRequestRow({
    request,
    onAccept,
    onDecline,
}: {
    request: PendingFriendRequest;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}) {
    const { t } = useTranslation();
    const isIncoming = request.direction === 'incoming';

    return (
        <Box
            p="md"
            style={{
                backgroundColor: 'var(--modern-bg-primary)',
                border: '1px solid var(--modern-border-color)',
            }}
        >
            <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Avatar
                        size={44}
                        radius="xl"
                        style={{
                            backgroundColor: 'var(--modern-bg-tertiary)',
                            border: '2px solid var(--modern-lime)',
                            color: 'var(--modern-lime)',
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {userInitials(request.user)}
                    </Avatar>
                    <Stack gap={2} style={{ minWidth: 0 }}>
                        <Text fw={600} size="sm" c="var(--modern-text-primary)" truncate>
                            @{request.user.userName}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>
                            {request.user.firstName} {request.user.lastName}
                        </Text>
                        <Text size="xs" c={isIncoming ? 'var(--modern-lime)' : 'dimmed'}>
                            {isIncoming ? t('friends.wantsToBeFriends') : t('friends.waitingForResponse')}
                        </Text>
                    </Stack>
                </Group>

                {isIncoming ? (
                    <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                        <ModernButton
                            size="sm"
                            variant="primary"
                            leftSection={<IconCheck size={16} stroke={2.5} />}
                            onClick={() => onAccept(request.connectionId)}
                            styles={{
                                root: {
                                    minWidth: 96,
                                    paddingLeft: 14,
                                    paddingRight: 14,
                                },
                            }}
                        >
                            {t('friends.accept')}
                        </ModernButton>
                        <ModernButton
                            size="sm"
                            variant="outline"
                            leftSection={<IconX size={16} stroke={2.5} />}
                            onClick={() => onDecline(request.connectionId)}
                            styles={{
                                root: {
                                    minWidth: 96,
                                    paddingLeft: 14,
                                    paddingRight: 14,
                                    backgroundColor: 'transparent',
                                    border: '2px solid var(--modern-border-color)',
                                    color: 'var(--modern-text-secondary)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 80, 80, 0.08)',
                                        borderColor: 'var(--mantine-color-red-6)',
                                        color: 'var(--mantine-color-red-4)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: 'none',
                                    },
                                },
                            }}
                        >
                            {t('friends.decline')}
                        </ModernButton>
                    </Group>
                ) : (
                    <Badge
                        variant="outline"
                        color="gray"
                        size="lg"
                        radius="sm"
                        leftSection={<IconClock size={14} />}
                        styles={{
                            root: {
                                textTransform: 'none',
                                fontWeight: 500,
                                borderColor: 'var(--modern-border-color)',
                                color: 'var(--modern-text-secondary)',
                                flexShrink: 0,
                            },
                        }}
                    >
                        {t('friends.pending')}
                    </Badge>
                )}
            </Group>
        </Box>
    );
}

export function FriendsPage() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const queryClient = useQueryClient();
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<PublicUserSummary[]>([]);
    const [searching, setSearching] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['friends'],
        queryFn: getFriendsList,
    });

    useEffect(() => {
        const q = searchValue.trim();
        if (q.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            setSearching(true);
            void searchUsers(q)
                .then(setSearchResults)
                .catch(() => setSearchResults([]))
                .finally(() => setSearching(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchValue]);

    const invalidate = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ['friends'] });
        await refetch();
    }, [queryClient, refetch]);

    const handleAddFriend = async (user: PublicUserSummary) => {
        try {
            await sendFriendRequest({ userId: user.id });
            notify.success(t('friends.requestSentTitle'), t('friends.requestSentMessage', { userName: user.userName }));
            setSearchValue('');
            setSearchResults([]);
            await invalidate();
        } catch (e) {
            notify.error(t('friends.couldNotSend'), e instanceof Error ? e.message : String(e));
        }
    };

    const handleAccept = async (connectionId: number) => {
        try {
            await acceptFriendRequest(connectionId);
            notify.success(t('friends.friendAdded'), '');
            await invalidate();
        } catch (e) {
            notify.error(t('friends.couldNotAccept'), e instanceof Error ? e.message : String(e));
        }
    };

    const handleDecline = async (connectionId: number) => {
        try {
            await declineFriendRequest(connectionId);
            await invalidate();
        } catch (e) {
            notify.error(t('friends.couldNotDecline'), e instanceof Error ? e.message : String(e));
        }
    };

    const handleRemove = async (connectionId: number) => {
        try {
            await removeFriend(connectionId);
            notify.info(t('friends.friendRemoved'), '');
            await invalidate();
        } catch (e) {
            notify.error(t('friends.couldNotRemove'), e instanceof Error ? e.message : String(e));
        }
    };

    const autocompleteData = searchResults.map((u) => ({
        value: String(u.id),
        label: `@${u.userName} — ${u.firstName} ${u.lastName}`,
    }));

    const incomingCount = data?.pending.filter((p) => p.direction === 'incoming').length ?? 0;

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Group gap="sm">
                    <IconUsers size={28} color="var(--modern-lime)" />
                    <ModernH2>{t('friends.title')}</ModernH2>
                </Group>
                <ModernBody style={{ color: 'var(--modern-text-secondary)' }}>
                    {t('friends.description')}
                </ModernBody>

                <ModernCard padding="md">
                    <Stack gap="sm">
                        <Group gap="xs">
                            <IconUserPlus size={18} color="var(--modern-lime)" />
                            <Text fw={600} c="var(--modern-text-primary)">
                                {t('friends.findPeople')}
                            </Text>
                        </Group>
                        <Autocomplete
                            placeholder={t('friends.searchPlaceholder')}
                            value={searchValue}
                            onChange={setSearchValue}
                            data={autocompleteData}
                            onOptionSubmit={(value) => {
                                const user = searchResults.find((u) => String(u.id) === value);
                                if (user) void handleAddFriend(user);
                            }}
                            rightSection={searching ? <Loader size="xs" /> : null}
                            styles={{
                                input: {
                                    backgroundColor: 'var(--modern-bg-primary)',
                                    border: '1px solid var(--modern-border-color)',
                                    color: 'var(--modern-text-primary)',
                                    borderRadius: 0,
                                },
                                dropdown: {
                                    backgroundColor: 'var(--modern-card-bg)',
                                    border: '1px solid var(--modern-border-color)',
                                },
                            }}
                        />
                    </Stack>
                </ModernCard>

                {isLoading ? (
                    <Loader color="var(--modern-lime)" />
                ) : (
                    <>
                        {(data?.pending?.length ?? 0) > 0 && (
                            <ModernCard padding="md">
                                <Group justify="space-between" mb="md">
                                    <Text fw={600} c="var(--modern-text-primary)">
                                        {t('friends.pendingRequests')}
                                    </Text>
                                    {incomingCount > 0 && (
                                        <Badge
                                            variant="filled"
                                            style={{
                                                backgroundColor: 'var(--modern-lime)',
                                                color: 'var(--modern-black)',
                                            }}
                                        >
                                            {t('friends.newCount', { count: incomingCount })}
                                        </Badge>
                                    )}
                                </Group>
                                <Stack gap={0}>
                                    {data!.pending.map((p, i) => (
                                        <Box
                                            key={p.connectionId}
                                            style={
                                                i > 0
                                                    ? { borderTop: '1px solid var(--modern-border-color)' }
                                                    : undefined
                                            }
                                        >
                                            <PendingRequestRow
                                                request={p}
                                                onAccept={(id) => void handleAccept(id)}
                                                onDecline={(id) => void handleDecline(id)}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </ModernCard>
                        )}

                        <ModernCard padding="md">
                            <Text fw={600} mb="md" c="var(--modern-text-primary)">
                                {t('friends.yourFriends', { count: data?.friends.length ?? 0 })}
                            </Text>
                            {(data?.friends.length ?? 0) === 0 ? (
                                <ModernCaption style={{ color: 'var(--modern-text-secondary)' }}>
                                    {t('friends.emptyFriends')}
                                </ModernCaption>
                            ) : (
                                <Stack gap={0}>
                                    {data!.friends.map((f, i) => (
                                        <Box
                                            key={f.connectionId}
                                            p="md"
                                            style={{
                                                backgroundColor: 'var(--modern-bg-primary)',
                                                border: '1px solid var(--modern-border-color)',
                                                borderTop:
                                                    i > 0
                                                        ? 'none'
                                                        : undefined,
                                                borderBottom:
                                                    i < data!.friends.length - 1
                                                        ? 'none'
                                                        : undefined,
                                            }}
                                        >
                                            <Group justify="space-between" wrap="nowrap" gap="md">
                                                <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                                                    <Avatar
                                                        size={44}
                                                        radius="xl"
                                                        style={{
                                                            backgroundColor: 'var(--modern-bg-tertiary)',
                                                            border: '2px solid var(--modern-border-color)',
                                                            color: 'var(--modern-text-primary)',
                                                            fontWeight: 700,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {userInitials(f)}
                                                    </Avatar>
                                                    <Stack gap={2} style={{ minWidth: 0 }}>
                                                        <Text fw={600} size="sm" truncate>
                                                            @{f.userName}
                                                        </Text>
                                                        <Text size="xs" c="dimmed" truncate>
                                                            {f.firstName} {f.lastName}
                                                        </Text>
                                                    </Stack>
                                                </Group>
                                                <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                                                    <ModernButton
                                                        size="sm"
                                                        variant="outline"
                                                        leftSection={<IconChartBar size={16} />}
                                                        onClick={() =>
                                                            navigateWithTransition(`/friends/compare/${f.id}`)
                                                        }
                                                    >
                                                        {t('friends.compare')}
                                                    </ModernButton>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        size="lg"
                                                        aria-label={t('friends.removeFriend')}
                                                        onClick={() => void handleRemove(f.connectionId)}
                                                        style={{
                                                            border: '1px solid var(--modern-border-color)',
                                                        }}
                                                    >
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            </Group>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </ModernCard>
                    </>
                )}
            </Stack>
        </Container>
    );
}
