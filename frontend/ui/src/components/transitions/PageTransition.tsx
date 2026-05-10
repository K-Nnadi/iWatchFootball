import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mantine/core';
import { usePageTransitionStore } from '../../shared/stores/pageTransition.store';

interface PageTransitionProps {
    children: React.ReactNode;
}

const FADE_OUT_DURATION = 500;

export function PageTransition({ children }: PageTransitionProps) {
    const { isTransitioning, transitionType, duration } = usePageTransitionStore();

    const [overlayMounted, setOverlayMounted] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<'spin' | 'stop' | 'zoom'>('spin');
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearAllTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    useEffect(() => {
        if (!isTransitioning || transitionType !== 'loading') return;

        clearAllTimers();

        const spinDuration = duration * 0.5;
        const stopDuration = duration * 0.1;
        const zoomDuration = duration * 0.3;

        // Appear instantly — no fade-in so the content switch is never visible.
        setIsFadingOut(false);
        setOverlayMounted(true);
        setAnimationPhase('spin');

        const t1 = setTimeout(() => setAnimationPhase('stop'), spinDuration);
        const t2 = setTimeout(() => setAnimationPhase('zoom'), spinDuration + stopDuration);

        // After zoom completes, trigger the fade-out via CSS transition.
        const t3 = setTimeout(() => {
            setIsFadingOut(true);

            // Only unmount + end transition after the CSS fade has fully played.
            const t4 = setTimeout(() => {
                setOverlayMounted(false);
                setIsFadingOut(false);
                setAnimationPhase('spin');
                usePageTransitionStore.getState().endTransition();
            }, FADE_OUT_DURATION);

            timersRef.current.push(t4);
        }, spinDuration + stopDuration + zoomDuration);

        timersRef.current.push(t1, t2, t3);

        return () => clearAllTimers();
    }, [isTransitioning, transitionType, duration]);

    const getBallStyles = (): React.CSSProperties => {
        const baseSize = 120;
        const maxZoomSize = 800;
        const zoomDuration = duration * 0.3;

        switch (animationPhase) {
            case 'spin':
                return {
                    width: `${baseSize}px`,
                    height: `${baseSize}px`,
                    animation: 'spin 1.5s linear infinite',
                };
            case 'stop':
                return {
                    width: `${baseSize}px`,
                    height: `${baseSize}px`,
                    animation: 'none',
                    transition: 'none',
                };
            case 'zoom':
                return {
                    width: `${maxZoomSize}px`,
                    height: `${maxZoomSize}px`,
                    animation: 'none',
                    transition: `width ${zoomDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
                                 height ${zoomDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                };
        }
    };

    return (
        <>
            <Box
                className="page-transition-wrapper"
                style={{
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    gap: 0,
                }}
            >
                {children}
            </Box>

            {overlayMounted && (
                <Box
                    className="page-transition-loading"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'var(--modern-bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        overflow: 'hidden',
                        // No transition on entry — appear instantly to cover content swap.
                        // Transition only on exit so the fade-out is smooth.
                        opacity: isFadingOut ? 0 : 1,
                        transition: isFadingOut ? `opacity ${FADE_OUT_DURATION}ms ease-in-out` : 'none',
                    }}
                >
                    <Box
                        className="page-transition-ball"
                        style={{ position: 'relative', flexShrink: 0, ...getBallStyles() }}
                    >
                        <img
                            src="/green-football-transparent.png"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </Box>
                </Box>
            )}
        </>
    );
}
