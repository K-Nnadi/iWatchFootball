import React from 'react';
import classes from './Typography.module.css';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

function makeTypography(defaultTag: keyof JSX.IntrinsicElements, styleClass: string) {
  return function Typography({
    children,
    className = '',
    style,
    as,
  }: TypographyProps) {
    const Tag = as ?? defaultTag;
    return (
      <Tag className={`${styleClass} ${className}`} style={style}>
        {children}
      </Tag>
    );
  };
}

export const UiH1 = makeTypography('h1', classes.h1);
export const UiH2 = makeTypography('h2', classes.h2);
export const UiH3 = makeTypography('h3', classes.h3);
export const UiBody = makeTypography('p', classes.body);
export const UiCaption = makeTypography('span', classes.caption);

export function UiAccent({ children }: { children: React.ReactNode }) {
  return <span className={classes.accent}>{children}</span>;
}
