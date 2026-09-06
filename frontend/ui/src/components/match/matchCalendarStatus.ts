/** Calendar-day comparison only (same semantics as lineup/preview tabs). */
export function getMatchStatus(matchDateStr: string): 'past' | 'today' | 'future' {
    const matchDate = new Date(matchDateStr);
    const now = new Date();

    const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (matchDay < today) {
        return 'past';
    }
    if (matchDay.getTime() === today.getTime()) {
        return 'today';
    }
    return 'future';
}

/** True until kickoff — predictions stay open for today's not-yet-started matches. */
export function isKickoffUpcoming(matchDateStr: string, now: Date = new Date()): boolean {
    const kickoff = new Date(matchDateStr);
    if (Number.isNaN(kickoff.getTime())) return false;
    return kickoff.getTime() > now.getTime();
}
