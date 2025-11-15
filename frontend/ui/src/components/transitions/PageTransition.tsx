import React, { useEffect, useState } from 'react';
import { Box, Text, Stack } from '@mantine/core';
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
      
      // Fade in the loading screen
      setLoadingOpacity(1);
      
      // Phase 1: Spin for 60% of duration
      const spinDuration = duration * 0.6;
      const spinTimer = setTimeout(() => {
        setAnimationPhase('stop');
      }, spinDuration);
      
      // Phase 2: Stop and zoom for remaining 40% of duration
      const zoomStartTime = spinDuration; // 200ms pause between spin and zoom
      const zoomTimer = setTimeout(() => {
        setAnimationPhase('zoom');
      }, zoomStartTime);
      
      // Phase 3: Fade out and show content
      const fadeOutTimer = setTimeout(() => {
        setLoadingOpacity(0);
        
        // After fade out completes, show content and end transition
        setTimeout(() => {
          setShowContent(true);
          setAnimationPhase('spin'); // Reset for next transition
          usePageTransitionStore.getState().endTransition();
        }, 300); // 300ms for fade out
      }, duration - 300); // Start fade out 300ms before total duration
      
      return () => {
        clearTimeout(spinTimer);
        clearTimeout(zoomTimer);
        clearTimeout(fadeOutTimer);
      };
    }
  }, [isTransitioning, duration]);

  const getTransitionStyles = () => {
    const baseStyles = {
      transition: `opacity ${duration}ms ease-in-out`,
      opacity: showContent ? 1 : 0,
      willChange: showContent ? 'auto' : 'opacity',
      backfaceVisibility: 'hidden' as const,
      WebkitBackfaceVisibility: 'hidden' as const,
      transform: 'translateZ(0)',
      WebkitTransform: 'translateZ(0)',
    };

    switch (transitionType) {
      case 'slide':
        return {
          ...baseStyles,
          transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
          transform: showContent ? 'translateX(0) translateZ(0)' : 'translateX(100%) translateZ(0)',
          willChange: showContent ? 'auto' : 'opacity, transform',
        };
      case 'scale':
        return {
          ...baseStyles,
          transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
          transform: showContent ? 'scale(1) translateZ(0)' : 'scale(0.95) translateZ(0)',
          willChange: showContent ? 'auto' : 'opacity, transform',
        };
      case 'loading':
        return {
          ...baseStyles,
          transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
          transform: showContent ? 'translateY(0) translateZ(0)' : 'translateY(20px) translateZ(0)',
          willChange: showContent ? 'auto' : 'opacity, transform',
        };
      default: // fade
        return baseStyles;
    }
  };

  if (isTransitioning && transitionType === 'loading') {
    const getAnimationStyles = () => {
      const baseSize = 120;
      const maxZoomSize = 800; // Maximum zoom size
      
      switch (animationPhase) {
        case 'spin':
          return {
            width: `${baseSize}px`,
            height: `${baseSize}px`,
            animation: 'spin 1.5s linear infinite',
            transform: 'scale(1)',
          };
        case 'stop':
          return {
            width: `${baseSize}px`,
            height: `${baseSize}px`,
            animation: 'none',
            transform: 'scale(1)',
            transition: 'all 0.3s ease-out',
          };
        case 'zoom':
          return {
            width: `${maxZoomSize}px`,
            height: `${maxZoomSize}px`,
            animation: 'none',
            transform: 'scale(1)',
            transition: 'all 0.8s ease-in',
          };
        default:
          return {
            width: `${baseSize}px`,
            height: `${baseSize}px`,
            animation: 'none',
            transform: 'scale(1)',
          };
      }
    };

    return (
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--modern-black)',
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
          willChange: loadingOpacity < 1 ? 'opacity' : 'auto',
        }}
      >
          <Box
              style={{
                  position: 'relative',
                  ...getAnimationStyles(),
              }}
          >
              <img
                  src="/green-football-transparent.png"
                  style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                  }}
              />
          </Box>
      </Box>
    );
  }

  return (
    <Box style={getTransitionStyles()}>
      {children}
    </Box>
  );
}
