import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollDocumentToTop() {
    const instant = { top: 0, left: 0, behavior: 'auto' as const };
    window.scrollTo(instant);
    document.documentElement.scrollTo(instant);
    document.body.scrollTo(instant);

    document.querySelectorAll<HTMLElement>('.mantine-AppShell-Main').forEach((el) => {
        el.scrollTo(instant);
        el.scrollTop = 0;
    });
}

/**
 * AppShell.Main is the real scroller, so React Router's window ScrollRestoration
 * never fires. Reset that pane (and the document) on every path change.
 */
export function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useLayoutEffect(() => {
        if (hash) {
            const id = decodeURIComponent(hash.replace(/^#/, ''));
            const target = id ? document.getElementById(id) : null;
            if (target) {
                target.scrollIntoView({ behavior: 'auto', block: 'start' });
                return;
            }
        }

        scrollDocumentToTop();
    }, [pathname, hash]);

    return null;
}
