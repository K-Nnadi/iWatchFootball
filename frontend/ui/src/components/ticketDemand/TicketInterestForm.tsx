import { useState } from 'react';
import {
    Button,
    Checkbox,
    Group,
    Modal,
    NumberInput,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import { createTicketInterest } from '../../shared/api/ticketInterest.api';
import { notify } from '../../shared/notify';

interface TicketInterestFormProps {
    fixtureId: number;
    opened: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export function TicketInterestForm({ fixtureId, opened, onClose, onSaved }: TicketInterestFormProps) {
    const [quantity, setQuantity] = useState<number | string>(1);
    const [maxPrice, setMaxPrice] = useState<number | string>('');
    const [preferredStand, setPreferredStand] = useState('');
    const [wantsNotification, setWantsNotification] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await createTicketInterest({
                fixtureId,
                quantity: Number(quantity) || 1,
                maxPriceGbp: maxPrice !== '' ? Number(maxPrice) : undefined,
                preferredStand: preferredStand || undefined,
                wantsNotification,
            });
            notify.success('Interest registered', 'We\'ll let you know when resale tickets are available.');
            onSaved();
        } catch {
            notify.error('Could not save', 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Looking for a ticket?"
            size="sm"
            centered
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    Register your interest and we'll notify you when resale tickets become available for this match.
                </Text>

                <NumberInput
                    label="Tickets wanted"
                    description="How many tickets do you need?"
                    min={1}
                    max={4}
                    value={quantity}
                    onChange={setQuantity}
                />

                <NumberInput
                    label="Max price per ticket (£)"
                    description="Optional — helps us understand demand"
                    prefix="£"
                    min={0}
                    decimalScale={2}
                    value={maxPrice}
                    onChange={setMaxPrice}
                    placeholder="No limit"
                />

                <TextInput
                    label="Preferred stand / area"
                    placeholder="e.g. North Stand, Away End"
                    value={preferredStand}
                    onChange={(e) => setPreferredStand(e.currentTarget.value)}
                    maxLength={100}
                />

                <Checkbox
                    label="Notify me when resale tickets are available"
                    checked={wantsNotification}
                    onChange={(e) => setWantsNotification(e.currentTarget.checked)}
                />

                <Group justify="flex-end" gap="xs">
                    <Button variant="subtle" size="sm" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button size="sm" loading={saving} onClick={() => void handleSave()}>
                        Register interest
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
