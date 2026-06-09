import React from 'react';
import { Container, ContainerProps } from '@mantine/core';

export function UiPageContainer({ children, ...props }: ContainerProps) {
  return (
    <Container size="xl" py="lg" px={{ base: 'md', md: 'xl' }} {...props}>
      {children}
    </Container>
  );
}
