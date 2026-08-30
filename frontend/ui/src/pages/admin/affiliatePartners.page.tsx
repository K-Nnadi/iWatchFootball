import { useState } from 'react';
import {
    ActionIcon,
    Badge,
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
    Textarea,
    TextInput,
    Tooltip,
} from '@mantine/core';
import { IconEdit, IconPlus, IconTrash, IconNetwork, IconShieldCheck } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { ModernH1, ModernButton } from '../../components/modern';
import { notify } from '../../shared/notify';
import {
    adminCreateAffiliatePartner,
    adminDeleteAffiliatePartner,
    adminUpdateAffiliatePartner,
    useAffiliatePartners,
    type AffiliatePartner,
    type AffiliateUrlFormat,
    type PartnerType,
    type CreateAffiliatePartnerPayload,
} from '../../shared/api/ticketLink.api';

const FORMAT_OPTIONS: { value: AffiliateUrlFormat; label: string }[] = [
    { value: 'QUERY_PARAM',  label: 'Query param (most networks)' },
    { value: 'SUBID',        label: 'Sub-ID (Awin, Impact)' },
    { value: 'PATH_SEGMENT', label: 'Path segment' },
    { value: 'REDIRECT_URL', label: 'Redirect URL template' },
];

const PARTNER_TYPE_OPTIONS: { value: PartnerType; label: string }[] = [
    { value: 'TICKETING',    label: 'Ticketing' },
    { value: 'HOSPITALITY',  label: 'Hospitality' },
    { value: 'TRAVEL',       label: 'Travel' },
    { value: 'PARKING',      label: 'Parking' },
    { value: 'HOTEL',        label: 'Hotel' },
    { value: 'MERCHANDISE',  label: 'Merchandise' },
    { value: 'GAMBLING',     label: '🎰 Gambling (18+)' },
    { value: 'OTHER',        label: 'Other' },
];

type FormState = Omit<CreateAffiliatePartnerPayload, 'allowedCountries' | 'blockedCountries'> & {
    commissionStr: string;
    allowedCountriesStr: string;
    blockedCountriesStr: string;
};

const emptyForm: FormState = {
    name: '',
    partnerType: 'OTHER',
    network: '',
    defaultAffiliateTag: '',
    affiliateUrlFormat: 'QUERY_PARAM',
    commissionRatePercent: undefined,
    commissionStr: '',
    isActive: true,
    notes: '',
    requiresUserConsent: false,
    requiresRGMessage: false,
    disclosureText: '',
    minimumAge: undefined,
    allowedCountriesStr: '',
    blockedCountriesStr: '',
};

function partnerTypeColor(type: PartnerType): string {
    switch (type) {
        case 'GAMBLING':    return 'red';
        case 'TICKETING':   return 'blue';
        case 'HOSPITALITY': return 'violet';
        case 'TRAVEL':      return 'teal';
        default:            return 'gray';
    }
}

