/** Stable listing key for server-side exclusive hold (fixture + listing id). */
export function buildTicketOfferKey(matchId: string, listingId: string): string {
    return `${matchId}:${listingId}`;
}
