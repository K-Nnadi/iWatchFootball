/** Fallback if `node_modules` is missing; merges cleanly with real `dist/types.d.ts` from the package. */
declare module '@alisaitteke/seatmap-canvas' {
    export class SeatMapCanvas {
        zoomManager: { zoomToVenue: (animation?: boolean) => void };
        data: { replaceData: (data: unknown[]) => void };
        eventManager: { addEventListener: (type: string, fn: (payload: unknown) => void) => void };
        constructor(container: HTMLElement, config?: Record<string, unknown>);
    }
}
