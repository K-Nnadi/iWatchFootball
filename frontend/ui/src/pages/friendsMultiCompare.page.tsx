import { useCallback, useEffect, useState } from 'react';
import {
    ActionIcon,
    Alert,
    Avatar,
    Badge,
    Button,
    Checkbox,
    Container,
    Group,
    Loader,
    Paper,
    ScrollArea,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconChartBar,
    IconInfoCircle,
    IconLock,
    IconPlus,
    IconTrophy,
    IconX,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';
import {
    compareWithMultipleFriends,
    createPremiumCheckout,
    extractApiErrorMessage,
    getFriendsList,
    getSubscriptionEntitlements,
    MAX_MULTI_COMPARE_USERS,
    type CompareUserStats,
    type FriendListItem,
    type MultiCompareResult,
    type TrackerSummary,
} from '../shared/api/tracker.api';
import { notify } from '../shared/notify';

const METRIC_LABELS: Record<keyof TrackerSummary, string> = {
    totalMatches: 'Total matches',
    verifiedMatches: 'Verified matches',
    uniqueStadiums: 'Stadiums visited',
    uniqueTeams: 'Teams seen',
    uniqueCompetitions: 'Competitions',
};

const METRICS = Object.keys(METRIC_LABELS) as (keyof TrackerSummary)[];

function userInitials(user: { firstName: string; lastName: string; userName: string }): string {
    const f = user.firstName?.trim();
    const l = user.lastName?.trim();
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    const single = f || l;
    if (single) return single.slice(0, 2).toUpperCase();
    return user.userName.replace(/^@/, '').slice(0, 2).toUpperCase();
}

function FriendSelector({
    friends,
    selectedIds,
    onToggle,
    maxSelectable,
}: {
    friends: FriendListItem[];
    selectedIds: Set<number>;
    onToggle: (id: number) => void;
    maxSelectable: number;
}) {
    const canSelectMore = selectedIds.size < maxSelectable;

    return (
        <Stack gap="xs">
            {friends.map((friend) => {
                const isSelected = selectedIds.has(friend.id);
                const isDisabled = !isSelected && !canSelectMore;

                return (
                    <Paper
                        key={friend.id}
                        p="sm"
                        withBorder
                        radius="md"
                        style={{
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.5 : 1,
                            borderColor: isSelected ? 'var(--mantine-color-teal-6)' : undefined,
                            backgroundColor: isSelected ? 'rgba(0, 128, 128, 0.1)' : undefined,
                        }}
                        onClick={() => !isDisabled && onToggle(friend.id)}
                    >
                        <Group justify="space-between" wrap="nowrap">
                            <Group gap="sm" wrap="nowrap">
                                <Checkbox
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => onToggle(friend.id)}
                                    styles={{ input: { cursor: isDisabled ? 'not-allowed' : 'pointer' } }}
                                />
                                <Avatar size={36} radius="xl">
                                    {userInitials(friend)}
                                </Avatar>
                                <Stack gap={0}>
                                    <Text size="sm" fw={600}>
                                        @{friend.userName}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {friend.firstName} {friend.lastName}
                                    </Text>
                                </Stack>
                            </Group>
                        </Group>
                    </Paper>
                );
            })}
        </Stack>
    );
}

