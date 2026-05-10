import { useState, useEffect } from 'react';
import {
    Badge,
    Box,
    Center,
    Container,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    ThemeIcon,
} from '@mantine/core';
import {
    IconCurrencyPound,
    IconArrowDown,
    IconArrowUp,
    IconRefresh,
    IconCreditCard,
} from '@tabler/icons-react';
import { ModernH1, ModernCard } from '../components/modern';
import { getMyCredit, getMyTransactions, type WalletTransaction } from '../shared/api/wallet.api';

const TX_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    CASH_PAYMENT: {
        label: 'Ticket purchase',
        color: 'gray',
        icon: <IconCreditCard size={16} />,
    },
    CREDIT_TOP_UP: {
        label: 'Sale proceeds',
        color: 'teal',
        icon: <IconArrowDown size={16} />,
    },
    CREDIT_USAGE: {
        label: 'Paid with credit',
        color: 'blue',
        icon: <IconCurrencyPound size={16} />,
    },
    REFUND: {
        label: 'Refund',
        color: 'yellow',
        icon: <IconArrowUp size={16} />,
    },
    CREDIT_REFUND: {
        label: 'Credit refund',
        color: 'yellow',
        icon: <IconRefresh size={16} />,
    },
};

function formatAmount(tx: WalletTransaction): string {
    const sign =
        tx.type === 'CREDIT_TOP_UP' || tx.type === 'REFUND' || tx.type === 'CREDIT_REFUND'
            ? '+'
            : '-';
    return `${sign}£${Math.abs(Number(tx.amount)).toFixed(2)}`;
}

function amountColor(tx: WalletTransaction): string {
    if (tx.type === 'CREDIT_TOP_UP' || tx.type === 'REFUND' || tx.type === 'CREDIT_REFUND')
        return 'teal';
    return 'dimmed';
}

export function WalletPage() {
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            setLoading(true);
            const [credit, txs] = await Promise.all([getMyCredit(), getMyTransactions()]);
            setBalance(credit ? Number(credit.balance) : 0);
            setTransactions(txs);
            setLoading(false);
        })();
    }, []);

    return (
        <Container size="sm" py="xl">
            <Stack gap="xl">
                <ModernH1>My Wallet</ModernH1>

                {/* Balance card */}
                <ModernCard>
                    <Group gap="md" align="center">
                        <ThemeIcon size={56} radius="xl" color="teal" variant="light">
                            <IconCurrencyPound size={30} />
                        </ThemeIcon>
                        <Box>
                            <Text size="sm" c="dimmed">
                                Available balance
                            </Text>
                            {loading ? (
                                <Loader size="sm" />
                            ) : (
                                <Text fw={700} fz={32} c="teal">
                                    £{(balance ?? 0).toFixed(2)}
                                </Text>
                            )}
                            <Text size="xs" c="dimmed">
                                Earned from marketplace ticket sales
                            </Text>
                        </Box>
                    </Group>
                </ModernCard>

                <Paper p="md" radius="md" withBorder>
                    <Text fw={600} size="md" mb="xs">
                        Tier progress & perks
                    </Text>
                    <Text size="sm" c="dimmed">
                        Spending toward loyalty tiers counts only net amounts paid with card or PayPal after
                        discounts. Paying with wallet credit doesn’t count toward tier progress. Marketplace
                        sales count the same way for card/PayPal buyers; full-order refunds reduce your
                        qualifying spend. Detailed tier milestones are coming soon.
                    </Text>
                </Paper>

                {/* Transaction history */}
                <Box>
                    <Text fw={600} fz="xl" mb="md">
                        Transaction History
                    </Text>

                    {loading ? (
                        <Center py="xl">
                            <Loader />
                        </Center>
                    ) : transactions.length === 0 ? (
                        <Paper p="xl" radius="md" withBorder>
                            <Center>
                                <Stack align="center" gap="xs">
                                    <IconCurrencyPound size={40} color="gray" />
                                    <Text c="dimmed" size="sm">
                                        No transactions yet
                                    </Text>
                                </Stack>
                            </Center>
                        </Paper>
                    ) : (
                        <Stack gap="sm">
                            {transactions.map((tx) => {
                                const cfg = TX_CONFIG[tx.type] ?? {
                                    label: tx.type,
                                    color: 'gray',
                                    icon: null,
                                };
                                return (
                                    <Paper key={tx.id} p="md" radius="md" withBorder>
                                        <Group justify="space-between">
                                            <Group gap="sm">
                                                <ThemeIcon
                                                    size={32}
                                                    radius="xl"
                                                    color={cfg.color}
                                                    variant="light"
                                                >
                                                    {cfg.icon}
                                                </ThemeIcon>
                                                <Box>
                                                    <Group gap="xs">
                                                        <Text fw={500} size="sm">
                                                            {tx.description || cfg.label}
                                                        </Text>
                                                        <Badge
                                                            size="xs"
                                                            color={cfg.color}
                                                            variant="light"
                                                        >
                                                            {cfg.label}
                                                        </Badge>
                                                    </Group>
                                                    <Text size="xs" c="dimmed">
                                                        {new Date(tx.createdAt).toLocaleString(
                                                            'en-GB',
                                                        )}
                                                    </Text>
                                                </Box>
                                            </Group>
                                            <Text fw={700} c={amountColor(tx)}>
                                                {formatAmount(tx)}
                                            </Text>
                                        </Group>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Stack>
        </Container>
    );
}
