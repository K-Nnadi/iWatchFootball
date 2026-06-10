import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mantine/core';
import { usePageTransitionStore } from '../../shared/stores/pageTransition.store';
import classes from './PageTransition.module.css';

interface PageTransitionProps {
    children: React.ReactNode;
}

const FADE_OUT_MS = 500;
const MIN_SPIN_MS = 700;

export function PageTransition({ children }: PageTransitionProps) {
    const { isTransitioning, transitionType, duration } = usePageTransitionStore();

    const [overlayMounted, setOverlayMounted] = useState(false);
    const [isSpinning, setIsSpinning] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearAllTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    useEffect(() => {
        if (!isTransitioning || transitionType !== 'loading') return;

        clearAllTimers();

        setOverlayMounted(true);
        setIsSpinning(true);
        setIsFadingOut(false);

        const spinMs = Math.max(duration - FADE_OUT_MS, MIN_SPIN_MS);

        const fadeTimer = setTimeout(() => {
            setIsSpinning(false);
            setIsFadingOut(true);
        }, spinMs);

        const unmountTimer = setTimeout(() => {
            setOverlayMounted(false);
            setIsSpinning(true);
            setIsFadingOut(false);
            usePageTransitionStore.getState().endTransition();
        }, spinMs + FADE_OUT_MS);

        timersRef.current.push(fadeTimer, unmountTimer);

        return () => clearAllTimers();
    }, [isTransitioning, transitionType, duration]);

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
                    className={`page-transition-loading ${classes.overlay} ${isFadingOut ? classes.overlayFade : ''}`}
                    aria-hidden
                >
                    <div
                        className={`page-transition-ball ${classes.ball} ${isSpinning ? `${classes.ballSpin} page-transition-ball--spinning` : ''} ${isFadingOut ? classes.ballFade : ''}`}
                    >
                        <img
                            src="/green-football-transparent.png"
                            alt=""
                            className={classes.ballImage}
                            draggable={false}
                        />
                    </div>
                </Box>
            )}
        </>
    );
}
