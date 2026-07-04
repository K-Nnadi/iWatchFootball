import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Alert,
    Box,
    Group,
    Popover,
    Skeleton,
    Stack,
    Text,
} from '@mantine/core';
import {
    IconAlertCircle,
    IconCalendar,
    IconInfoCircle,
    IconLock,
    IconUserCheck,
} from '@tabler/icons-react';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';
import { queryTicketLinks, type SaleInfo, type TicketLink } from '../../shared/api/ticketLink.api';
import { TicketCard } from './TicketCard';
import { ExternalLinkModal } from './ExternalLinkModal';

interface TicketsMatchdayPanelProps {
    fixtureId?: number;
    teamId?: number;
    competitionId?: number;
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return iso;
    }
}

function SaleInfoCard({ saleInfo, label }: { saleInfo: SaleInfo; label: string }) {
    const hasDates = saleInfo.membersSaleDate || saleInfo.generalSaleDate;
    const hasMembership = saleInfo.requiresMembership;

    if (!hasDates && !hasMembership && !saleInfo.awayFanProcess && !saleInfo.notes) return null;

    return (
        <Alert
            variant="light"
            color="blue"
            radius="md"
            icon={<IconInfoCircle size={16} />}
            title={`Ticket info — ${label}`}
            styles={{ title: { fontWeight: 600, fontSize: 'var(--mantine-font-size-sm)' } }}
        >
            <Stack gap={6}>
                {hasMembership && (
                    <Group gap={6} wrap="nowrap">
                        <IconLock size={13} style={{ flexShrink: 0, color: 'var(--mantine-color-blue-6)' }} />
                        <Text size="xs">
                            {saleInfo.membershipName
                                ? `Requires ${saleInfo.membershipName} membership`
                                : 'Membership required to purchase'}
                        </Text>
                    </Group>
                )}
                {saleInfo.membersSaleDate && (
                    <Group gap={6} wrap="nowrap">
                        <IconUserCheck size={13} style={{ flexShrink: 0, color: 'var(--mantine-color-blue-6)' }} />
                        <Text size="xs">
                            Members on sale:{' '}
                            <Text component="span" fw={600} size="xs">{formatDate(saleInfo.membersSaleDate)}</Text>
                        </Text>
                    </Group>
                )}
                {saleInfo.generalSaleDate && (
                    <Group gap={6} wrap="nowrap">
                        <IconCalendar size={13} style={{ flexShrink: 0, color: 'var(--mantine-color-blue-6)' }} />
                        <Text size="xs">
                            General sale:{' '}
                            <Text component="span" fw={600} size="xs">{formatDate(saleInfo.generalSaleDate)}</Text>
                        </Text>
                    </Group>
                )}
                {saleInfo.awayFanProcess && (
                    <Text size="xs" c="dimmed">{saleInfo.awayFanProcess}</Text>
                )}
                {saleInfo.notes && (
                    <Text size="xs" c="dimmed">{saleInfo.notes}</Text>
                )}
                {saleInfo.lastVerified && (
                    <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                        Last verified: {formatDate(saleInfo.lastVerified)}
                    </Text>
                )}
            </Stack>
        </Alert>
    );
}

const BADGE_LEGEND: { badge: string; color: string; desc: string }[] = [
    { badge: 'Official',    color: '#00c853', desc: 'This is the official club or competition ticket portal.' },
    { badge: 'Member',      color: '#74c0fc', desc: 'You may need a membership or loyalty points to purchase.' },
    { badge: 'Exchange',    color: '#ffa94d', desc: 'Fan-to-fan resale. Official prices may differ.' },
    { badge: 'Hospitality', color: '#cc5de8', desc: 'Premium experience including seats, food, and more.' },
    { badge: 'Partner',     color: '#38d9a9', desc: 'Approved third-party ticket partner.' },
    { badge: 'Affiliate',   color: '#868e96', desc: 'We earn a small commission if you buy, at no extra cost to you.' },
    { badge: 'Sponsored',   color: '#ffd43b', desc: 'Paid placement. The partner has sponsored this link.' },
];

