import { Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconStar, IconShieldCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getUserTrustSummary, type UserTrustSummary } from '../../shared/api/marketplace.api';

export function TrustBadge({ userId, compact = false }: { userId: number; compact?: boolean }) {
    const [summary, setSummary] = useState<UserTrustSummary | null>(null);

    useEffect(() => {
        let cancelled = false;
        void getUserTrustSummary(userId)
            .then((data) => {
                if (!cancelled) setSummary(data);
            })
            .catch(() => {
                if (!cancelled) setSummary(null);
            });
        return () => {
            cancelled = true;
        };
    }, [userId]);

    if (!summary) return null;

    const verified = summary.trustScore >= 70 && summary.totalTransactions >= 3;
    const label = verified ? 'Verified seller' : `${summary.trustScore} trust`;

    return (
        <Tooltip
            label={`${summary.averageRating.toFixed(1)}★ from ${summary.totalTransactions} rating${
                summary.totalTransactions === 1 ? '' : 's'
            } · trust ${summary.trustScore}/100`}
        >
            <Badge
                size={compact ? 'xs' : 'sm'}
                variant="light"
                color={verified ? 'green' : 'gray'}
                leftSection={verified ? <IconShieldCheck size={12} /> : <IconStar size={12} />}
            >
                <Group gap={4} wrap="nowrap">
                    <Text size="xs">{label}</Text>
                    {summary.totalTransactions > 0 && (
                        <Text size="xs" c="dimmed">
                            {summary.averageRating.toFixed(1)}★
                        </Text>
                    )}
                </Group>
            </Badge>
        </Tooltip>
    );
}
