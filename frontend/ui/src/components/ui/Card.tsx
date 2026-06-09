import React from 'react';
import { Card as MantineCard, CardProps as MantineCardProps } from '@mantine/core';
import classes from './Card.module.css';

export type UiCardDensity = 'compact' | 'default' | 'spacious';

export interface UiCardProps extends MantineCardProps {
  hover?: boolean;
  accent?: boolean;
  /** Visual density — separate from Mantine's `padding` prop */
  density?: UiCardDensity;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const densityClass: Record<UiCardDensity, string> = {
  compact: classes.compact,
  default: classes.default,
  spacious: classes.spacious,
};

export function UiCard({
  hover = false,
  accent = false,
  density = 'default',
  className = '',
  onClick,
  children,
  ...props
}: UiCardProps) {
  return (
    <MantineCard
      {...props}
      onClick={onClick}
      className={[
        classes.uiCard,
        densityClass[density],
        hover ? classes.hoverable : '',
        onClick ? classes.clickable : '',
        accent ? classes.accentTop : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      styles={{ root: { position: 'relative', overflow: 'hidden' } }}
    >
      {children}
    </MantineCard>
  );
}
