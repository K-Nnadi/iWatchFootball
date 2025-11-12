import { Paper, Text, Group } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface ReservationTimerProps {
    initialMinutes?: number;
    onExpire?: () => void;
}

export function ReservationTimer({ initialMinutes = 15, onExpire }: ReservationTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(initialMinutes * 60); // Convert to seconds

    useEffect(() => {
        if (timeRemaining <= 0) {
            onExpire?.();
            return;
        }

        const interval = setInterval(() => {
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
    }, [timeRemaining, onExpire]);

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
            <Group spacing="sm">
                <IconClock size={20} color={isLowTime ? 'red' : undefined} />
                <Text size="sm" weight={500}>
                    The tickets are reserved for you.{' '}
                    <Text component="span" weight={700} color={isLowTime ? 'red' : undefined}>
                        {formatTime(timeRemaining)}
                    </Text>{' '}
                    remaining to finish your order.
                </Text>
            </Group>
        </Paper>
    );
}

