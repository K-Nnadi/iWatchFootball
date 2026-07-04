import { useState, useEffect } from 'react';
import {
    Alert,
    Badge,
    Box,
    Button,
    Center,
    Container,
    Divider,
    Group,
    Loader,
    Modal,
    NumberInput,
    Paper,
    Select,
    Stack,
    Switch,
    Table,
    Text,
    TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconPlus, IconTag, IconAlertCircle } from '@tabler/icons-react';
import { ModernH1, ModernButton } from '../../components/modern';
import { notify } from '../../shared/notify';
import {
    adminListDiscountCodes,
    adminCreateDiscountCode,
    adminToggleDiscountCode,
    type DiscountCode,
    type DiscountType,
} from '../../shared/api/discountCode.api';

export function DiscountCodesAdminPage() {
    const [codes, setCodes] = useState<DiscountCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);

    // Create form
    const [form, setForm] = useState({
        code: '',
        type: 'PERCENTAGE' as DiscountType,
        value: 10,
        maxUsesPerUser: 1,
        expiresAt: null as Date | null,
    });
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await adminListDiscountCodes();
            setCodes(data);
        } catch {
            notify.error('Error', 'Failed to load discount codes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const handleCreate = async () => {
        setFormError('');
        if (!form.code.trim()) {
            setFormError('Code is required');
            return;
        }
        if (form.value <= 0) {
            setFormError('Value must be greater than 0');
            return;
        }
        setCreating(true);
        try {
            await adminCreateDiscountCode({
                code: form.code,
                type: form.type,
                value: form.value,
                maxUsesPerUser: form.maxUsesPerUser,
                expiresAt: form.expiresAt?.toISOString(),
            });
            notify.success('Created', `Discount code "${form.code.toUpperCase()}" created`);
            setCreateOpen(false);
            setForm({ code: '', type: 'PERCENTAGE', value: 10, maxUsesPerUser: 1, expiresAt: null });
            void load();
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Failed to create discount code';
            setFormError(msg);
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            const updated = await adminToggleDiscountCode(id);
            setCodes((prev) => prev.map((c) => (c.id === id ? updated : c)));
            notify.success(
                updated.active ? 'Activated' : 'Deactivated',
                `Code "${updated.code}" is now ${updated.active ? 'active' : 'inactive'}`,
            );
        } catch {
            notify.error('Error', 'Failed to toggle discount code');
        }
    };

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="xl">
                <Group gap="sm">
                    <IconTag size={28} color="var(--modern-lime)" />
                    <ModernH1>Discount Codes</ModernH1>
                </Group>
                <ModernButton variant="primary" onClick={() => setCreateOpen(true)}>
                    <Group gap="xs">
                        <IconPlus size={16} />
                        New Code
                    </Group>
                </ModernButton>
            </Group>

            {loading ? (
                <Center py="xl">
                    <Loader />
                </Center>
            ) : codes.length === 0 ? (
                <Paper p="xl" radius="md" withBorder>
                    <Center>
                        <Stack align="center" gap="xs">
                            <IconTag size={40} color="gray" />
                            <Text c="dimmed">No discount codes yet. Create your first one!</Text>
                        </Stack>
                    </Center>
                </Paper>
            ) : (
                <Paper radius="md" withBorder>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Code</Table.Th>
                                <Table.Th>Type</Table.Th>
                                <Table.Th>Value</Table.Th>
                                <Table.Th>Uses</Table.Th>
                                <Table.Th>Expires</Table.Th>
                                <Table.Th>Active</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {codes.map((code) => (
                                <Table.Tr key={code.id}>
                                    <Table.Td>
                                        <Text fw={600} ff="monospace">
                                            {code.code}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={code.type === 'PERCENTAGE' ? 'blue' : 'grape'}
                                            variant="light"
                                            size="sm"
                                        >
                                            {code.type}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        {code.type === 'PERCENTAGE'
                                            ? `${code.value}%`
                                            : `£${Number(code.value).toFixed(2)}`}
                                    </Table.Td>
                                    <Table.Td>{code.totalUsesCount}</Table.Td>
                                    <Table.Td>
                                        {code.expiresAt
                                            ? new Date(code.expiresAt).toLocaleDateString('en-GB')
                                            : '—'}
                                    </Table.Td>
                                    <Table.Td>
                                        <Switch
                                            checked={code.active}
                                            onChange={() => void handleToggle(code.id)}
                                            color="teal"
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}

            {/* Create modal */}
            <Modal
                opened={createOpen}
                onClose={() => {
                    setCreateOpen(false);
                    setFormError('');
                }}
                title={
                    <Group gap="sm">
                        <IconTag size={18} />
                        <Text fw={600}>Create Discount Code</Text>
                    </Group>
                }
                size="sm"
            >
                <Stack gap="md">
                    <TextInput
                        label="Code"
                        placeholder="SUMMER10"
                        description="Uppercase letters and numbers, no spaces"
                        value={form.code}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                code: e.currentTarget.value.toUpperCase().replace(/\s/g, ''),
                            }))
                        }
                        required
                    />

                    <Select
                        label="Type"
                        data={[
                            { value: 'PERCENTAGE', label: 'Percentage (%)' },
                            { value: 'FIXED', label: 'Fixed amount (£)' },
                        ]}
                        value={form.type}
                        onChange={(v) => setForm((p) => ({ ...p, type: (v ?? 'PERCENTAGE') as DiscountType }))}
                        comboboxProps={{ withinPortal: true }}
                        required
                    />

                    <NumberInput
                        label={form.type === 'PERCENTAGE' ? 'Percentage off (0–100)' : 'Amount off (£)'}
                        value={form.value}
                        onChange={(v) => setForm((p) => ({ ...p, value: Number(v) || 0 }))}
                        min={0}
                        max={form.type === 'PERCENTAGE' ? 100 : undefined}
                        decimalScale={form.type === 'FIXED' ? 2 : 0}
                        required
                    />

                    <NumberInput
                        label="Max uses per user"
                        description="How many times a single user can use this code"
                        value={form.maxUsesPerUser}
                        onChange={(v) => setForm((p) => ({ ...p, maxUsesPerUser: Number(v) || 1 }))}
                        min={1}
                    />

                    <DatePickerInput
                        label="Expiry date (optional)"
                        placeholder="No expiry"
                        value={form.expiresAt}
                        onChange={(v) => setForm((p) => ({ ...p, expiresAt: v }))}
                        popoverProps={{ withinPortal: true }}
                        clearable
                        minDate={new Date()}
                    />

                    {formError && (
                        <Alert color="red" icon={<IconAlertCircle size={16} />}>
                            {formError}
                        </Alert>
                    )}

                    <Divider />

                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="teal" onClick={() => void handleCreate()} loading={creating}>
                            Create
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
