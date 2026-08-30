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
import {
    IconCalendarCheck,
    IconCalendarX,
    IconChevronRight,
    IconFileText,
    IconTicket,
} from '@tabler/icons-react';
import { cancelAttendance, getMyAttendance, getAttendanceDocumentUrl, type AttendanceRecord } from '../../shared/api/attendance.api';
import { notify } from '../../shared/notify';
import { AttendanceModal } from '../../components/attendance/AttendanceModal';

export function AttendanceHistoryPage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyAttendance();
            setRecords(data);
        } catch {
            notify.error('Could not load attendance', 'Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchRecords();
    }, [fetchRecords]);

    const handleSaved = (updated: AttendanceRecord) => {
        setRecords((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r)).concat(
                prev.some((r) => r.id === updated.id) ? [] : [updated],
            ),
        );
        setEditRecord(null);
    };

    const handleCancel = async (id: number) => {
        try {
            await cancelAttendance(id);
            setRecords((prev) => prev.filter((r) => r.id !== id));
            notify.success('Attendance removed', 'Match removed from your attendance history.');
        } catch {
            notify.error('Could not remove', 'Please try again.');
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    const renderRecord = (record: AttendanceRecord) => (
        <Paper key={record.id} p="md" radius="md" withBorder>
            <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={4} style={{ flex: 1 }}>
                    <Group gap="xs" align="center">
                        <IconCalendarCheck size={16} color="var(--mantine-color-green-5)" />
                        <Text size="sm" fw={600}>Fixture #{record.fixtureId}</Text>
                        <Text size="xs" c="dimmed">{formatDate(record.createdAt)}</Text>
                        {record.fixtureInvalidationReason === 'CANCELLED' && (
                            <Badge size="xs" color="red">Match cancelled</Badge>
                        )}
                        {record.fixtureInvalidationReason === 'POSTPONED' && (
                            <Badge size="xs" color="orange">Match postponed</Badge>
                        )}
                        {record.fixtureInvalidationReason === 'SUSPENDED' && (
                            <Badge size="xs" color="orange">Match suspended</Badge>
                        )}
                    </Group>

                    <Group gap="xs" mt={4} wrap="wrap">
                        {record.hasTicket && (
                            <Badge size="xs" color="green" leftSection={<IconTicket size={10} />}>
                                Has ticket
                            </Badge>
                        )}
                        {record.seatSection && (
                            <Badge size="xs" variant="outline">{record.seatSection}{record.seatBlock ? ` · ${record.seatBlock}` : ''}</Badge>
                        )}
                        {record.seatRow && record.seatNumber && (
                            <Badge size="xs" variant="outline">Row {record.seatRow} · Seat {record.seatNumber}</Badge>
                        )}
                        {record.ticketProvider && (
                            <Badge size="xs" variant="light">{record.ticketProvider}</Badge>
                        )}
                        {record.hasDocument && (
                            <Badge size="xs" color="blue" leftSection={<IconFileText size={10} />}>
                                Document saved
                            </Badge>
                        )}
                    </Group>

                    {record.notes && (
                        <Text size="xs" c="dimmed" mt={4} lineClamp={2}>{record.notes}</Text>
                    )}
                </Stack>

                <Group gap="xs" align="center" style={{ flexShrink: 0 }}>
                    {record.hasDocument && (
                        <Button
                            component="a"
                            href={getAttendanceDocumentUrl(record.id)}
                            target="_blank"
                            size="xs"
                            variant="subtle"
                            leftSection={<IconFileText size={13} />}
                        >
                            View
                        </Button>
                    )}
                    <Button
                        size="xs"
                        variant="subtle"
                        rightSection={<IconChevronRight size={13} />}
                        onClick={() => setEditRecord(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        leftSection={<IconCalendarX size={13} />}
                        onClick={() => void handleCancel(record.id)}
                    >
                        Remove
                    </Button>
                </Group>
            </Group>
        </Paper>
    );

    return (
        <Container size="md" py="xl">
            <Group mb="lg" gap="sm">
                <IconCalendarCheck size={28} color="var(--mantine-color-green-5)" />
                <Title order={2}>My Attendance</Title>
            </Group>

            <Text size="sm" c="dimmed" mb="xl">
                Matches you've marked yourself as attending. Ticket details and documents are private to you.
            </Text>

            {loading ? (
                <Center py="xl"><Loader /></Center>
            ) : records.length === 0 ? (
                <Paper p="xl" radius="md" withBorder ta="center">
                    <IconCalendarCheck size={48} color="var(--mantine-color-dimmed)" style={{ margin: '0 auto 1rem' }} />
                    <Text fw={600} mb="xs">No matches yet</Text>
                    <Text size="sm" c="dimmed">Mark yourself as going on a match page to start tracking attendance.</Text>
                </Paper>
            ) : (
                <Stack gap="sm">
                    {records.map(renderRecord)}
                </Stack>
            )}

            {editRecord && (
                <AttendanceModal
                    fixtureId={editRecord.fixtureId}
                    existing={editRecord}
                    opened={editRecord !== null}
                    onClose={() => setEditRecord(null)}
                    onSaved={handleSaved}
                />
            )}
        </Container>
    );
}
