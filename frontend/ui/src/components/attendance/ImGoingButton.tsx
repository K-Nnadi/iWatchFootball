import { useState } from 'react';
import { Button, Loader } from '@mantine/core';
import { IconCalendarCheck, IconCalendarPlus } from '@tabler/icons-react';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';
import { useQuery } from '@tanstack/react-query';
import { getMyAttendance, type AttendanceRecord } from '../../shared/api/attendance.api';
import { AttendanceModal } from './AttendanceModal';

interface ImGoingButtonProps {
    fixtureId: number;
}

export function ImGoingButton({ fixtureId }: ImGoingButtonProps) {
    const attendanceTrackingEnabled = usePlatformFeaturesStore((s) => s.attendanceTrackingEnabled);
    const [modalOpen, setModalOpen] = useState(false);

    const { data: myAttendance, isLoading, refetch } = useQuery({
        queryKey: ['my-attendance'],
        queryFn: getMyAttendance,
        enabled: attendanceTrackingEnabled,
        staleTime: 2 * 60 * 1000,
    });

    if (!attendanceTrackingEnabled) return null;

    const existing = myAttendance?.find((a) => a.fixtureId === fixtureId);

    const handleSaved = () => {
        void refetch();
        setModalOpen(false);
    };

    return (
        <>
            {isLoading ? (
                <Button variant="light" size="sm" disabled leftSection={<Loader size="xs" />}>
                    Loading…
                </Button>
            ) : existing ? (
                <Button
                    variant="light"
                    color="green"
                    size="sm"
                    leftSection={<IconCalendarCheck size={16} />}
                    onClick={() => setModalOpen(true)}
                >
                    You're going
                </Button>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    leftSection={<IconCalendarPlus size={16} />}
                    onClick={() => setModalOpen(true)}
                >
                    I'm going
                </Button>
            )}

            <AttendanceModal
                fixtureId={fixtureId}
                existing={existing ?? null}
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />
        </>
    );
}