function ComparisonTable({
    result,
    onRemoveUser,
}: {
    result: MultiCompareResult;
    onRemoveUser: (userId: number) => void;
}) {
    const currentUserId = result.users[0]?.id;

    return (
        <ScrollArea>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ minWidth: 140 }}>Stat</Table.Th>
                        {result.users.map((user, index) => (
                            <Table.Th key={user.id} style={{ minWidth: 120, textAlign: 'center' }}>
                                <Stack gap={4} align="center">
                                    <Group gap={4} justify="center" wrap="nowrap">
                                        <Avatar size={28} radius="xl">
                                            {userInitials(user)}
                                        </Avatar>
                                        {index > 0 && (
                                            <ActionIcon
                                                size="xs"
                                                variant="subtle"
                                                color="red"
                                                onClick={() => onRemoveUser(user.id)}
                                            >
                                                <IconX size={12} />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                    <Text size="xs" fw={600}>
                                        {index === 0 ? 'You' : `@${user.userName}`}
                                    </Text>
                                    {user.shareVerifiedOnly && (
                                        <Badge size="xs" variant="light" color="blue">
                                            Verified only
                                        </Badge>
                                    )}
                                </Stack>
                            </Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {METRICS.map((metric) => {
                        const winnerId = result.winners[metric];
                        return (
                            <Table.Tr key={metric}>
                                <Table.Td>
                                    <Text size="sm" fw={500}>
                                        {METRIC_LABELS[metric]}
                                    </Text>
                                </Table.Td>
                                {result.users.map((user) => {
                                    const value = user.stats[metric];
                                    const isWinner = winnerId === user.id;
                                    const isCurrentUser = user.id === currentUserId;
                                    return (
                                        <Table.Td
                                            key={user.id}
                                            style={{
                                                textAlign: 'center',
                                                backgroundColor: isWinner
                                                    ? 'rgba(0, 128, 128, 0.15)'
                                                    : undefined,
                                            }}
                                        >
                                            <Group gap={4} justify="center" wrap="nowrap">
                                                {isWinner && (
                                                    <IconTrophy
                                                        size={14}
                                                        color="var(--mantine-color-teal-6)"
                                                    />
                                                )}
                                                <Text
                                                    size="lg"
                                                    fw={700}
                                                    c={
                                                        isWinner
                                                            ? 'teal'
                                                            : isCurrentUser
                                                              ? undefined
                                                              : 'dimmed'
                                                    }
                                                >
                                                    {value}
                                                </Text>
                                            </Group>
                                        </Table.Td>
                                    );
                                })}
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
}

export function MultiCompareFriendsPage() {
    const { navigateWithTransition } = usePageTransition();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedFriendIds, setSelectedFriendIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [premiumRequired, setPremiumRequired] = useState(false);
    const [checkoutBlockedReason, setCheckoutBlockedReason] = useState<string | null>(null);
    const [upgrading, setUpgrading] = useState(false);
    const [result, setResult] = useState<MultiCompareResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSelector, setShowSelector] = useState(true);

    const { data: friendsData, isLoading: friendsLoading } = useQuery({
        queryKey: ['friends'],
        queryFn: getFriendsList,
    });

    useEffect(() => {
        const idsParam = searchParams.get('ids');
        if (idsParam) {
            const ids = idsParam
                .split(',')
                .map((s) => parseInt(s, 10))
                .filter((n) => !Number.isNaN(n));
            if (ids.length > 0) {
                setSelectedFriendIds(new Set(ids));
                setShowSelector(false);
            }
        }
    }, []);

    useEffect(() => {
        if (selectedFriendIds.size === 0 || showSelector) return;

        void (async () => {
            setLoading(true);
            setError(null);
            try {
                const entitlements = await getSubscriptionEntitlements();
                if (!entitlements.isPremium) {
                    setPremiumRequired(true);
                    if (entitlements.checkoutAvailable === false) {
                        setCheckoutBlockedReason(
                            entitlements.checkoutUnavailableReason ??
                                'Premium checkout is not configured on the server.',
                        );
                    }
                    setLoading(false);
                    return;
                }

                const compareResult = await compareWithMultipleFriends(Array.from(selectedFriendIds));
                setResult(compareResult);

                const ids = Array.from(selectedFriendIds).join(',');
                setSearchParams({ ids }, { replace: true });
            } catch (e) {
                const msg = extractApiErrorMessage(e);
                if (msg.toLowerCase().includes('premium')) {
                    setPremiumRequired(true);
                } else {
                    setError(msg);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [selectedFriendIds, showSelector, setSearchParams]);

    const handleToggleFriend = useCallback((friendId: number) => {
        setSelectedFriendIds((prev) => {
            const next = new Set(prev);
            if (next.has(friendId)) {
                next.delete(friendId);
            } else {
                next.add(friendId);
            }
            return next;
        });
    }, []);

    const handleCompare = () => {
        if (selectedFriendIds.size === 0) {
            notify.error('Select friends', 'Please select at least one friend to compare with.');
            return;
        }
        setShowSelector(false);
    };

    const handleAddMore = () => {
        setShowSelector(true);
    };

    const handleRemoveUser = (userId: number) => {
        setSelectedFriendIds((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
        });
        if (selectedFriendIds.size <= 1) {
            setShowSelector(true);
            setResult(null);
        }
    };

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const origin = window.location.origin;
            const { url } = await createPremiumCheckout(
                `${origin}/friends/compare-multi?upgraded=1`,
                `${origin}/friends/compare-multi`,
            );
            window.location.href = url;
        } catch (e) {
            notify.error('Upgrade unavailable', extractApiErrorMessage(e));
        } finally {
            setUpgrading(false);
        }
    };

    if (friendsLoading) {
        return (
            <Container py="xl">
                <Loader />
            </Container>
        );
    }

    if (premiumRequired) {
        return (
            <Container size="sm" py="xl">
                <Stack gap="md" align="center">
                    <IconLock size={48} stroke={1.2} />
                    <Title order={3}>Premium feature</Title>
                    <Text c="dimmed" ta="center">
                        Compare with friends is included in Premium — compare multiple friends
                        side-by-side.
                    </Text>
                    {checkoutBlockedReason && (
                        <Text size="sm" c="orange" ta="center" maw={420}>
                            {checkoutBlockedReason}
                        </Text>
                    )}
                    <Button loading={upgrading} onClick={() => void handleUpgrade()}>
                        Upgrade to Premium
                    </Button>
                    <Button variant="subtle" onClick={() => navigateWithTransition('/friends')}>
                        Back to friends
                    </Button>
                </Stack>
            </Container>
        );
    }

    const friends = friendsData?.friends ?? [];
    const anyVerifiedOnly = result?.users.some((u) => u.shareVerifiedOnly) ?? false;

    return (
        <Container size="lg" py="xl">
            <Stack gap="lg">
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    w="fit-content"
                    onClick={() => navigateWithTransition('/friends')}
                >
                    Friends
                </Button>

                <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                        <Group gap="sm">
                            <IconChartBar size={24} color="var(--mantine-color-teal-6)" />
                            <Title order={2}>Compare Friends</Title>
                        </Group>
                        <Text c="dimmed" size="sm">
                            Select up to {MAX_MULTI_COMPARE_USERS - 1} friends to compare stats
                            side-by-side
                        </Text>
                    </Stack>
                    {!showSelector && result && selectedFriendIds.size < MAX_MULTI_COMPARE_USERS - 1 && (
                        <Button
                            variant="light"
                            leftSection={<IconPlus size={16} />}
                            onClick={handleAddMore}
                        >
                            Add friend
                        </Button>
                    )}
                </Group>

                {showSelector && (
                    <Paper p="lg" withBorder radius="md">
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Text fw={600}>Select friends to compare</Text>
                                <Badge variant="light">
                                    {selectedFriendIds.size} / {MAX_MULTI_COMPARE_USERS - 1} selected
                                </Badge>
                            </Group>

                            {friends.length === 0 ? (
                                <Text c="dimmed" ta="center" py="xl">
                                    You don't have any friends yet. Add some friends first!
                                </Text>
                            ) : (
                                <>
                                    <FriendSelector
                                        friends={friends}
                                        selectedIds={selectedFriendIds}
                                        onToggle={handleToggleFriend}
                                        maxSelectable={MAX_MULTI_COMPARE_USERS - 1}
                                    />
                                    <Button
                                        fullWidth
                                        disabled={selectedFriendIds.size === 0}
                                        onClick={handleCompare}
                                    >
                                        Compare {selectedFriendIds.size > 0 ? `(${selectedFriendIds.size})` : ''}
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Paper>
                )}

                {loading && (
                    <Paper p="xl" withBorder radius="md">
                        <Stack align="center" gap="md">
                            <Loader />
                            <Text c="dimmed">Loading comparison...</Text>
                        </Stack>
                    </Paper>
                )}

                {error && (
                    <Alert color="red" title="Error">
                        {error}
                    </Alert>
                )}

                {!showSelector && result && !loading && (
                    <>
                        {anyVerifiedOnly && (
                            <Alert
                                variant="light"
                                color="blue"
                                icon={<IconInfoCircle size={18} />}
                                title="Stats based on verified matches"
                            >
                                <Text size="sm">
                                    Some users have "Only share verified match logs" enabled. Their
                                    stats only include matches with uploaded ticket proof.
                                </Text>
                                <Text size="xs" c="dimmed" mt="xs">
                                    You can change this in Settings → Privacy.
                                </Text>
                            </Alert>
                        )}

                        <Paper p="md" withBorder radius="md">
                            <ComparisonTable result={result} onRemoveUser={handleRemoveUser} />
                        </Paper>
                    </>
                )}
            </Stack>
        </Container>
    );
}
