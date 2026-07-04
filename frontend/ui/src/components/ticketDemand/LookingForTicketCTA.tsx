import { useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { IconTicketOff } from '@tabler/icons-react';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';
import { useQuery } from '@tanstack/react-query';
import { getMyTicketInterests } from '../../shared/api/ticketInterest.api';
import { TicketInterestForm } from './TicketInterestForm';

interface LookingForTicketCTAProps {
    fixtureId: number;
}

export function LookingForTicketCTA({ fixtureId }: LookingForTicketCTAProps) {
    const ticketDemandEnabled = usePlatformFeaturesStore((s) => s.ticketDemandEnabled);
    const [formOpen, setFormOpen] = useState(false);

    const { data: myInterests, isLoading, refetch } = useQuery({
        queryKey: ['my-ticket-interests'],
        queryFn: getMyTicketInterests,
        enabled: ticketDemandEnabled,
        staleTime: 2 * 60 * 1000,
    });

    if (!ticketDemandEnabled) return null;

    const activeInterest = myInterests?.find((i) => i.fixtureId === fixtureId && i.status === 'ACTIVE');

    if (activeInterest) {
        return (
            <Group gap="xs" align="center">
                <IconTicketOff size={14} style={{ color: 'var(--mantine-color-yellow-5)' }} />
                <Text size="sm" c="dimmed">Looking for tickets — we'll notify you when resale launches</Text>
            </Group>
        );
    }

    return (
        <>
            <Button
                variant="subtle"
                size="xs"
                leftSection={<IconTicketOff size={14} />}
                loading={isLoading}
                onClick={() => setFormOpen(true)}
            >
                Looking for a ticket?
            </Button>

            <TicketInterestForm
                fixtureId={fixtureId}
                opened={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={() => {
                    void refetch();
                    setFormOpen(false);
                }}
            />
        </>
    );
}
