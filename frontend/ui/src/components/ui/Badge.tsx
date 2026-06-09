import React from 'react';
import { Badge, BadgeProps } from '@mantine/core';

export interface UiBadgeProps extends BadgeProps {
  live?: boolean;
}

export const UiBadge: React.FC<UiBadgeProps> = ({ live, style, ...props }) => (
  <Badge
    {...props}
    variant="light"
    color={live ? 'red' : props.color ?? 'green'}
    style={{
      fontWeight: 600,
      fontSize: '0.6875rem',
      letterSpacing: '0.03em',
      ...(live
        ? {
            backgroundColor: 'var(--ui-live-muted)',
            color: 'var(--ui-live)',
          }
        : {}),
      ...style,
    }}
  />
);

export function UiLiveBadge() {
  return (
    <UiBadge live size="sm">
      LIVE
    </UiBadge>
  );
}
