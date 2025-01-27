export enum FixtureStatus {
    SCHEDULED = 'Scheduled',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
    POSTPONED = 'Postponed',
    SUSPENDED = 'Suspended',
    LIVE = 'Live'
}
export enum FixtureStage {
    FINAL = 'Final',
    SEMI_FINAL = 'Semi Final',
    QUARTER_FINAL = 'Quarter Final',
    LAST_16 = 'Last 16',
    LAST_32 = 'Last 32',
    GROUP_STAGE = 'Group Stage',
    THIRD_PLACE = 'Third Place',
    PLAY_OFF = 'Play Off',
    ROUND_ROBIN = 'Round Robin',
    LEAGUE = 'League'
}

export enum HomeOrAway {
    HOME = 'Home',
    AWAY = 'Away',
    NEUTRAL = 'Neutral'
}