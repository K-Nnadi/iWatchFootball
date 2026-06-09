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
 * Place `<AdSlot placement="banner" />` inside children where the mobile
 * banner should appear (typically directly below the filter toolbar).
 */
export function AdLayout({ children }: AdLayoutProps) {
  const showAds = useShowAds();

  if (!showAds) {
    return <>{children}</>;
  }

  return (
    <Box className={classes.layout}>
      <AdSlot placement="rail-left" unitId="app-rail-left" />
      <Box className={classes.main}>
        <AdSlot placement="banner" unitId="app-banner" />
        {children}
      </Box>
      <AdSlot placement="rail-right" unitId="app-rail-right" />
    </Box>
  );
}
