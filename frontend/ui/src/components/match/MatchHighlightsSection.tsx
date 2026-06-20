import { useState } from 'react';
import { Box, Center, Loader, Stack, Text, Title } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconVideo } from '@tabler/icons-react';
import '@mantine/carousel/styles.css';
import {
    FixtureHighlight,
    HighlightType,
    useFixtureHighlights,
} from '../../shared/api/fixture-highlight.api';
import { HighlightCard } from './HighlightCard';
import { HighlightTypeFilter } from './HighlightTypeFilter';

interface MatchHighlightsSectionProps {
    fixtureId: number;
}

export function MatchHighlightsSection({ fixtureId }: MatchHighlightsSectionProps) {
    const [activeType, setActiveType] = useState<HighlightType | 'all'>('all');
    const { data: highlights, isLoading } = useFixtureHighlights(fixtureId);

    const filtered: FixtureHighlight[] =
        activeType === 'all'
            ? (highlights ?? [])
            : (highlights ?? []).filter((h) => h.type === activeType);

    if (isLoading) {
        return (
            <Center py="xl">
                <Loader size="sm" />
            </Center>
        );
    }

    const hasHighlights = (highlights ?? []).length > 0;

    return (
        <Stack gap="md">
            <Title order={5}>Highlights</Title>

            {!hasHighlights ? (
                <Box
                    py="xl"
                    style={{
                        textAlign: 'center',
                        borderRadius: 8,
                        border: '1px dashed var(--mantine-color-default-border)',
                    }}
                >
                    <IconVideo size={32} color="var(--mantine-color-dimmed)" />
                    <Text size="sm" c="dimmed" mt="xs">
                        No highlights available yet.
                        <br />
                        Check back shortly after the match ends.
                    </Text>
                </Box>
            ) : (
                <>
                    <HighlightTypeFilter
                        highlights={highlights ?? []}
                        activeType={activeType}
                        onChange={setActiveType}
                    />
                    <Carousel
                        slideSize={{ base: '90%', xs: '48%', md: '32%' }}
                        slideGap="sm"
                        align="start"
                        withControls={filtered.length > 3}
                        loop={false}
                        containScroll="trimSnaps"
                    >
                        {filtered.map((highlight) => (
                            <Carousel.Slide key={highlight.id}>
                                <HighlightCard highlight={highlight} />
                            </Carousel.Slide>
                        ))}
                    </Carousel>
                </>
            )}
        </Stack>
    );
}
