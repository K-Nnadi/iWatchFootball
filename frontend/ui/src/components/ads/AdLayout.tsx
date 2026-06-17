import { type ReactNode } from 'react';
import { Box } from '@mantine/core';
import { useShowAds } from '../../hooks/useShowAds';
import { AdSlot } from './AdSlot';
import classes from './AdLayout.module.css';

interface AdLayoutProps {
  children: ReactNode;
}

/**
 * Wraps page content with optional side-rail ads on wide screens.
 * Keeps a stable wrapper so page content is not remounted when ad visibility changes.
 */
export function AdLayout({ children }: AdLayoutProps) {
  const showAds = useShowAds();

  return (
    <Box className={classes.layout}>
      {showAds ? <AdSlot placement="rail-left" unitId="app-rail-left" /> : null}
      <Box className={classes.main}>
        {showAds ? <AdSlot placement="banner" unitId="app-banner" /> : null}
        {children}
      </Box>
      {showAds ? <AdSlot placement="rail-right" unitId="app-rail-right" /> : null}
    </Box>
  );
}
