import { useState } from 'react';
import {
    ActionIcon,
    AspectRatio,
    Badge,
    Box,
    Card,
    Group,
    Image,
    Overlay,
    Stack,
    Text,
} from '@mantine/core';
import { IconPlayerPlay, IconBrandYoutube, IconExternalLink } from '@tabler/icons-react';
import {
    FixtureHighlight,
    HighlightProvider,
    formatHighlightDuration,
} from '../../shared/api/fixture-highlight.api';

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
            {showEmbed && highlight.embedUrl ? (
                <AspectRatio ratio={16 / 9}>
                    <iframe
                        src={`${highlight.embedUrl}?autoplay=1&rel=0`}
                        title={highlight.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 'none', width: '100%', height: '100%' }}
                    />
                </AspectRatio>
            ) : (
                <Box style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowEmbed(true)}>
                    <AspectRatio ratio={16 / 9}>
                        {highlight.thumbnailUrl ? (
                            <Image
                                src={highlight.thumbnailUrl}
                                alt={highlight.title}
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <Box bg="dark.7" />
                        )}
                    </AspectRatio>
                    <Overlay color="#000" backgroundOpacity={0.3} radius={0} />
                    <Box
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                        }}
                    >
                        <ActionIcon
                            size={52}
                            radius="xl"
                            variant="white"
                            color="dark"
                            aria-label="Play highlight"
                        >
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
                                zIndex: 2,
                                opacity: 0.9,
                            }}
                        >
                            {formatHighlightDuration(highlight.durationSeconds)}
                        </Badge>
                    ) : null}
                </Box>
            )}

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
