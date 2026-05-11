import { Paper, Text, Group } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useState, useEffect, useMemo, useRef } from 'react';

interface ReservationTimerProps {
    initialMinutes?: number;
    reservationStartTime?: number | null;
    /** When set (server hold), countdown uses this absolute deadline instead of start+duration */
    holdDeadlineMs?: number | null;
    onExpire?: () => void;
}

function computeWallClockSecondsRemaining(
    holdDeadlineMs: number | null | undefined,
    reservationStartTime: number | null | undefined,
    initialMinutes: number,
): number | null {
    if (holdDeadlineMs != null) {
        return Math.max(0, Math.floor((holdDeadlineMs - Date.now()) / 1000));
    }
    if (reservationStartTime) {
        const elapsed = (Date.now() - reservationStartTime) / 1000;
        const total = initialMinutes * 60;
        return Math.max(0, Math.floor(total - elapsed));
    }
    return null;
}

export function ReservationTimer({
    initialMinutes = 10,
    reservationStartTime = null,
    holdDeadlineMs = null,
    onExpire,
}: ReservationTimerProps) {
    const initialTimeRemaining = useMemo(() => {
        const wall = computeWallClockSecondsRemaining(
            holdDeadlineMs,
            reservationStartTime,
            initialMinutes,
        );
        return wall != null ? wall : initialMinutes * 60;
    }, [holdDeadlineMs, reservationStartTime, initialMinutes]);

    const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    /** Ensures onExpire runs at most once per reservation window (parent often passes a new inline callback each render). */
    const expireFiredRef = useRef(false);

    useEffect(() => {
        expireFiredRef.current = false;
    }, [holdDeadlineMs, reservationStartTime, initialMinutes]);

    useEffect(() => {
        setTimeRemaining(initialTimeRemaining);
    }, [initialTimeRemaining]);

    useEffect(() => {
        const fireExpireOnce = () => {
            if (expireFiredRef.current) return;
            expireFiredRef.current = true;
            onExpireRef.current?.();
        };

        const wall =
            computeWallClockSecondsRemaining(
                holdDeadlineMs,
                reservationStartTime,
                initialMinutes,
            ) != null;

        let rem = initialTimeRemaining;
        setTimeRemaining(rem);
        if (rem <= 0) {
            fireExpireOnce();
            return;
        }

        const interval = setInterval(() => {
            if (wall) {
                const next = computeWallClockSecondsRemaining(
                    holdDeadlineMs,
                    reservationStartTime,
                    initialMinutes,
                )!;
                setTimeRemaining(next);
                if (next <= 0) {
                    clearInterval(interval);
                    fireExpireOnce();
                }
                return;
            }

            rem -= 1;
            const next = Math.max(0, rem);
            setTimeRemaining(next);
            if (next <= 0) {
                clearInterval(interval);
                fireExpireOnce();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [holdDeadlineMs, reservationStartTime, initialMinutes, initialTimeRemaining]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeRemaining < 300;

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
