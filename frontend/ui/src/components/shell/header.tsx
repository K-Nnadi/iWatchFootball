import React from 'react';
import { AppShell, Box, Burger, Button, Container, Divider, Flex, Group, Text, Title } from '@mantine/core';
import { IoSettingsOutline } from 'react-icons/io5';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useHeaderNavbarStore } from '../../shared/stores/headerNavbar.store';

interface HeaderProps {
    showHeader: boolean;
    isLoggedIn: boolean; // Add this prop to control login state
}

export function Header({ showHeader, isLoggedIn }: HeaderProps) {
    const { navigateWithTransition } = usePageTransition();
    const { navbarOpen, toggleNavbar } = useHeaderNavbarStore();

    const pages = [
        { page: 'competitions', label: 'Competitions' },
        { page: 'matches', label: 'Matches' },
        { page: 'logs', label: 'Logs' }
    ];

    return (
        <AppShell.Header
            style={{
                backgroundColor: 'var(--modern-header-bg)',
                boxShadow: '0 1px 3px var(--modern-shadow-color)',
                borderBottom: '1px solid var(--modern-border-color)',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}
        >
            <Container px="md" h={'100%'}>
                <Flex justify={'space-between'} align="center" h="100%" style={{ position: 'relative' }}>
                    {/* Logo Section - Desktop: Left, Mobile: Hidden (title is centered) */}
                    <Group gap="xs" visibleFrom="md">
                        <Title 
                            order={2} 
                            size={{ base: '1.5rem', sm: '1.75rem', md: '2rem' }}
                            fw={700} 
                            c="var(--modern-text-primary)" 
                            onClick={() => navigateWithTransition('/')}
                            style={{ cursor: 'pointer' }}
                        >
                            I Watch Football
                        </Title>
                    </Group>

                    {/* Burger Menu - Mobile only */}
                    <Burger 
                        opened={navbarOpen} 
                        onClick={toggleNavbar} 
                        hiddenFrom="md" 
                        size="md" 
                        color="var(--modern-text-primary)"
                        style={{ position: 'absolute', left: 0, zIndex: 1 }}
                    />

                    {/* Title - Mobile: Centered */}
                    <Box
                        hiddenFrom="md"
                        style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            textAlign: 'center',
                            zIndex: 0
                        }}
                    >
                        <Title 
                            order={2} 
                            size={{ base: '1.5rem', sm: '1.75rem' }}
                            fw={700} 
                            c="var(--modern-text-primary)" 
                            onClick={() => navigateWithTransition('/')}
                            style={{ cursor: 'pointer' }}
                        >
                            I Watch Football
                        </Title>
                    </Box>

                    {/* Navigation Links */}
                    {showHeader && (
                        <Group gap="xl" visibleFrom="md">
                            {pages.map(({ page, label }) => (
                                <Button
                                    key={label}
                                    variant="subtle"
                                    onClick={() => navigateWithTransition(`/${page}`)}
                                    style={{
                                        color: 'var(--modern-text-primary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        fontWeight: 600,
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0',
                                        border: '2px solid transparent',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--modern-lime)';
                                        e.currentTarget.style.borderColor = 'var(--modern-lime)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--modern-text-primary)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}
                        </Group>
                    )}

                    {/* Right Section */}
                    <Group gap="lg">
                        {showHeader && (
                            <>
                                <IoSettingsOutline
                                    size={24}
                                    onClick={() => navigateWithTransition('/settings')}
                                    style={{ 
                                        cursor: 'pointer', 
                                        color: 'var(--modern-text-primary)',
                                        transition: 'color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--modern-lime)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--modern-text-primary)';
                                    }}
                                />
                                {!isLoggedIn && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigateWithTransition('/signIn')}
                                            style={{
                                                borderColor: 'var(--modern-lime)',
                                                color: 'var(--modern-lime)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                fontWeight: 600,
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                backgroundColor: 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--modern-lime)';
                                                e.currentTarget.style.color = 'var(--modern-bg-primary)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--modern-lime)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            Sign In
                                        </Button>
                                        <Button
                                            variant="filled"
                                            onClick={() => navigateWithTransition('/join')}
                                            style={{
                                                backgroundColor: 'var(--modern-lime)',
                                                color: 'var(--modern-bg-primary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                fontWeight: 600,
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0',
                                                border: '2px solid var(--modern-lime)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--modern-lime)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--modern-lime)';
                                                e.currentTarget.style.color = 'var(--modern-bg-primary)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            Join
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </Group>
                </Flex>
            </Container>
        </AppShell.Header>
    );
}
