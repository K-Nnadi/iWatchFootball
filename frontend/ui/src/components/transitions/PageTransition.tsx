import React, { useEffect, useState } from 'react';
import { Box } from '@mantine/core';
import { usePageTransitionStore } from '../../shared/stores/pageTransition.store';

interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const { isTransitioning, transitionType, duration } = usePageTransitionStore();
    const [showContent, setShowContent] = useState(true);
    const [loadingOpacity, setLoadingOpacity] = useState(0);
    const [animationPhase, setAnimationPhase] = useState<'spin' | 'stop' | 'zoom'>('spin');

    useEffect(() => {
        if (isTransitioning) {
            setShowContent(false);
            setAnimationPhase('spin');
            setLoadingOpacity(1);

            const spinDuration = duration * 0.5;
            const stopDuration = duration * 0.1;
            const zoomDuration = duration * 0.3;

            const spinTimer = setTimeout(() => setAnimationPhase('stop'), spinDuration);
            const stopTimer = setTimeout(() => {
                setAnimationPhase('zoom');
                setLoadingOpacity(0.8); // start fading while zoom begins
            }, spinDuration + stopDuration);

            const fadeOutTimer = setTimeout(() => {
                setLoadingOpacity(0);
                setTimeout(() => {
                    setShowContent(true);
                    setAnimationPhase('spin');
                    usePageTransitionStore.getState().endTransition();
                }, 300);
            }, spinDuration + stopDuration + zoomDuration);

            return () => {
                clearTimeout(spinTimer);
                clearTimeout(stopTimer);
                clearTimeout(fadeOutTimer);
            };
        }
    }, [isTransitioning, duration]);

    const getTransitionStyles = () => ({
        transition: `opacity ${duration}ms ease-in-out`,
        opacity: showContent ? 1 : 0,
        willChange: showContent ? 'auto' : 'opacity',
        backfaceVisibility: 'hidden' as const,
        WebkitBackfaceVisibility: 'hidden' as const,
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
    });

    if (isTransitioning && transitionType === 'loading') {
        const getAnimationStyles = () => {
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
                        transition: `all ${zoomDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    };
                default:
                    return {};
            }
        };

        return (
            <Box
                className="page-transition-loading"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'var(--modern-bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    opacity: loadingOpacity,
                    transition: 'opacity 300ms ease-in-out',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                }}
            >
                <Box
                    className="page-transition-ball"
                    style={{ position: 'relative', ...getAnimationStyles() }}
                >
                    <img
                        src="/green-football-transparent.png"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </Box>
            </Box>
        );
    }

    return <Box style={getTransitionStyles()}>{children}</Box>;
}

// Include globally (CSS or styled-components)
/*
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
*/
