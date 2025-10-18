import React from 'react';

interface ModernTypographyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const ModernH1: React.FC<ModernTypographyProps> = ({ 
  children, 
  className = '', 
  style,
  as: Component = 'h1' 
}) => (
  <Component className={`modern-h1 ${className}`} style={style}>
    {children}
  </Component>
);

export const ModernH2: React.FC<ModernTypographyProps> = ({ 
  children, 
  className = '', 
  style,
  as: Component = 'h2' 
}) => (
  <Component className={`modern-h2 ${className}`} style={style}>
    {children}
  </Component>
);

export const ModernH3: React.FC<ModernTypographyProps> = ({ 
  children, 
  className = '', 
  style,
  as: Component = 'h3' 
}) => (
  <Component className={`modern-h3 ${className}`} style={style}>
    {children}
  </Component>
);

export const ModernBody: React.FC<ModernTypographyProps> = ({ 
  children, 
  className = '', 
  style,
  as: Component = 'p' 
}) => (
  <Component className={`modern-body ${className}`} style={style}>
    {children}
  </Component>
);

export const ModernCaption: React.FC<ModernTypographyProps> = ({ 
  children, 
  className = '', 
  style,
  as: Component = 'span' 
}) => (
  <Component className={`modern-caption ${className}`} style={style}>
    {children}
  </Component>
);
