import { Group, ScrollArea, Tabs } from '@mantine/core';
import {
    FixtureHighlight,
    HIGHLIGHT_TYPE_LABELS,
    HighlightType,
} from '../../shared/api/fixture-highlight.api';

interface HighlightTypeFilterProps {
    highlights: FixtureHighlight[];
    activeType: HighlightType | 'all';
    onChange: (type: HighlightType | 'all') => void;
}

export function HighlightTypeFilter({ highlights, activeType, onChange }: HighlightTypeFilterProps) {
    const availableTypes = Array.from(new Set(highlights.map((h) => h.type)));

    if (availableTypes.length <= 1) return null;

    return (
        <ScrollArea type="never">
            <Tabs
                value={activeType}
                onChange={(val) => onChange((val as HighlightType | 'all') ?? 'all')}
                variant="pills"
            >
                <Tabs.List>
                    <Group gap={4}>
                        <Tabs.Tab value="all">All</Tabs.Tab>
                        {availableTypes.map((type) => (
                            <Tabs.Tab key={type} value={type}>
                                {HIGHLIGHT_TYPE_LABELS[type]}
                            </Tabs.Tab>
                        ))}
                    </Group>
                </Tabs.List>
            </Tabs>
        </ScrollArea>
    );
}
