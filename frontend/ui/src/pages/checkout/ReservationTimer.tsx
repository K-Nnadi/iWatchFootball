import { Paper, Text, Group } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';

interface ReservationTimerProps {
    initialMinutes?: number;
    reservationStartTime?: number | null; // Timestamp when reservation started
    /** When set (server hold), countdown uses this absolute deadline instead of start+duration */
    holdDeadlineMs?: number | null;
    onExpire?: () => void;
}

export function ReservationTimer({ 
    initialMinutes = 10, 
    reservationStartTime = null,
    holdDeadlineMs = null,
    onExpire 
}: ReservationTimerProps) {
    // Calculate initial time remaining based on persisted start time
    const initialTimeRemaining = useMemo(() => {
        if (holdDeadlineMs != null) {
            return Math.max(0, Math.floor((holdDeadlineMs - Date.now()) / 1000));
        }
        if (reservationStartTime) {
            const elapsed = (Date.now() - reservationStartTime) / 1000; // seconds
            const total = initialMinutes * 60; // total seconds
            const remaining = Math.max(0, total - elapsed);
            return Math.floor(remaining);
        }
        return initialMinutes * 60; // Default: full duration
    }, [holdDeadlineMs, reservationStartTime, initialMinutes]);

    const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);

    // Recalculate when reservationStartTime or initialMinutes changes
    useEffect(() => {
        setTimeRemaining(initialTimeRemaining);
    }, [initialTimeRemaining]);

    useEffect(() => {
        if (timeRemaining <= 0) {
            onExpire?.();
            return;
        }

        const interval = setInterval(() => {
            if (holdDeadlineMs != null) {
                const next = Math.max(0, Math.floor((holdDeadlineMs - Date.now()) / 1000));
                setTimeRemaining(next);
                if (next <= 0) {
                    clearInterval(interval);
                    onExpire?.();
                }
                return;
            }
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onExpire?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining, onExpire, holdDeadlineMs]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeRemaining < 300; // Less than 5 minutes

    return (
        <Paper
            shadow="xs"
            radius="md"
            p="md"
            withBorder
            mb="xl"
            style={{
                backgroundColor: isLowTime ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: isLowTime ? 'rgba(255, 0, 0, 0.3)' : undefined,
            }}
        >
            <Group gap="sm">
                <IconClock size={20} color={isLowTime ? 'red' : undefined} />
                <Text size="sm" fw={500}>
                    The tickets are reserved for you.{' '}
                    <Text component="span" fw={700} color={isLowTime ? 'red' : undefined}>
                        {formatTime(timeRemaining)}
                    </Text>{' '}
                    remaining to finish your order.
                </Text>
            </Group>
        </Paper>
    );
}

