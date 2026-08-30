import { useEffect, useState } from 'react';
import {
    Badge,
    Button,
    Container,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { IconArrowLeft, IconEyeOff, IconLock, IconTrophy, IconUserOff } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { usePageTransition } from '../hooks/usePageTransition';
import {
    compareWithFriend,
    createPremiumCheckout,
    extractApiErrorMessage,
    getSubscriptionEntitlements,
    type CompareResult,
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

function StatCard({
    label,
    me,
    friend,
    winner,
}: {
    label: string;
    me: number;
    friend: number;
    winner?: 'me' | 'friend' | 'tie';
}) {
    return (
        <Paper p="md" withBorder radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">
                {label}
            </Text>
            <Group justify="space-between" align="flex-end">
                <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                        You
                    </Text>
                    <Text fw={700} size="xl" c={winner === 'me' ? 'teal' : undefined}>
                        {me}
                    </Text>
                </Stack>
                <Text c="dimmed">vs</Text>
                <Stack gap={0} align="flex-end">
                    <Text size="xs" c="dimmed">
                        Friend
                    </Text>
                    <Text fw={700} size="xl" c={winner === 'friend' ? 'teal' : undefined}>
                        {friend}
                    </Text>
                </Stack>
            </Group>
            {winner === 'tie' && (
                <Badge size="xs" variant="light" color="gray" mt="xs">
                    Tie
                </Badge>
            )}
            {winner === 'me' && (
                <Group gap={4} mt="xs">
                    <IconTrophy size={14} color="var(--mantine-color-teal-6)" />
                    <Text size="xs" c="teal">
                        You lead
                    </Text>
                </Group>
            )}
            {winner === 'friend' && (
                <Text size="xs" c="dimmed" mt="xs">
                    Friend leads
                </Text>
            )}
        </Paper>
    );
}

export function CompareFriendPage() {
    const { userId } = useParams<{ userId: string }>();
    const friendUserId = Number(userId);
    const { navigateWithTransition } = usePageTransition();
    const [loading, setLoading] = useState(true);
    const [premiumRequired, setPremiumRequired] = useState(false);
    const [compare, setCompare] = useState<CompareResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [checkoutBlockedReason, setCheckoutBlockedReason] = useState<string | null>(null);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        if (!friendUserId || Number.isNaN(friendUserId)) {
            setError('Invalid friend');
            setLoading(false);
            return;
        }

        void (async () => {
            setLoading(true);
            setError(null);
            setPremiumRequired(false);
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
                const result = await compareWithFriend(friendUserId);
                setCompare(result);
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
    }, [friendUserId]);

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const origin = window.location.origin;
            const { url } = await createPremiumCheckout(
                `${origin}/friends/compare/${friendUserId}?upgraded=1`,
                `${origin}/friends/compare/${friendUserId}`,
            );
            window.location.href = url;
        } catch (e) {
            notify.error('Upgrade unavailable', extractApiErrorMessage(e));
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) {
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
                        Compare with friends is included in Premium — side-by-side stats and matches you
                        attended together.
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

    if (error || !compare) {
        const isPrivacyError = error?.toLowerCase().includes('private');
        const isNotFriendsError = error?.toLowerCase().includes('friends only') || 
            error?.toLowerCase().includes('accepted friends');
        
        let title = 'Unable to compare';
        let helpText = 'Something went wrong while loading the comparison.';
        let ErrorIcon = IconUserOff;
        
        if (isPrivacyError) {
            title = 'Stats are private';
            helpText = 'This user has chosen to keep their tracker stats private. You can ask them to change their privacy settings if they want to compare.';
            ErrorIcon = IconEyeOff;
        } else if (isNotFriendsError) {
            title = 'Not friends yet';
            helpText = 'You can only compare stats with accepted friends. Make sure your friend request has been accepted.';
            ErrorIcon = IconUserOff;
        }

        return (
            <Container size="sm" py="xl">
                <Stack gap="md" align="center">
                    <ErrorIcon size={48} stroke={1.2} color="var(--mantine-color-gray-6)" />
                    <Title order={3}>{title}</Title>
                    <Text c="dimmed" ta="center" maw={400}>
                        {helpText}
                    </Text>
                    {error && !isPrivacyError && !isNotFriendsError && (
                        <Text size="sm" c="red" ta="center">
                            {error}
                        </Text>
                    )}
                    <Button variant="subtle" onClick={() => navigateWithTransition('/friends')}>
                        Back to friends
                    </Button>
                </Stack>
            </Container>
        );
    }

    const metrics = Object.keys(METRIC_LABELS) as (keyof TrackerSummary)[];

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    w="fit-content"
                    onClick={() => navigateWithTransition('/friends')}
                >
                    Friends
                </Button>

                <Stack gap={4}>
                    <Title order={2}>You vs @{compare.friend.userName}</Title>
                    <Text c="dimmed" size="sm">
                        {compare.friend.firstName} {compare.friend.lastName}
                    </Text>
                </Stack>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {metrics.map((key) => (
                        <StatCard
                            key={key}
                            label={METRIC_LABELS[key]}
                            me={compare.me.stats[key]}
                            friend={compare.friend.stats[key]}
                            winner={compare.winners[key]}
                        />
                    ))}
                </SimpleGrid>

                <Paper p="md" withBorder radius="md">
                    <Title order={4} mb="sm">
                        Matches together ({compare.overlap.count})
                    </Title>
                    {compare.overlap.fixtures.length === 0 ? (
                        <Text c="dimmed" size="sm">
                            No shared matches in your logs yet.
                        </Text>
                    ) : (
                        <Stack gap="xs">
                            {compare.overlap.fixtures.map((f) => (
                                <Group
                                    key={f.fixtureId}
                                    justify="space-between"
                                    wrap="nowrap"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigateWithTransition(`/match/${f.fixtureId}`)}
                                >
                                    <Text size="sm" fw={500}>
                                        {f.homeTeamName ?? 'Home'} vs {f.awayTeamName ?? 'Away'}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {new Date(f.date).toLocaleDateString()}
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
}
