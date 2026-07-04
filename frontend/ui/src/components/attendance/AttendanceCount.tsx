import { useQuery } from '@tanstack/react-query';
import { Group, Text } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { getAttendanceCount } from '../../shared/api/attendance.api';

interface AttendanceCountProps {
    fixtureId: number;
}

export function AttendanceCount({ fixtureId }: AttendanceCountProps) {
    const { data } = useQuery({
        queryKey: ['attendance-count', fixtureId],
        queryFn: () => getAttendanceCount(fixtureId),
        staleTime: 5 * 60 * 1000,
    });

    if (!data || data.goingCount === 0) return null;

    return (
        <Group gap={4} align="center">
            <IconUsers size={13} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" c="dimmed">
                {data.goingCount} {data.goingCount === 1 ? 'fan' : 'fans'} going
                {data.hasTicketCount > 0 && ` · ${data.hasTicketCount} with tickets`}
            </Text>
        </Group>
    );
}
