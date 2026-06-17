import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, Button, Center, Group, Stack, Text } from '@mantine/core';
import { IconMapOff } from '@tabler/icons-react';
import { SeatMapCanvas } from '@alisaitteke/seatmap-canvas';
import '@alisaitteke/seatmap-canvas/dist/seatmap.canvas.css';
import type { StadiumSection } from './anfieldStadium';
import {
    stadiumSectionsToSeatmapBlocks,
    sectionIdFromSeatmapBlock,
    sectionIdFromSeatmapSeat,
} from './stadiumSectionsToSeatmapBlocks';
import { hasStadiumSeatmap } from './resolveStadiumSeatmap';
import { useTranslation } from '../../i18n';
import './StadiumMap.css';

export interface StadiumSeatmapPanelProps {
    sections: StadiumSection[] | null;
    venueName?: string;
    onSectionClick?: (sectionId: string) => void;
    selectedSectionId?: string;
    /** Block / section identifiers that have ticket rows in the sidebar (matches `Ticket.block` or section id). */
    blocksWithListings: string[];
    isDark: boolean;
}

function StadiumSeatmapCanvas({
    sections,
    onSectionClick,
    selectedSectionId,
    blocksWithListings,
    isDark,
}: {
    sections: StadiumSection[];
    blocksWithListings: string[];
    isDark: boolean;
    onSectionClick?: (sectionId: string) => void;
    selectedSectionId?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const seatmapRef = useRef<SeatMapCanvas | null>(null);
    const listings = useMemo(() => new Set(blocksWithListings), [blocksWithListings]);

    const blockData = useMemo(
        () =>
            stadiumSectionsToSeatmapBlocks(sections, {
                isDark,
                selectedSectionId,
                blocksWithListings: listings,
            }),
        [sections, isDark, selectedSectionId, listings],
    );

    const blockDataRef = useRef(blockData);
    blockDataRef.current = blockData;

    const lime = 'var(--modern-lime, #b7ff3c)';
    const seatHover = isDark ? '#5eead4' : '#14b8a6';

    const canvasOptions = useMemo(
        () => ({
            json_model: 'seatmap',
            legend: true,
            resizable: true,
            click_enable_sold_seats: true,
            style: {
                seat: {
                    radius: 11,
                    color: '#64748b',
                    hover: seatHover,
                    selected: lime,
                    not_salable: isDark ? '#475569' : '#94a3b8',
                },
                block: {
                    title_color: isDark ? '#f1f5f9' : '#0f172a',
                    title_font_size: 11,
                },
            },
        }),
        [isDark, seatHover, lime],
    );

    const handlersRef = useRef({
        onSectionClick,
    });
    useEffect(() => {
        handlersRef.current = { onSectionClick };
    }, [onSectionClick]);

    const handleSeatOrBlock = useCallback((sectionId: string | undefined) => {
        if (sectionId) handlersRef.current.onSectionClick?.(sectionId);
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const instance = new SeatMapCanvas(el, canvasOptions);

        instance.eventManager.addEventListener('SEAT.CLICK', (seat: unknown) => {
            handleSeatOrBlock(sectionIdFromSeatmapSeat(seat));
        });
        instance.eventManager.addEventListener('BLOCK.CLICK', (block: unknown) => {
            handleSeatOrBlock(sectionIdFromSeatmapBlock(block));
        });

        seatmapRef.current = instance;

        const data = blockDataRef.current;
        let zoomTimer: ReturnType<typeof setTimeout> | undefined;
        if (data.length > 0) {
            instance.data.replaceData(data);
            zoomTimer = setTimeout(() => {
                if (seatmapRef.current === instance) {
                    instance.zoomManager.zoomToVenue();
                }
            }, 80);
        }

        return () => {
            if (zoomTimer) clearTimeout(zoomTimer);
            seatmapRef.current = null;
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        };
    }, [canvasOptions, handleSeatOrBlock]);

    useEffect(() => {
        const instance = seatmapRef.current;
        if (!instance || blockData.length === 0) return;
        instance.data.replaceData(blockData);
    }, [blockData]);

    const handleResetView = () => {
        seatmapRef.current?.zoomManager.zoomToVenue(true);
    };

    return (
        <>
            <Group justify="flex-end" mb="md">
                <Button size="xs" variant="outline" onClick={handleResetView}>
                    RESET VIEW
                </Button>
            </Group>
            <Box
                className="stadium-map-wrapper"
                style={{ height: 500, padding: 0, position: 'relative' }}
            >
                <div
                    ref={containerRef}
                    style={{ width: '100%', height: '100%', minHeight: '100%' }}
                />
            </Box>
        </>
    );
}

export const StadiumSeatmapPanel: React.FC<StadiumSeatmapPanelProps> = ({
    sections,
    venueName,
    onSectionClick,
    selectedSectionId,
    blocksWithListings,
    isDark,
}) => {
    const { t } = useTranslation();

    if (!hasStadiumSeatmap(sections)) {
        return (
            <Box className="stadium-map-container">
                <Center className="stadium-map-unavailable">
                    <Stack align="center" gap="sm" maw={360}>
                        <IconMapOff size={40} stroke={1.5} color="var(--modern-text-secondary)" />
                        <Text fw={600} ta="center" style={{ color: 'var(--modern-text-primary)' }}>
                            {t('seatSelection.noSeatmapTitle')}
                        </Text>
                        <Text size="sm" ta="center" style={{ color: 'var(--modern-text-secondary)' }}>
                            {venueName
                                ? t('seatSelection.noSeatmapVenue', { venue: venueName })
                                : t('seatSelection.noSeatmapBody')}
                        </Text>
                    </Stack>
                </Center>
            </Box>
        );
    }

    return (
        <Box className="stadium-map-container">
            <StadiumSeatmapCanvas
                sections={sections}
                onSectionClick={onSectionClick}
                selectedSectionId={selectedSectionId}
                blocksWithListings={blocksWithListings}
                isDark={isDark}
            />
        </Box>
    );
};
