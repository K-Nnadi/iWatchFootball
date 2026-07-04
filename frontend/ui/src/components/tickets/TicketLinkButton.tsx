import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Group, Skeleton } from '@mantine/core';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';
import { queryTicketLinks, type TicketLink } from '../../shared/api/ticketLink.api';
import { TicketLinkCard as TicketCard } from './TicketLinkCard';
import { ExternalLinkModal } from './ExternalLinkModal';

interface TicketLinkButtonProps {
    fixtureId?: number;
    teamId?: number;
    competitionId?: number;
}

export function TicketLinkButton({ fixtureId, teamId, competitionId }: TicketLinkButtonProps) {
    const ticketLinksEnabled = usePlatformFeaturesStore((s) => s.ticketLinksEnabled);
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
            <Group gap="xs">
                <Skeleton height={52} width={220} radius="md" />
            </Group>
        );
    }

    if (!links || links.length === 0) return null;

    return (
        <>
            <Group gap="sm" wrap="wrap" align="stretch">
                {links.map((link) => (
                    <TicketCard
                        key={link.id}
                        label={link.label}
                        badgeText={link.badgeText}
                        linkType={link.linkType}
                        onClick={() => setSelectedLink(link)}
                    />
                ))}
            </Group>

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
