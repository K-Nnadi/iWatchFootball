import { type ReactNode } from 'react';
import { Box } from '@mantine/core';
import { useShowAds } from '../../hooks/useShowAds';
import { AdSlot } from './AdSlot';
import classes from './AdLayout.module.css';

interface AdLayoutProps {
  children: ReactNode;
}

/**
 * Side rails sit in fixed-width flex columns; main content always gets the remaining width.
 */
export function AdLayout({ children }: AdLayoutProps) {
  const showAds = useShowAds();

  return (
    <Box className={`${classes.layout} ${showAds ? classes.withRails : ''}`}>
      <Box className={classes.railSlot} aria-hidden={!showAds}>
        {showAds ? <AdSlot placement="rail-left" unitId="app-rail-left" /> : null}
      </Box>
      <Box className={classes.main}>
        {showAds ? <AdSlot placement="banner" unitId="app-banner" /> : null}
        {children}
      </Box>
      <Box className={classes.railSlot} aria-hidden={!showAds}>
        {showAds ? <AdSlot placement="rail-right" unitId="app-rail-right" /> : null}
      </Box>
    </Box>
  );
}
