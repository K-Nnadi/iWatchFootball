import { useEffect, useState } from 'react';
import {
    ActionIcon,
    Badge,
    Button,
    Center,
    Container,
    Divider,
    Group,
    JsonInput,
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
    Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconPlus, IconTicket, IconEdit, IconTrash } from '@tabler/icons-react';
import { ModernH1, ModernButton } from '../../components/modern';
import { notify } from '../../shared/notify';
import {
    adminListTicketLinks,
    adminCreateTicketLink,
    adminUpdateTicketLink,
    adminDeleteTicketLink,
    type TicketLink,
    type TicketLinkType,
    type TicketLinkCategory,
    type AffiliateUrlFormat,
    type CreateTicketLinkPayload,
    type SaleInfo,
} from '../../shared/api/ticketLink.api';

const LINK_TYPE_OPTIONS: { value: TicketLinkType; label: string; color: string }[] = [
    { value: 'OFFICIAL_CLUB',       label: 'Official Club',         color: 'green' },
    { value: 'COMPETITION',         label: 'Competition',           color: 'blue' },
    { value: 'AWAY_FANS',           label: 'Away Fans',             color: 'lime' },
    { value: 'TICKET_EXCHANGE',     label: 'Ticket Exchange',       color: 'orange' },
    { value: 'HOSPITALITY',         label: 'Hospitality',           color: 'grape' },
    { value: 'HOSPITALITY_PARTNER', label: 'Hospitality Partner',   color: 'violet' },
    { value: 'MEMBERSHIP',          label: 'Membership',            color: 'cyan' },
    { value: 'TRAVEL',              label: 'Travel',                color: 'teal' },
    { value: 'PARKING',             label: 'Parking',               color: 'yellow' },
    { value: 'HOTEL',               label: 'Hotel',                 color: 'pink' },
    { value: 'MERCHANDISE',         label: 'Merchandise',           color: 'red' },
    { value: 'STADIUM_TOUR',        label: 'Stadium Tour',          color: 'indigo' },
    { value: 'APPROVED_PARTNER',    label: 'Approved Partner',      color: 'teal' },
    { value: 'AFFILIATE',           label: 'Affiliate',             color: 'gray' },
];

const CATEGORY_OPTIONS: { value: TicketLinkCategory; label: string; color: string }[] = [
    { value: 'TICKETS',           label: 'Tickets',              color: 'green' },
    { value: 'HOSPITALITY',       label: 'Hospitality',          color: 'grape' },
    { value: 'MEMBERSHIP',        label: 'Membership',           color: 'cyan' },
    { value: 'MATCHDAY_PLANNING', label: 'Matchday Planning',    color: 'orange' },
    { value: 'SPONSORED',         label: 'Sponsored',            color: 'yellow' },
];

const AFFILIATE_URL_FORMAT_OPTIONS: { value: AffiliateUrlFormat; label: string; description: string }[] = [
    { value: 'QUERY_PARAM',   label: 'Query param',    description: 'url?tag=value (most networks)' },
    { value: 'SUBID',         label: 'Sub-ID',         description: 'url?subid=value (Awin, Impact)' },
    { value: 'PATH_SEGMENT',  label: 'Path segment',   description: 'url/tagvalue (some custom)' },
    { value: 'REDIRECT_URL',  label: 'Redirect URL',   description: 'tag is a template with {url}' },
];

type FormState = CreateTicketLinkPayload & {
    expiresAtDate: Date | null;
    saleInfoJson: string;
};

const emptyForm: FormState = {
    fixtureId: undefined,
    teamId: undefined,
    competitionId: undefined,
    url: '',
    label: '',
    linkType: 'OFFICIAL_CLUB',
    linkCategory: 'TICKETS',
    isAffiliate: false,
    affiliateTag: '',
    affiliateUrlFormat: 'QUERY_PARAM',
    isSponsored: false,
    sponsorLabel: '',
    badgeText: '',
    priority: 0,
    expiresAt: undefined,
    expiresAtDate: null,
    saleInfo: undefined,
    saleInfoJson: '',
};

function parseSaleInfo(json: string): SaleInfo | undefined {
    if (!json.trim()) return undefined;
    try {
        return JSON.parse(json) as SaleInfo;
    } catch {
        return undefined;
    }
}

