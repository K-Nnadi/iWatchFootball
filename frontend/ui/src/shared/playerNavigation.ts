/** True when id is a positive integer suitable for `/player/:id`. */
export function isNavigablePlayerId(id: string | undefined | null): id is string {
    if (!id?.trim()) return false;
    const trimmed = id.trim();
    if (!/^\d+$/.test(trimmed)) return false;
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) && n > 0;
}

export const playerPageTransition = {
    transitionType: 'loading' as const,
    duration: 1200,
};
