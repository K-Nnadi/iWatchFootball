import React from 'react';
import { Card as MantineCard, CardProps as MantineCardProps } from '@mantine/core';

interface ModernCardProps extends MantineCardProps {
  hover?: boolean;
  accent?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  hover = true,
  accent = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <MantineCard
      {...props}
      className={`modern-card ${accent ? 'modern-card-accent' : ''} ${className}`}
      styles={{
        root: {
          backgroundColor: 'var(--modern-dark-gray)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 0,
          padding: '2rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': hover ? {
            transform: 'translateY(-8px)',
            borderColor: 'var(--modern-lime)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          } : {}
        }
      }}
    >
      {accent && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--modern-lime)',
            transform: 'scaleX(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="hover:scale-x-100"
        />
      )}
      {children}
    </MantineCard>
  );
};
