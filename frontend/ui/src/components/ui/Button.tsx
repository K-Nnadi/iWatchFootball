import React from 'react';
import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import classes from './Button.module.css';

export type UiButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'subtle' | 'danger';

export interface UiButtonProps extends Omit<MantineButtonProps, 'variant'> {
  variant?: UiButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const variantClass: Record<UiButtonVariant, string> = {
  primary: classes.primary,
  secondary: classes.secondary,
  outline: classes.outline,
  ghost: classes.ghost,
  subtle: classes.subtle,
  danger: classes.danger,
};

export function UiButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: UiButtonProps) {
  return (
    <MantineButton
      {...props}
      variant="default"
      className={`${classes.uiButton} ${variantClass[variant]} ${className}`}
    >
      {children}
    </MantineButton>
  );
}
