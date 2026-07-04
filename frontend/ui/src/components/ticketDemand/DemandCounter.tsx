import { useQuery } from '@tanstack/react-query';
import { Group, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { getTicketDemand } from '../../shared/api/ticketInterest.api';

interface DemandCounterProps {
    fixtureId: number;
}

export function DemandCounter({ fixtureId }: DemandCounterProps) {
    const { data } = useQuery({
        queryKey: ['ticket-demand', fixtureId],
        queryFn: () => getTicketDemand(fixtureId),
        staleTime: 5 * 60 * 1000,
    });

    if (!data || data.interestedCount === 0) return null;

    return (
        <Group gap={4} align="center">
            <IconSearch size={13} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" c="dimmed">
                {data.interestedCount} {data.interestedCount === 1 ? 'fan' : 'fans'} looking for tickets
            </Text>
        </Group>
    );
}
