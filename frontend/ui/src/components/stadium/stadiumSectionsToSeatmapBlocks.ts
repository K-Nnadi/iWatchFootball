import { getColorByColorName, type StadiumSection } from './anfieldStadium';

export function stadiumSectionsToSeatmapBlocks(
    sections: StadiumSection[],
    opts: {
        isDark: boolean;
        selectedSectionId?: string;
        blocksWithListings: Set<string>;
    },
) {
    return sections.map((s) => {
        const blockFill = getColorByColorName(s.color, opts.isDark);
        const listed =
            opts.blocksWithListings.has(s.id) || opts.blocksWithListings.has(s.label);
        const salable = listed || (s.available ?? 0) > 0;
        const selected = opts.selectedSectionId === s.id;
        const w = Math.max(s.width, 1);
        const h = Math.max(s.height, 1);

        // seatmap-canvas builds a convex hull from seat (and label) coordinates via d3-polygon.
        // Fewer than three points => polygonHull returns null and the renderer crashes (.length on null).
        const hullSeats = [
            { id: `${s.id}-hull-1`, x: 0, y: 0, title: '', salable: false, color: blockFill },
            { id: `${s.id}-hull-2`, x: w, y: 0, title: '', salable: false, color: blockFill },
            { id: `${s.id}-hull-3`, x: w, y: h, title: '', salable: false, color: blockFill },
            { id: `${s.id}-hull-4`, x: 0, y: h, title: '', salable: false, color: blockFill },
        ];

        return {
            id: s.id,
            title: s.label,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            color: blockFill,
            gap: 4,
            seats: [
                ...hullSeats,
                {
                    id: `${s.id}-spot`,
                    x: Math.round(w / 2),
                    y: Math.round(h / 2),
                    title: s.label,
                    salable,
                    color: selected ? '#2ceb95' : blockFill,
                    custom_data: { sectionId: s.id },
                },
            ],
        };
    });
}

export function sectionIdFromSeatmapSeat(seat: unknown): string | undefined {
    const s = seat as { item?: { block?: { id?: string } } };
    const id = s?.item?.block?.id;
    return id != null ? String(id) : undefined;
}

export function sectionIdFromSeatmapBlock(block: unknown): string | undefined {
    const b = block as { item?: { id?: string } };
    const id = b?.item?.id;
    return id != null ? String(id) : undefined;
}
