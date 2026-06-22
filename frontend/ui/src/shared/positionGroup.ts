export type SquadPositionGroup = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

export const SQUAD_POSITION_GROUP_ORDER: SquadPositionGroup[] = [
    'Goalkeeper',
    'Defender',
    'Midfielder',
    'Forward',
];

/** Maps a specific position name (and optional DB type) to a squad section bucket. */
export function resolvePositionGroup(
    positionName: string,
    positionType?: string | null,
): SquadPositionGroup {
    const type = positionType?.trim();
    if (
        type === 'Goalkeeper' ||
        type === 'Defender' ||
        type === 'Midfielder' ||
        type === 'Forward'
    ) {
        return type;
    }

    const name = positionName.toLowerCase();

    if (name.includes('goalkeeper') || name.includes('keeper') || name === 'gk') {
        return 'Goalkeeper';
    }

    if (
        name.includes('defender') ||
        name.includes('defence') ||
        name.includes('defense') ||
        name.includes('centre-back') ||
        name.includes('center-back') ||
        name.includes('full-back') ||
        name.includes('back') ||
        name.includes('sweeper') ||
        name.includes('libero')
    ) {
        return 'Defender';
    }

    if (
        name.includes('midfielder') ||
        name.includes('midfield') ||
        name.includes('centre-mid') ||
        name.includes('center-mid') ||
        name.includes('attacking-mid') ||
        name.includes('defensive-mid') ||
        name.includes('wide-mid') ||
        name.includes('central-mid') ||
        name === 'mid' ||
        name.includes(' winger')
    ) {
        return 'Midfielder';
    }

    if (
        name.includes('forward') ||
        name.includes('striker') ||
        name.includes('centre-forward') ||
        name.includes('center-forward') ||
        name.includes('attacker') ||
        name.includes('winger') ||
        name.includes('inside-forward')
    ) {
        return 'Forward';
    }

    if (name.includes('attack') || name.includes('strike')) return 'Forward';
    if (name.includes('mid')) return 'Midfielder';
    if (name.includes('def')) return 'Defender';

    return 'Midfielder';
}
