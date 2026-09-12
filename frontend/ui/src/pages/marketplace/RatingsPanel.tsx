import { useEffect, useState } from 'react';
import { Button, Group, Paper, Stack, Text, Textarea } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { notify } from '../../shared/notify';
import { getMyListingRating, submitListingRating } from '../../shared/api/marketplace.api';

export function RatingsPanel(props: {
    listingId: number;
    targetUserId: number;
    raterRole: 'BUYER' | 'SELLER';
    enabled: boolean;
}) {
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState('');
    const [existing, setExisting] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!props.enabled) return;
        let cancelled = false;
        void getMyListingRating(props.listingId)
            .then((row) => {
                if (!cancelled) setExisting(row?.score ?? null);
            })
            .catch(() => {
                if (!cancelled) setExisting(null);
            });
        return () => {
            cancelled = true;
        };
    }, [props.enabled, props.listingId]);

    if (!props.enabled) return null;

    if (existing != null) {
        return (
            <Text size="xs" c="dimmed">
                You rated this {props.raterRole === 'BUYER' ? 'seller' : 'buyer'} {existing}/5.
            </Text>
        );
    }

    return (
        <Paper p="sm" radius="sm" withBorder>
            <Stack gap="xs">
                <Text size="sm" fw={600}>
                    Rate this {props.raterRole === 'BUYER' ? 'seller' : 'buyer'}
                </Text>
                <Group gap={4}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Button
                            key={n}
                            size="compact-xs"
                            variant={score >= n ? 'filled' : 'subtle'}
                            color="yellow"
                            onClick={() => setScore(n)}
                            leftSection={<IconStar size={12} />}
                        >
                            {n}
                        </Button>
                    ))}
                </Group>
                <Textarea
                    size="xs"
                    placeholder="Optional comment"
                    value={comment}
                    onChange={(e) => setComment(e.currentTarget.value)}
                    maxLength={300}
                />
                <Button
                    size="xs"
                    disabled={score < 1}
                    loading={submitting}
                    onClick={() => {
                        setSubmitting(true);
                        void submitListingRating({
                            listingId: props.listingId,
                            targetUserId: props.targetUserId,
                            raterRole: props.raterRole,
                            score,
                            comment: comment.trim() || undefined,
                        })
                            .then(() => {
                                setExisting(score);
                                notify.success('Thanks', 'Your rating was saved.');
                            })
                            .catch(() => notify.error('Could not rate', 'Please try again.'))
                            .finally(() => setSubmitting(false));
                    }}
                >
                    Submit rating
                </Button>
            </Stack>
        </Paper>
    );
}