export function AffiliatePartnersAdminPage() {
    const qc = useQueryClient();
    const { data: partners = [], isLoading } = useAffiliatePartners();
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AffiliatePartner | null>(null);
    const [form, setForm] = useState<FormState>({ ...emptyForm });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const openCreate = () => {
        setForm({ ...emptyForm });
        setFormError('');
        setEditTarget(null);
        setModalOpen(true);
    };

    const openEdit = (p: AffiliatePartner) => {
        setForm({
            name: p.name,
            partnerType: p.partnerType ?? 'OTHER',
            network: p.network ?? '',
            defaultAffiliateTag: p.defaultAffiliateTag ?? '',
            affiliateUrlFormat: p.affiliateUrlFormat ?? 'QUERY_PARAM',
            commissionRatePercent: p.commissionRatePercent,
            commissionStr: p.commissionRatePercent != null ? String(p.commissionRatePercent) : '',
            isActive: p.isActive,
            notes: p.notes ?? '',
            requiresUserConsent: p.requiresUserConsent ?? false,
            requiresRGMessage: p.requiresRGMessage ?? false,
            disclosureText: p.disclosureText ?? '',
            minimumAge: p.minimumAge,
            allowedCountriesStr: (p.allowedCountries ?? []).join(', '),
            blockedCountriesStr: (p.blockedCountries ?? []).join(', '),
        });
        setFormError('');
        setEditTarget(p);
        setModalOpen(true);
    };

    const handleSave = async () => {
        setFormError('');
        if (!form.name.trim()) { setFormError('Name is required'); return; }

        const parseCodes = (str: string) =>
            str.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);

        const payload: CreateAffiliatePartnerPayload = {
            name: form.name.trim(),
            partnerType: form.partnerType,
            network: form.network?.trim() || undefined,
            defaultAffiliateTag: form.defaultAffiliateTag?.trim() || undefined,
            affiliateUrlFormat: form.affiliateUrlFormat,
            commissionRatePercent: form.commissionStr ? parseFloat(form.commissionStr) : undefined,
            isActive: form.isActive,
            notes: form.notes?.trim() || undefined,
            requiresUserConsent: form.requiresUserConsent,
            requiresRGMessage: form.requiresRGMessage,
            disclosureText: form.disclosureText?.trim() || undefined,
            minimumAge: form.minimumAge,
            allowedCountries: form.allowedCountriesStr ? parseCodes(form.allowedCountriesStr) : undefined,
            blockedCountries: form.blockedCountriesStr ? parseCodes(form.blockedCountriesStr) : undefined,
        };

        setSaving(true);
        try {
            if (editTarget) {
                await adminUpdateAffiliatePartner(editTarget.id, payload);
                notify.success('Updated', `Affiliate partner "${form.name}" updated`);
            } else {
                await adminCreateAffiliatePartner(payload);
                notify.success('Created', `Affiliate partner "${form.name}" created`);
            }
            setModalOpen(false);
            void qc.invalidateQueries({ queryKey: ['admin', 'affiliate-partners'] });
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
            setFormError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to save'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Delete affiliate partner "${name}"?`)) return;
        setDeletingId(id);
        try {
            await adminDeleteAffiliatePartner(id);
            notify.success('Deleted', `"${name}" deleted`);
            void qc.invalidateQueries({ queryKey: ['admin', 'affiliate-partners'] });
        } catch {
            notify.error('Error', 'Failed to delete');
        } finally {
            setDeletingId(null);
        }
    };

    const isGambling = form.partnerType === 'GAMBLING';

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="xl">
                <Group gap="sm">
                    <IconNetwork size={28} color="var(--modern-lime)" />
                    <ModernH1>Affiliate Partners</ModernH1>
                </Group>
                <ModernButton variant="primary" onClick={openCreate}>
                    <Group gap="xs">
                        <IconPlus size={16} />
                        New Partner
                    </Group>
                </ModernButton>
            </Group>

            {isLoading ? (
                <Center py="xl"><Loader /></Center>
            ) : partners.length === 0 ? (
                <Paper p="xl" radius="md" withBorder>
                    <Center>
                        <Stack align="center" gap="xs">
                            <IconNetwork size={40} color="gray" />
                            <Text c="dimmed">No affiliate partners yet.</Text>
                        </Stack>
                    </Center>
                </Paper>
            ) : (
                <Paper radius="md" withBorder>
                    <Table.ScrollContainer minWidth={900}>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>Network</Table.Th>
                                    <Table.Th>Commission</Table.Th>
                                    <Table.Th>Compliance</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {partners.map((p) => (
                                    <Table.Tr key={p.id}>
                                        <Table.Td>
                                            <Stack gap={2}>
                                                <Text fw={500} size="sm">{p.name}</Text>
                                                {p.defaultAffiliateTag && (
                                                    <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                                        {p.defaultAffiliateTag}
                                                    </Text>
                                                )}
                                            </Stack>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge size="xs" color={partnerTypeColor(p.partnerType ?? 'OTHER')} variant="light">
                                                {p.partnerType ?? 'OTHER'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{p.network ?? '—'}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {p.commissionRatePercent != null
                                                    ? `${p.commissionRatePercent}%`
                                                    : '—'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap={4}>
                                                {p.requiresUserConsent && (
                                                    <Tooltip label="Requires user consent">
                                                        <Badge size="xs" color="orange" variant="outline">Consent</Badge>
                                                    </Tooltip>
                                                )}
                                                {p.requiresRGMessage && (
                                                    <Tooltip label="Responsible gambling message required">
                                                        <Badge size="xs" color="red" variant="outline">
                                                            <Group gap={2}><IconShieldCheck size={10} />RG</Group>
                                                        </Badge>
                                                    </Tooltip>
                                                )}
                                                {p.minimumAge && (
                                                    <Badge size="xs" color="red" variant="outline">{p.minimumAge}+</Badge>
                                                )}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                size="xs"
                                                color={p.isActive ? 'green' : 'gray'}
                                                variant="filled"
                                            >
                                                {p.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Tooltip label="Edit">
                                                    <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(p)}>
                                                        <IconEdit size={14} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label="Delete">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        size="sm"
                                                        loading={deletingId === p.id}
                                                        onClick={() => void handleDelete(p.id, p.name)}
                                                    >
                                                        <IconTrash size={14} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Paper>
            )}

            <Modal
                opened={modalOpen}
                onClose={() => { setModalOpen(false); setFormError(''); setEditTarget(null); }}
                title={
                    <Group gap="sm">
                        <IconNetwork size={18} />
                        <Text fw={600}>{editTarget ? 'Edit Partner' : 'New Affiliate Partner'}</Text>
                    </Group>
                }
                size="lg"
                scrollAreaComponent={undefined}
            >
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="Trainline, bet365…"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.currentTarget.value }))}
                        required
                    />

                    <Select
                        label="Partner type"
                        data={PARTNER_TYPE_OPTIONS}
                        value={form.partnerType ?? 'OTHER'}
                        onChange={(v) => setForm((p) => ({ ...p, partnerType: (v ?? 'OTHER') as PartnerType }))}
                    />

                    <Group grow>
                        <TextInput
                            label="Network"
                            placeholder="Awin, Impact, Direct…"
                            value={form.network}
                            onChange={(e) => setForm((p) => ({ ...p, network: e.currentTarget.value }))}
                        />
                        <NumberInput
                            label="Commission rate %"
                            placeholder="e.g. 5"
                            value={form.commissionStr ? parseFloat(form.commissionStr) : ''}
                            onChange={(v) => setForm((p) => ({ ...p, commissionStr: v != null ? String(v) : '' }))}
                            min={0}
                            max={100}
                            step={0.5}
                        />
                    </Group>

                    <Divider label="Affiliate tag settings" labelPosition="left" />

                    <TextInput
                        label="Default affiliate tag"
                        placeholder="ref=iwf&utm_source=iwf"
                        description="Used by ticket links that reference this partner with no link-level tag"
                        value={form.defaultAffiliateTag}
                        onChange={(e) => setForm((p) => ({ ...p, defaultAffiliateTag: e.currentTarget.value }))}
                    />

                    <Select
                        label="URL format"
                        data={FORMAT_OPTIONS}
                        value={form.affiliateUrlFormat ?? 'QUERY_PARAM'}
                        onChange={(v) =>
                            setForm((p) => ({ ...p, affiliateUrlFormat: (v ?? 'QUERY_PARAM') as AffiliateUrlFormat }))
                        }
                    />

                    {isGambling && (
                        <>
                            <Divider label="🎰 Gambling compliance (required)" labelPosition="left" color="red" />

                            <NumberInput
                                label="Minimum age"
                                description="Users below this age will never see this partner's placements"
                                placeholder="18"
                                value={form.minimumAge ?? 18}
                                onChange={(v) => setForm((p) => ({ ...p, minimumAge: typeof v === 'number' ? v : undefined }))}
                                min={13}
                                max={99}
                            />

                            <TextInput
                                label="Allowed countries (ISO-2 codes)"
                                description="Comma-separated, e.g. GB, IE, AU — leave blank to allow all"
                                placeholder="GB, IE, AU"
                                value={form.allowedCountriesStr}
                                onChange={(e) => setForm((p) => ({ ...p, allowedCountriesStr: e.currentTarget.value }))}
                            />

                            <TextInput
                                label="Blocked countries (ISO-2 codes)"
                                description="Comma-separated — takes precedence over allowed list"
                                placeholder="US, AU"
                                value={form.blockedCountriesStr}
                                onChange={(e) => setForm((p) => ({ ...p, blockedCountriesStr: e.currentTarget.value }))}
                            />

                            <Switch
                                label="Requires user opt-in consent"
                                description="User must have explicitly enabled gambling content in their settings"
                                checked={form.requiresUserConsent ?? false}
                                onChange={(e) => setForm((p) => ({ ...p, requiresUserConsent: e.currentTarget.checked }))}
                            />

                            <Switch
                                label="Always show responsible gambling message"
                                description='Displays e.g. "18+ | Please gamble responsibly" with every placement'
                                checked={form.requiresRGMessage ?? false}
                                onChange={(e) => setForm((p) => ({ ...p, requiresRGMessage: e.currentTarget.checked }))}
                            />

                            <Textarea
                                label="Disclosure text"
                                placeholder='18+ | T&Cs apply | Please gamble responsibly | begambleaware.org'
                                description="Shown alongside every placement from this partner"
                                value={form.disclosureText}
                                onChange={(e) => setForm((p) => ({ ...p, disclosureText: e.currentTarget.value }))}
                                rows={2}
                            />
                        </>
                    )}

                    <Divider label="General" labelPosition="left" />

                    <Switch
                        label="Active"
                        checked={form.isActive}
                        onChange={(e) => setForm((p) => ({ ...p, isActive: e.currentTarget.checked }))}
                    />

                    <Textarea
                        label="Notes"
                        placeholder="Internal notes for the team"
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.currentTarget.value }))}
                        rows={3}
                    />

                    {formError && <Text c="red" size="sm">{formError}</Text>}

                    <Group justify="flex-end" gap="sm" mt="xs">
                        <Button
                            variant="subtle"
                            onClick={() => { setModalOpen(false); setFormError(''); setEditTarget(null); }}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button loading={saving} onClick={() => void handleSave()}>
                            {editTarget ? 'Save changes' : 'Create partner'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
