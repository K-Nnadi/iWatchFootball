/** Routes where ads are never shown (auth, checkout, landing, etc.). */
const EXCLUDED_EXACT = new Set([
    '/',
    '/signIn',
    '/join',
    '/forgot-password',
    '/checkout',
    '/thankYou',
    '/premium',
]);

const EXCLUDED_PREFIXES = ['/seat-selection/', '/marketplace/buy/'];

export function isAdExcludedRoute(pathname: string): boolean {
    if (EXCLUDED_EXACT.has(pathname)) {
        return true;
    }
    return EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
