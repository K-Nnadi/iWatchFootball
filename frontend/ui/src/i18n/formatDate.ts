import dayjs from 'dayjs';

/** Full heading, e.g. "Tuesday, 9 June 2026" — uses dayjs locale from I18nProvider. */
export function formatMatchHeadingDate(date: Date): string {
    return dayjs(date).format('dddd, D MMMM YYYY');
}

/** Compact chip label, e.g. "9 Jun". */
export function formatMatchShortDate(date: Date): string {
    return dayjs(date).format('D MMM');
}

/** Listing expiry / datetime with weekday. */
export function formatLocaleDateTime(date: Date | string): string {
    return dayjs(date).format('ddd, D MMM YYYY, HH:mm');
}

/** Logged match card — weekday + calendar date. */
export function formatLogCardDate(date: Date | string): string {
    return dayjs(date).format('ddd, D MMM YYYY');
}
