import { useEffect, useState } from 'react';
import { Button, Checkbox, Group, Modal, Stack, Text } from '@mantine/core';
import { IconExternalLink, IconAlertTriangle } from '@tabler/icons-react';
import { TicketLinkBadge } from './TicketLinkBadge';
import { recordTicketLinkClick, type TicketLink } from '../../shared/api/ticketLink.api';

interface ExternalLinkModalProps {
    link: TicketLink;
    opened: boolean;
    onClose: () => void;
}

const SUPPRESS_KEY = 'iwf_suppress_external_link_modal';
const SUPPRESS_DAYS = 30;

function isSuppressed(): boolean {
    try {
        const raw = localStorage.getItem(SUPPRESS_KEY);
        if (!raw) return false;
        const expiry = parseInt(raw, 10);
        return Date.now() < expiry;
    } catch {
        return false;
    }
}

function setSuppressed(): void {
    try {
        const expiry = Date.now() + SUPPRESS_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(SUPPRESS_KEY, String(expiry));
    } catch {
        // ignore storage errors
    }
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

/** Opens an external link, bypassing the modal if the user previously suppressed it. */
export function openExternalLink(link: TicketLink, setSelectedLink: (l: TicketLink | null) => void): void {
    if (isSuppressed()) {
        void recordTicketLinkClick(link.id);
        window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
        setSelectedLink(link);
    }
}

export function ExternalLinkModal({ link, opened, onClose }: ExternalLinkModalProps) {
    const [opening, setOpening] = useState(false);
    const [suppress, setSuppress] = useState(false);

    useEffect(() => {
        if (opened) setSuppress(false);
    }, [opened]);

    const handleContinue = async () => {
        setOpening(true);
        if (suppress) setSuppressed();
        void recordTicketLinkClick(link.id);
        window.open(link.url, '_blank', 'noopener,noreferrer');
        setOpening(false);
        onClose();
    };

    const domain = extractDomain(link.url);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <IconExternalLink size={18} />
                    <Text fw={600}>Leaving I Watch Football</Text>
                </Group>
            }
            size="sm"
            centered
        >
            <Stack gap="md">
                <Group gap="xs" align="flex-start">
                    <IconAlertTriangle
                        size={16}
                        style={{ color: 'var(--mantine-color-yellow-6)', flexShrink: 0, marginTop: 2 }}
                    />
                    <Text size="sm" c="dimmed">
                        You are about to leave I Watch Football and visit an external site. We are not
                        responsible for content on third-party sites.
                    </Text>
                </Group>

                <Stack gap="xs">
                    <Text size="sm" fw={500}>{link.label}</Text>
                    <Group gap="xs" align="center">
                        <Text size="xs" c="dimmed" ff="monospace">{domain}</Text>
                        {link.badgeText && (
                            <TicketLinkBadge linkType={link.linkType} badgeText={link.badgeText} />
                        )}
                    </Group>
                    {link.isSponsored && link.sponsorLabel && (
                        <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                            {link.sponsorLabel}
                        </Text>
                    )}
                </Stack>

                <Checkbox
                    label={`Don't show this again for ${SUPPRESS_DAYS} days`}
                    size="xs"
                    checked={suppress}
                    onChange={(e) => setSuppress(e.currentTarget.checked)}
                />

                <Group justify="flex-end" gap="sm" mt="xs">
                    <Button variant="subtle" size="sm" onClick={onClose} disabled={opening}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        rightSection={<IconExternalLink size={14} />}
                        loading={opening}
                        onClick={() => void handleContinue()}
                    >
                        Continue to site
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
