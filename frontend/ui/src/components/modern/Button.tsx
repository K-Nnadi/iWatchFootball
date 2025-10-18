import React from 'react';
import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';

interface ModernButtonProps extends Omit<MantineButtonProps, 'variant' | 'color'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'modern-btn modern-btn-primary';
      case 'secondary':
        return 'modern-btn';
      case 'outline':
        return 'modern-btn';
      case 'ghost':
        return 'modern-btn modern-btn-ghost';
      default:
        return 'modern-btn modern-btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'modern-btn-sm';
      case 'md':
        return 'modern-btn-md';
      case 'lg':
        return 'modern-btn-lg';
      default:
        return 'modern-btn-md';
    }
  };

  return (
    <MantineButton
      {...props}
      className={`${getVariantClass()} ${getSizeClass()} ${className}`}
      styles={{
        root: {
          backgroundColor: 'transparent',
          border: '2px solid var(--modern-lime)',
          color: 'var(--modern-lime)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'var(--modern-lime)',
            color: 'var(--modern-black)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 255, 136, 0.3)',
          }
        }
      }}
    >
      {children}
    </MantineButton>
  );
};
