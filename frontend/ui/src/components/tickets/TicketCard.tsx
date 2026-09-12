import { ActionIcon, Badge, Group, Paper, Select, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { IconInfoCircle, IconPrinter, IconCamera } from '@tabler/icons-react';
import { ModernButton, ModernH3 } from '../modern';

export interface Ticket {
    id: string;
    category: number;
    block?: string;
    row?: string;
    seatsTogether: number;
    ticketType: 'Single Seats' | 'Up To 2 Seats Together' | 'Up To 4 Seats Together';
    fanSide?: 'Home' | 'Away' | 'Neutral';
    ticketFormat: 'E-Ticket' | 'Print at Home';
    price: number;
    available: number;
    clearView: boolean;
    adultTickets: boolean;
}

interface TicketCardProps {
    ticket: Ticket;
    onBuyNow: (ticketId: string) => void | Promise<void>;
    buying?: boolean;
}

const CATEGORY_COLORS: Record<number, string> = {
    1: 'red',
    2: 'orange',
    3: 'blue',
    4: 'gray',
};

export function TicketCard({ ticket, onBuyNow, buying }: TicketCardProps) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const maxQuantity = Math.min(ticket.available, 10);
    const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString(),
    }));

    const defaultBorder = isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'var(--modern-border-color)';

    return (
        <Paper
            p="md"
            style={{
                backgroundColor: isDark ? 'var(--modern-black)' : 'var(--modern-bg-secondary)',
                border: `1px solid ${defaultBorder}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: 'auto',
                flex: '0 0 auto',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--modern-lime)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = defaultBorder;
            }}
        >
            <Stack gap="sm">
                <Group justify="space-between">
                    <Badge color={CATEGORY_COLORS[ticket.category] || 'gray'}>
                        Category {ticket.category}
                    </Badge>
                    <Group gap="xs">
                        <ActionIcon size="sm" variant="subtle" aria-label="Ticket information">
                            <IconInfoCircle size={16} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle" aria-label="Print ticket">
                            <IconPrinter size={16} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle" aria-label="View seat">
                            <IconCamera size={16} />
                        </ActionIcon>
                    </Group>
                </Group>

                <Text size="sm" fw={600} style={{ color: 'var(--modern-text-primary)' }}>
                    {ticket.ticketType}
                </Text>

                <Group gap="xs" wrap="wrap">
                    {ticket.row && (
                        <Text size="xs" style={{ color: 'var(--modern-text-secondary)' }}>
                            Row: {ticket.row}
                        </Text>
                    )}
                    {ticket.fanSide && (
                        <Text size="xs" style={{ color: 'var(--modern-text-secondary)' }}>
                            {ticket.fanSide} Fans
                        </Text>
                    )}
                    {ticket.block && (
                        <Text size="xs" style={{ color: 'var(--modern-text-secondary)' }}>
                            Block: {ticket.block}
                        </Text>
                    )}
                    {ticket.clearView && (
                        <Badge size="xs" variant="light" color="green">
                            Clear View
                        </Badge>
                    )}
                    {ticket.adultTickets && (
                        <Text size="xs" style={{ color: 'var(--modern-text-secondary)' }}>
                            Adult Tickets
                        </Text>
                    )}
                </Group>

                <Group justify="space-between" align="center">
                    <Select
                        placeholder="Qty"
                        data={quantityOptions}
                        defaultValue="1"
                        size="xs"
                        style={{ width: 80 }}
                        aria-label="Select quantity"
                    />
                    <Text size="lg" fw={700} style={{ color: 'var(--modern-lime)' }}>
                        £{ticket.price.toFixed(2)} per ticket
                    </Text>
                </Group>

                <ModernButton
                    fullWidth
                    variant="primary"
                    size="sm"
                    loading={buying}
                    onClick={() => void onBuyNow(ticket.id)}
                >
                    Buy Now
                </ModernButton>
            </Stack>
        </Paper>
    );
}
