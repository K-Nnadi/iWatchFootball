import React from 'react';
import { Box } from '@mantine/core';

interface AdBannerProps {
    height?: number | { base?: number; md?: number };
    className?: string;
}

export function AdBanner({ height = { base: 90, md: 100 }, className }: AdBannerProps) {
    const heightStyle = typeof height === 'number' 
        ? { height: `${height}px`, minHeight: `${height}px` }
        : {
            height: `${height.base || 90}px`,
            minHeight: `${height.base || 90}px`,
            '@media (min-width: 768px)': {
                height: `${height.md || 100}px`,
                minHeight: `${height.md || 100}px`,
            }
        };

    return (
        <Box
            className={`ad-banner ${className || ''}`}
            style={{
                width: '100%',
                ...(typeof height === 'number' 
                    ? { height: `${height}px`, minHeight: `${height}px` }
                    : { height: `${height.base || 90}px`, minHeight: `${height.base || 90}px` }
                ),
                backgroundColor: 'var(--modern-bg-secondary, #1a1a1a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 100,
                margin: 0,
                padding: 0,
                flexShrink: 0,
            }}
        >
            {/* Ad placeholder - replace with actual ad content */}
            <Box
                style={{
                    width: '100%',
                    maxWidth: '728px', // Standard leaderboard ad width
                    height: '100%',
                    minHeight: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px dashed var(--modern-border-color, rgba(255, 255, 255, 0.2))',
                    borderRadius: '4px',
                    color: 'var(--modern-text-secondary, rgba(255, 255, 255, 0.5))',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    padding: '0.5rem',
                }}
            >
                {/* Replace this with your actual ad component or ad network integration */}
                <span>Advertisement</span>
            </Box>
        </Box>
    );
}