function BadgeLegendTooltip() {
    return (
        <Popover width={340} position="top-start" withArrow shadow="md" withinPortal>
            <Popover.Target>
                <Group
                    gap={4}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', userSelect: 'none' }}
                >
                    <IconInfoCircle size={12} style={{ color: 'var(--ui-text-muted)' }} />
                    <Text size="xs" style={{ color: 'var(--ui-text-muted)' }}>What do these badges mean?</Text>
                </Group>
            </Popover.Target>
            <Popover.Dropdown>
                <Stack gap={8}>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">Badge guide</Text>
                    {BADGE_LEGEND.map(({ badge, color, desc }) => (
                        <Group key={badge} gap="sm" wrap="nowrap" align="flex-start">
                            <Box
                                style={{
                                    flexShrink: 0,
                                    marginTop: 3,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: color,
                                }}
                            />
                            <Stack gap={0}>
                                <Text size="xs" fw={600} style={{ color }}>
                                    {badge}
                                </Text>
                                <Text size="xs" c="dimmed">{desc}</Text>
                            </Stack>
                        </Group>
                    ))}
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}

export function TicketsMatchdayPanel({ fixtureId, teamId, competitionId }: TicketsMatchdayPanelProps) {
    const ticketLinksEnabled = usePlatformFeaturesStore((s) => s.ticketLinksEnabled);
    const matchdayAffiliatesEnabled = usePlatformFeaturesStore((s) => s.matchdayAffiliatesEnabled);
    const affiliateDisclosureEnabled = usePlatformFeaturesStore((s) => s.affiliateDisclosureEnabled);
    const [selectedLink, setSelectedLink] = useState<TicketLink | null>(null);

    const { data: links, isLoading } = useQuery({
        queryKey: ['ticket-links', { fixtureId, teamId, competitionId }],
        queryFn: () => queryTicketLinks({ fixtureId, teamId, competitionId }),
        enabled: ticketLinksEnabled,
        staleTime: 5 * 60 * 1000,
    });

    if (!ticketLinksEnabled) return null;

    if (isLoading) {
        return (
            <Group gap="sm">
                <Skeleton height={52} width={220} radius="md" />
                <Skeleton height={52} width={200} radius="md" />
            </Group>
        );
    }

    if (!links || links.length === 0) return null;

    const visibleLinks = links.filter(
        (l) => l.linkCategory !== 'MATCHDAY_PLANNING' || matchdayAffiliatesEnabled,
    );

    if (visibleLinks.length === 0) return null;

    // Find the link with the richest saleInfo to show at the top
    const saleInfoLink = visibleLinks.find((l) => l.saleInfo);

    const hasAnyAffiliate = visibleLinks.some((l) => l.isAffiliate);
    const hasBadges = visibleLinks.some((l) => l.badgeText);

    return (
        <>
            <Stack gap="sm">
                {saleInfoLink?.saleInfo && (
                    <SaleInfoCard saleInfo={saleInfoLink.saleInfo} label={saleInfoLink.label} />
                )}

                <Group gap="sm" wrap="wrap" align="stretch">
                    {visibleLinks.map((link) => (
                        <TicketCard
                            key={link.id}
                            label={link.label}
                            badgeText={link.badgeText}
                            linkType={link.linkType}
                            isSponsored={link.isSponsored}
                            onClick={() => setSelectedLink(link)}
                        />
                    ))}
                </Group>

                <Box style={{ borderTop: '1px solid var(--ui-divider)', paddingTop: '0.5rem' }}>
                    <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                        {(hasAnyAffiliate && affiliateDisclosureEnabled) ? (
                            <Group gap={6} align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
                                <IconAlertCircle
                                    size={12}
                                    style={{ color: 'var(--ui-text-muted)', flexShrink: 0, marginTop: 2 }}
                                />
                                <Text size="xs" style={{ color: 'var(--ui-text-muted)', lineHeight: 1.5 }}>
                                    Tickets are sold by the club, competition, venue, or approved partner. I Watch Football
                                    does not sell tickets or guarantee availability. Some links earn us a small commission
                                    at no extra cost to you.
                                </Text>
                            </Group>
                        ) : (
                            <Group gap={6} align="flex-start" wrap="nowrap" style={{ flex: 1 }}>
                                <IconAlertCircle
                                    size={12}
                                    style={{ color: 'var(--ui-text-muted)', flexShrink: 0, marginTop: 2 }}
                                />
                                <Text size="xs" style={{ color: 'var(--ui-text-muted)', lineHeight: 1.5 }}>
                                    Tickets are sold by the club, competition, venue, or approved partner. I Watch Football
                                    does not sell tickets or guarantee availability.
                                </Text>
                            </Group>
                        )}
                        {hasBadges && <BadgeLegendTooltip />}
                    </Group>
                </Box>
            </Stack>

            {selectedLink && (
                <ExternalLinkModal
                    link={selectedLink}
                    opened={selectedLink !== null}
                    onClose={() => setSelectedLink(null)}
                />
            )}
        </>
    );
}
