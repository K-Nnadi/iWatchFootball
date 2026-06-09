import React from 'react';
import { Group } from '@mantine/core';
import { UiH2 } from './Typography';
import { UiButton } from './Button';

interface SectionHeaderProps {
  title: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function UiSectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <Group justify="space-between" mb="lg" wrap="wrap" gap="md" className={className}>
      <UiH2>{title}</UiH2>
      {action && (
        <UiButton variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </UiButton>
      )}
    </Group>
  );
}
