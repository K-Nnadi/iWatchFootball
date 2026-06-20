import { useState } from 'react';
import {
    ActionIcon,
    Badge,
    Box,
    Card,
    Group,
    Image,
    Stack,
    Text,
} from '@mantine/core';
import { IconPlayerPlay, IconBrandYoutube, IconExternalLink } from '@tabler/icons-react';
import {
    FixtureHighlight,
    HighlightProvider,
    formatHighlightDuration,
} from '../../shared/api/fixture-highlight.api';

const CARD_VIDEO_HEIGHT = 180;

interface HighlightCardProps {
    highlight: FixtureHighlight;
}

export function HighlightCard({ highlight }: HighlightCardProps) {
    const [showEmbed, setShowEmbed] = useState(false);

    const providerIcon =
        highlight.provider === HighlightProvider.YOUTUBE ? (
            <IconBrandYoutube size={14} />
        ) : null;

    return (
        <Card radius="md" withBorder p={0} style={{ overflow: 'hidden' }}>
            {/* Fixed-height video area — same size whether thumbnail or iframe */}
            <Box style={{ height: CARD_VIDEO_HEIGHT, position: 'relative', flexShrink: 0 }}>
                {showEmbed && highlight.embedUrl ? (
                    <iframe
                        src={`${highlight.embedUrl}?autoplay=1&rel=0`}
                        title={highlight.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                            border: 'none',
                            width: '100%',
                            height: '100%',
                            display: 'block',
                        }}
                    />
                ) : (
                    <Box
                        style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}
                        onClick={() => setShowEmbed(true)}
                    >
                        {highlight.thumbnailUrl ? (
                            <Image
                                src={highlight.thumbnailUrl}
                                alt={highlight.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <Box bg="dark.7" style={{ width: '100%', height: '100%' }} />
                        )}
                        {/* Overlay */}
                        <Box
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ActionIcon size={52} radius="xl" variant="white" color="dark" aria-label="Play">
                                <IconPlayerPlay size={28} />
                            </ActionIcon>
                        </Box>
                        {highlight.durationSeconds ? (
                            <Badge
                                size="xs"
                                radius="sm"
                                color="dark"
                                style={{
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 8,
                                    opacity: 0.9,
                                }}
                            >
                                {formatHighlightDuration(highlight.durationSeconds)}
                            </Badge>
                        ) : null}
                    </Box>
                )}
            </Box>

            <Stack gap={4} p="xs">
                <Text size="sm" fw={500} lineClamp={2} title={highlight.title}>
                    {highlight.title}
                </Text>
                <Group gap={6} justify="space-between">
                    <Group gap={4}>
                        {providerIcon}
                        {highlight.channelName ? (
                            <Text size="xs" c="dimmed" lineClamp={1}>
                                {highlight.channelName}
                            </Text>
                        ) : null}
                        {highlight.isOfficial ? (
                            <Badge size="xs" color="green" variant="light">
                                Official
                            </Badge>
                        ) : null}
                    </Group>
                    {highlight.sourceUrl ? (
                        <ActionIcon
                            component="a"
                            href={highlight.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            variant="subtle"
                            color="gray"
                            aria-label="Open on YouTube"
                        >
                            <IconExternalLink size={12} />
                        </ActionIcon>
                    ) : null}
                </Group>
            </Stack>
        </Card>
    );
}
