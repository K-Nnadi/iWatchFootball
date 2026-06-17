import { anfieldStadium, type StadiumData, type StadiumSection } from './anfieldStadium';

const ANFIELD_VENUE_ALIASES = ['anfield', 'anfield road'];

export function sectionsFromStadiumData(data: StadiumData): StadiumSection[] {
    return data.stands.flatMap((stand) => stand.sections);
}

function isStadiumData(value: unknown): value is StadiumData {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as StadiumData;
    return Array.isArray(candidate.stands);
}

function isStadiumSection(value: unknown): value is StadiumSection {
    if (!value || typeof value !== 'object') return false;
    const s = value as StadiumSection;
    return typeof s.id === 'string' && typeof s.label === 'string';
}

/** Reads seat map sections from stadium `metadata` (API or router state). */
export function parseSeatmapFromMetadata(metadata: unknown): StadiumSection[] | null {
    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const meta = metadata as Record<string, unknown>;

    if (isStadiumData(meta.seatmap)) {
        const sections = sectionsFromStadiumData(meta.seatmap);
        return sections.length > 0 ? sections : null;
    }

    if (Array.isArray(meta.seatmapSections) && meta.seatmapSections.every(isStadiumSection)) {
        return meta.seatmapSections.length > 0 ? meta.seatmapSections : null;
    }

    return null;
}

export function resolveStadiumSections(options: {
    venue?: string;
    metadata?: unknown;
}): StadiumSection[] | null {
    const fromMetadata = parseSeatmapFromMetadata(options.metadata);
    if (fromMetadata) {
        return fromMetadata;
    }

    const venue = options.venue?.trim().toLowerCase() ?? '';
    if (ANFIELD_VENUE_ALIASES.some((alias) => venue.includes(alias))) {
        return sectionsFromStadiumData(anfieldStadium);
    }

    return null;
}

export function hasStadiumSeatmap(sections: StadiumSection[] | null | undefined): sections is StadiumSection[] {
    return Array.isArray(sections) && sections.length > 0;
}
