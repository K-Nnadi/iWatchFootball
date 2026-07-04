import { useState } from 'react';
import {
    Button,
    Checkbox,
    Group,
    Modal,
    NumberInput,
    Select,
    Stack,
    Text,
    TextInput,
    Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notify } from '../../shared/notify';
import {
    cancelAttendance,
    upsertAttendance,
    type AttendanceRecord,
} from '../../shared/api/attendance.api';
import { TicketUploadPanel } from './TicketUploadPanel';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';

interface AttendanceModalProps {
    fixtureId: number;
    existing: AttendanceRecord | null;
    opened: boolean;
    onClose: () => void;
    onSaved: (record: AttendanceRecord) => void;
}

const TICKET_PROVIDERS = ['Club website', 'Ticketmaster', 'See Tickets', 'AXS', 'Viagogo', 'Stubhub', 'Other'];

export function AttendanceModal({ fixtureId, existing, opened, onClose, onSaved }: AttendanceModalProps) {
    const ticketDocumentUploadEnabled = usePlatformFeaturesStore((s) => s.ticketDocumentUploadEnabled);
    const [hasTicket, setHasTicket] = useState(existing?.hasTicket ?? false);
    const [seatSection, setSeatSection] = useState(existing?.seatSection ?? '');
    const [seatBlock, setSeatBlock] = useState(existing?.seatBlock ?? '');
    const [seatRow, setSeatRow] = useState(existing?.seatRow ?? '');
    const [seatNumber, setSeatNumber] = useState(existing?.seatNumber ?? '');
    const [ticketProvider, setTicketProvider] = useState<string | null>(existing?.ticketProvider ?? null);
    const [purchaseDate, setPurchaseDate] = useState<Date | null>(
        existing?.purchaseDate ? new Date(existing.purchaseDate) : null,
    );
    const [notes, setNotes] = useState(existing?.notes ?? '');
    const [saving, setSaving] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await upsertAttendance({
                fixtureId,
                hasTicket,
                seatSection: seatSection || undefined,
                seatBlock: seatBlock || undefined,
                seatRow: seatRow || undefined,
                seatNumber: seatNumber || undefined,
                ticketProvider: ticketProvider ?? undefined,
                purchaseDate: purchaseDate?.toISOString().split('T')[0] ?? undefined,
                notes: notes || undefined,
            });
            notify.success('Attendance saved', hasTicket ? 'Your ticket details have been saved.' : 'You\'re marked as going.');
            onSaved(saved);
        } catch {
            notify.error('Could not save', 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        if (!existing) return;
        setCancelling(true);
        try {
            await cancelAttendance(existing.id);
            notify.success('Attendance cancelled', 'You\'ve been removed from the going list.');
            onClose();
        } catch {
            notify.error('Could not cancel', 'Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={existing ? 'Update attendance' : 'I\'m going!'}
            size="md"
            centered
        >
            <Stack gap="md">
                <Checkbox
                    label="I have a ticket"
                    checked={hasTicket}
                    onChange={(e) => setHasTicket(e.currentTarget.checked)}
                />

                {hasTicket && (
                    <>
                        <Text size="sm" fw={500} c="dimmed">Seat details (optional)</Text>
                        <Group grow>
                            <TextInput
                                label="Section / Stand"
                                placeholder="e.g. North Stand"
                                value={seatSection}
                                onChange={(e) => setSeatSection(e.currentTarget.value)}
                                maxLength={100}
                            />
                            <TextInput
                                label="Block"
                                placeholder="e.g. A"
                                value={seatBlock}
                                onChange={(e) => setSeatBlock(e.currentTarget.value)}
                                maxLength={50}
                            />
                        </Group>
                        <Group grow>
                            <TextInput
                                label="Row"
                                placeholder="e.g. 12"
                                value={seatRow}
                                onChange={(e) => setSeatRow(e.currentTarget.value)}
                                maxLength={20}
                            />
                            <TextInput
                                label="Seat"
                                placeholder="e.g. 45"
                                value={seatNumber}
                                onChange={(e) => setSeatNumber(e.currentTarget.value)}
                                maxLength={20}
                            />
                        </Group>
                        <Select
                            label="Ticket provider"
                            placeholder="Where did you buy it?"
                            data={TICKET_PROVIDERS}
                            value={ticketProvider}
                            onChange={setTicketProvider}
                            clearable
                        />
                        <DatePickerInput
                            label="Purchase date"
                            placeholder="When did you buy it?"
                            value={purchaseDate}
                            onChange={setPurchaseDate}
                            clearable
                        />
                    </>
                )}

                <Textarea
                    label="Notes"
                    placeholder="Any notes about this match…"
                    value={notes}
                    onChange={(e) => setNotes(e.currentTarget.value)}
                    maxLength={500}
                    rows={2}
                />

                {ticketDocumentUploadEnabled && existing && hasTicket && (
                    <TicketUploadPanel attendanceId={existing.id} hasDocument={existing.hasDocument} />
                )}

                <Group justify="space-between" mt="sm">
                    {existing ? (
                        <Button
                            variant="subtle"
                            color="red"
                            size="sm"
                            loading={cancelling}
                            onClick={() => void handleCancel()}
                        >
                            Remove attendance
                        </Button>
                    ) : (
                        <span />
                    )}
                    <Group gap="xs">
                        <Button variant="subtle" size="sm" onClick={onClose} disabled={saving || cancelling}>
                            Cancel
                        </Button>
                        <Button size="sm" loading={saving} onClick={() => void handleSave()}>
                            {existing ? 'Update' : 'Mark as going'}
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
}
