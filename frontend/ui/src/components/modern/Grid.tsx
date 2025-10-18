import React from 'react';
import { Grid as MantineGrid, GridProps as MantineGridProps } from '@mantine/core';

interface ModernGridProps extends Omit<MantineGridProps, 'gutter'> {
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ModernGrid: React.FC<ModernGridProps> = ({
  columns = 3,
  gap = 'md',
  className = '',
  children,
  ...props
}) => {
  const getGapClass = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4';
      case 'md':
        return 'gap-8';
      case 'lg':
        return 'gap-12';
      case 'xl':
        return 'gap-16';
      default:
        return 'gap-8';
    }
  };

  const getColumnsClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case 6:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getColumnsClass()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
};
