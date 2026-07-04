import { useCallback, useEffect, useState } from 'react';
import {
    Badge,
    Box,
    Button,
    Center,
    Container,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { IconSearch, IconTicketOff, IconX } from '@tabler/icons-react';
import {
    cancelTicketInterest,
    getMyTicketInterests,
    type TicketInterest,
} from '../../shared/api/ticketInterest.api';
import { notify } from '../../shared/notify';

export function MyInterestsPage() {
    const [interests, setInterests] = useState<TicketInterest[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const fetchInterests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyTicketInterests();
            setInterests(data);
        } catch {
            notify.error('Could not load interests', 'Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchInterests();
    }, [fetchInterests]);

    const handleCancel = async (id: number) => {
        setCancellingId(id);
        try {
            await cancelTicketInterest(id);
            setInterests((prev) => prev.map((i) => i.id === id ? { ...i, status: 'CANCELLED' as const } : i));
            notify.success('Interest cancelled', 'You\'ve been removed from the waiting list for this match.');
        } catch {
            notify.error('Could not cancel', 'Please try again.');
        } finally {
            setCancellingId(null);
        }
    };

    const STATUS_COLOR: Record<TicketInterest['status'], string> = {
        ACTIVE: 'green',
        NOTIFIED: 'blue',
        CANCELLED: 'gray',
    };

    const active = interests.filter((i) => i.status === 'ACTIVE');
    const past = interests.filter((i) => i.status !== 'ACTIVE');

    const renderInterestCard = (interest: TicketInterest) => (
        <Paper key={interest.id} p="md" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
                <Stack gap={4} style={{ flex: 1 }}>
                    <Group gap="xs">
                        <Text size="sm" fw={600}>Fixture #{interest.fixtureId}</Text>
                        <Badge size="xs" color={STATUS_COLOR[interest.status]}>{interest.status}</Badge>
                    </Group>
                    <Group gap="xs" wrap="wrap">
                        <Text size="xs" c="dimmed">{interest.quantity} ticket{interest.quantity > 1 ? 's' : ''}</Text>
                        {interest.maxPriceGbp && (
                            <Text size="xs" c="dimmed">· up to £{interest.maxPriceGbp}</Text>
                        )}
                        {interest.preferredStand && (
                            <Badge size="xs" variant="outline">{interest.preferredStand}</Badge>
                        )}
                        {interest.wantsNotification && interest.status === 'ACTIVE' && (
                            <Badge size="xs" color="blue" variant="light">Notify me</Badge>
                        )}
                    </Group>
                </Stack>
                {interest.status === 'ACTIVE' && (
                    <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        leftSection={cancellingId === interest.id ? <Loader size="xs" /> : <IconX size={13} />}
                        disabled={cancellingId === interest.id}
                        onClick={() => void handleCancel(interest.id)}
                    >
                        Cancel
                    </Button>
                )}
            </Group>
        </Paper>
    );

    return (
        <Container size="md" py="xl">
            <Group mb="lg" gap="sm">
                <IconTicketOff size={28} color="var(--mantine-color-yellow-5)" />
                <Title order={2}>Ticket Interests</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="xl">
                Matches you're looking for tickets for. We'll notify you when resale becomes available.
            </Text>

            {loading ? (
                <Center py="xl"><Loader /></Center>
            ) : interests.length === 0 ? (
                <Paper p="xl" radius="md" withBorder ta="center">
                    <IconSearch size={48} color="var(--mantine-color-dimmed)" style={{ margin: '0 auto 1rem' }} />
                    <Text fw={600} mb="xs">No interests registered</Text>
                    <Text size="sm" c="dimmed">Find a match page and register your interest to get notified when tickets become available.</Text>
                </Paper>
            ) : (
                <Stack gap="lg">
                    {active.length > 0 && (
                        <Stack gap="xs">
                            <Text size="sm" fw={600} c="dimmed">ACTIVE ({active.length})</Text>
                            {active.map(renderInterestCard)}
                        </Stack>
                    )}
                    {past.length > 0 && (
                        <Stack gap="xs">
                            <Text size="sm" fw={600} c="dimmed">PAST</Text>
                            {past.map(renderInterestCard)}
                        </Stack>
                    )}
                </Stack>
            )}
        </Container>
    );
}