export function TicketLinksAdminPage() {
    const [links, setLinks] = useState<TicketLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TicketLink | null>(null);
    const [form, setForm] = useState<FormState>({ ...emptyForm });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await adminListTicketLinks();
            setLinks(data);
        } catch {
            notify.error('Error', 'Failed to load ticket links');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const openCreate = () => {
        setForm({ ...emptyForm });
        setFormError('');
        setEditTarget(null);
        setCreateOpen(true);
    };

    const openEdit = (link: TicketLink) => {
        setForm({
            fixtureId: link.fixtureId,
            teamId: link.teamId,
            competitionId: link.competitionId,
            url: link.url,
            label: link.label,
            linkType: link.linkType,
            linkCategory: link.linkCategory ?? 'TICKETS',
            isAffiliate: link.isAffiliate,
            affiliateTag: '',
            affiliateUrlFormat: 'QUERY_PARAM',
            isSponsored: link.isSponsored ?? false,
            sponsorLabel: link.sponsorLabel ?? '',
            badgeText: link.badgeText ?? '',
            priority: link.priority,
            expiresAt: link.expiresAt,
            expiresAtDate: link.expiresAt ? new Date(link.expiresAt) : null,
            saleInfo: link.saleInfo,
            saleInfoJson: link.saleInfo ? JSON.stringify(link.saleInfo, null, 2) : '',
        });
        setFormError('');
        setEditTarget(link);
        setCreateOpen(true);
    };

    const handleSave = async () => {
        setFormError('');

        if (!form.url.trim()) { setFormError('URL is required'); return; }
        if (!form.url.startsWith('https://')) { setFormError('URL must start with https://'); return; }
        if (!form.label.trim()) { setFormError('Label is required'); return; }
        if (!form.fixtureId && !form.teamId && !form.competitionId) {
            setFormError('At least one of Fixture ID, Team ID, or Competition ID is required');
            return;
        }

        const parsedSaleInfo = parseSaleInfo(form.saleInfoJson);
        if (form.saleInfoJson.trim() && !parsedSaleInfo) {
            setFormError('Sale info JSON is invalid — fix it or leave it blank');
            return;
        }

        const payload: CreateTicketLinkPayload = {
            fixtureId: form.fixtureId || undefined,
            teamId: form.teamId || undefined,
            competitionId: form.competitionId || undefined,
            url: form.url.trim(),
            label: form.label.trim(),
            linkType: form.linkType,
            linkCategory: form.linkCategory,
            isAffiliate: form.isAffiliate,
            affiliateTag: form.affiliateTag?.trim() || undefined,
            affiliateUrlFormat: form.isAffiliate ? form.affiliateUrlFormat : undefined,
            isSponsored: form.isSponsored,
            sponsorLabel: form.sponsorLabel?.trim() || undefined,
            badgeText: form.badgeText?.trim() || undefined,
            priority: form.priority,
            expiresAt: form.expiresAtDate?.toISOString(),
            saleInfo: parsedSaleInfo,
        };

        setSaving(true);
        try {
            if (editTarget) {
                await adminUpdateTicketLink(editTarget.id, payload);
                notify.success('Updated', `Ticket link "${form.label}" updated`);
            } else {
                await adminCreateTicketLink(payload);
                notify.success('Created', `Ticket link "${form.label}" created`);
            }
            setCreateOpen(false);
            void load();
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
            setFormError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Failed to save ticket link'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, label: string) => {
        if (!window.confirm(`Delete ticket link "${label}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await adminDeleteTicketLink(id);
            notify.success('Deleted', `Ticket link "${label}" deleted`);
            setLinks((prev) => prev.filter((l) => l.id !== id));
        } catch {
            notify.error('Error', 'Failed to delete ticket link');
        } finally {
            setDeletingId(null);
        }
    };

    const modalTitle = editTarget ? 'Edit Ticket Link' : 'Create Ticket Link';

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Group gap="sm">
                    <IconTicket size={28} color="var(--modern-lime)" />
                    <ModernH1>Ticket Links</ModernH1>
                </Group>
                <ModernButton variant="primary" onClick={openCreate}>
                    <Group gap="xs">
                        <IconPlus size={16} />
                        New Link
                    </Group>
                </ModernButton>
            </Group>

            {loading ? (
                <Center py="xl"><Loader /></Center>
            ) : links.length === 0 ? (
                <Paper p="xl" radius="md" withBorder>
                    <Center>
                        <Stack align="center" gap="xs">
                            <IconTicket size={40} color="gray" />
                            <Text c="dimmed">No ticket links yet. Create the first one!</Text>
                        </Stack>
                    </Center>
                </Paper>
            ) : (
                <Paper radius="md" withBorder>
                    <Table.ScrollContainer minWidth={1100}>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Label</Table.Th>
                                    <Table.Th>Category</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>Scope</Table.Th>
                                    <Table.Th>Priority</Table.Th>
                                    <Table.Th>Expires</Table.Th>
                                    <Table.Th>Affiliate</Table.Th>
                                    <Table.Th>Sponsored</Table.Th>
                                    <Table.Th>Sale Info</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {links.map((link) => {
                                    const typeConfig = LINK_TYPE_OPTIONS.find((o) => o.value === link.linkType);
                                    const catConfig = CATEGORY_OPTIONS.find((o) => o.value === link.linkCategory);
                                    const scopeParts: string[] = [];
                                    if (link.fixtureId) scopeParts.push(`Fixture #${link.fixtureId}`);
                                    if (link.teamId) scopeParts.push(`Team #${link.teamId}`);
                                    if (link.competitionId) scopeParts.push(`Comp #${link.competitionId}`);

                                    return (
                                        <Table.Tr key={link.id}>
                                            <Table.Td>
                                                <Stack gap={2}>
                                                    <Text fw={500} size="sm">{link.label}</Text>
                                                    {link.badgeText && (
                                                        <Badge size="xs" color={typeConfig?.color ?? 'gray'} variant="light">
                                                            {link.badgeText}
                                                        </Badge>
                                                    )}
                                                </Stack>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={catConfig?.color ?? 'gray'} variant="dot" size="sm">
                                                    {catConfig?.label ?? link.linkCategory}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={typeConfig?.color ?? 'gray'} variant="light" size="sm">
                                                    {typeConfig?.label ?? link.linkType}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="xs" c="dimmed">
                                                    {scopeParts.length > 0 ? scopeParts.join(', ') : '—'}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td><Text size="sm">{link.priority}</Text></Table.Td>
                                            <Table.Td>
                                                <Text size="xs" c="dimmed">
                                                    {link.expiresAt
                                                        ? new Date(link.expiresAt).toLocaleDateString('en-GB')
                                                        : 'Never'}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Switch checked={link.isAffiliate} readOnly size="xs" color="gray" />
                                            </Table.Td>
                                            <Table.Td>
                                                {link.isSponsored ? (
                                                    <Badge size="xs" color="yellow" variant="filled">Sponsored</Badge>
                                                ) : (
                                                    <Text size="xs" c="dimmed">—</Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                {link.saleInfo ? (
                                                    <Badge size="xs" color="blue" variant="outline">Has info</Badge>
                                                ) : (
                                                    <Text size="xs" c="dimmed">—</Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Tooltip label="Edit">
                                                        <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(link)}>
                                                            <IconEdit size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Delete">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            loading={deletingId === link.id}
                                                            onClick={() => void handleDelete(link.id, link.label)}
                                                        >
                                                            <IconTrash size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Paper>
            )}

            <Modal
                opened={createOpen}
                onClose={() => { setCreateOpen(false); setFormError(''); setEditTarget(null); }}
                title={
                    <Group gap="sm">
                        <IconTicket size={18} />
                        <Text fw={600}>{modalTitle}</Text>
                    </Group>
                }
                size="lg"
            >
                <Stack gap="md">
                    <TextInput
                        label="URL"
                        placeholder="https://tickets.club.com/fixtures/123"
                        description="Must be HTTPS"
                        value={form.url}
                        onChange={(e) => setForm((p) => ({ ...p, url: e.currentTarget.value.trim() }))}
                        required
                    />

                    <TextInput
                        label="Button label"
                        placeholder="Buy Official Tickets"
                        value={form.label}
                        onChange={(e) => setForm((p) => ({ ...p, label: e.currentTarget.value }))}
                        required
                    />

                    <Group grow>
                        <Select
                            label="Category"
                            description="Display section"
                            data={CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                            value={form.linkCategory}
                            onChange={(v) => setForm((p) => ({ ...p, linkCategory: (v ?? 'TICKETS') as TicketLinkCategory }))}
                            required
                        />
                        <Select
                            label="Link type"
                            data={LINK_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                            value={form.linkType}
                            onChange={(v) => setForm((p) => ({ ...p, linkType: (v ?? 'OFFICIAL_CLUB') as TicketLinkType }))}
                            required
                        />
                    </Group>

                    <TextInput
                        label="Badge text"
                        placeholder='e.g. "Official"'
                        description="Short label shown next to the button (optional)"
                        value={form.badgeText}
                        onChange={(e) => setForm((p) => ({ ...p, badgeText: e.currentTarget.value }))}
                    />

                    <Divider label="Scope (at least one required)" labelPosition="left" />

                    <Group grow>
                        <NumberInput
                            label="Fixture ID"
                            placeholder="e.g. 1234"
                            value={form.fixtureId ?? ''}
                            onChange={(v) => setForm((p) => ({ ...p, fixtureId: Number(v) || undefined }))}
                            min={1}
                        />
                        <NumberInput
                            label="Team ID"
                            placeholder="e.g. 42"
                            value={form.teamId ?? ''}
                            onChange={(v) => setForm((p) => ({ ...p, teamId: Number(v) || undefined }))}
                            min={1}
                        />
                        <NumberInput
                            label="Competition ID"
                            placeholder="e.g. 5"
                            value={form.competitionId ?? ''}
                            onChange={(v) => setForm((p) => ({ ...p, competitionId: Number(v) || undefined }))}
                            min={1}
                        />
                    </Group>

                    <Group grow>
                        <NumberInput
                            label="Priority"
                            description="Lower = shown first"
                            value={form.priority}
                            onChange={(v) => setForm((p) => ({ ...p, priority: Number(v) || 0 }))}
                            min={0}
                        />
                        <DatePickerInput
                            label="Expires at"
                            description="Auto-hides after this date"
                            placeholder="No expiry"
                            value={form.expiresAtDate}
                            onChange={(v) => setForm((p) => ({ ...p, expiresAtDate: v }))}
                            clearable
                        />
                    </Group>

                    <Divider label="Affiliate settings" labelPosition="left" />

                    <Switch
                        label="Affiliate link"
                        description="Enable affiliate tracking tag appending"
                        checked={form.isAffiliate}
                        onChange={(e) => setForm((p) => ({ ...p, isAffiliate: e.currentTarget.checked }))}
                    />

                    {form.isAffiliate && (
                        <Group grow>
                            <TextInput
                                label="Affiliate tag"
                                placeholder="ref=iwf&utm_source=iwf"
                                description="Appended server-side, never exposed to users"
                                value={form.affiliateTag}
                                onChange={(e) => setForm((p) => ({ ...p, affiliateTag: e.currentTarget.value }))}
                            />
                            <Select
                                label="URL format"
                                description="How the tag is injected"
                                data={AFFILIATE_URL_FORMAT_OPTIONS.map((o) => ({
                                    value: o.value,
                                    label: `${o.label} — ${o.description}`,
                                }))}
                                value={form.affiliateUrlFormat ?? 'QUERY_PARAM'}
                                onChange={(v) =>
                                    setForm((p) => ({ ...p, affiliateUrlFormat: (v ?? 'QUERY_PARAM') as AffiliateUrlFormat }))
                                }
                            />
                        </Group>
                    )}

                    <Divider label="Sponsored placement" labelPosition="left" />

                    <Switch
                        label="Sponsored link"
                        description="Mark as a paid placement — shows a 'Sponsored' badge"
                        checked={form.isSponsored}
                        onChange={(e) => setForm((p) => ({ ...p, isSponsored: e.currentTarget.checked }))}
                    />

                    {form.isSponsored && (
                        <TextInput
                            label="Sponsor label"
                            placeholder='e.g. "Sponsored by Trainline"'
                            description="Attribution text shown below the button"
                            value={form.sponsorLabel}
                            onChange={(e) => setForm((p) => ({ ...p, sponsorLabel: e.currentTarget.value }))}
                        />
                    )}

                    <Divider label="Sale info (optional)" labelPosition="left" />

                    <JsonInput
                        label="Sale info JSON"
                        description={`Manually maintained on-sale dates & membership info. Example: {"requiresMembership":true,"membersSaleDate":"2026-08-01","generalSaleDate":"2026-08-08"}`}
                        placeholder='{}'
                        value={form.saleInfoJson}
                        onChange={(v) => setForm((p) => ({ ...p, saleInfoJson: v }))}
                        minRows={3}
                        validationError="Invalid JSON"
                        formatOnBlur
                        autosize
                    />

                    {formError && <Text c="red" size="sm">{formError}</Text>}

                    <Group justify="flex-end" gap="sm" mt="xs">
                        <Button
                            variant="subtle"
                            onClick={() => { setCreateOpen(false); setFormError(''); setEditTarget(null); }}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button loading={saving} onClick={() => void handleSave()}>
                            {editTarget ? 'Save changes' : 'Create link'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
