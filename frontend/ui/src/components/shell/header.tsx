import React from 'react';
import { AppShell, Box, Burger, Button, Container, Divider, Flex, Group, Text, Title } from '@mantine/core';
import { IoSettingsOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useHeaderNavbarStore } from '../../shared/stores/headerNavbar.store';

interface HeaderProps {
    showHeader: boolean;
    isLoggedIn: boolean; // Add this prop to control login state
}

export function Header({ showHeader, isLoggedIn }: HeaderProps) {
    const navigate = useNavigate();
    const { navbarOpen, toggleNavbar } = useHeaderNavbarStore();

    const pages = [
        { page: 'competitions', label: 'Competitions' },
        { page: 'matches', label: 'Matches' },
        { page: 'logs', label: 'Logs' }
    ];

    return (
        <AppShell.Header
            sx={(theme) => ({
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderBottom: 'none',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            })}
        >
            <Container px="md" h={'100%'}>
                <Flex justify={'space-between'} align="center" h="100%">
                    {/* Logo Section */}
                    <Group spacing="xs">
                        <Burger opened={navbarOpen} onClick={toggleNavbar} hiddenFrom="sm" size="md" />
                        <Group spacing="xs" visibleFrom="sm">
                            <Title order={3} size="xl" weight={700} color="blue" onClick={() => navigate('/')}>
                                I Watch Football
                            </Title>
                        </Group>
                    </Group>

                    {/* Navigation Links */}
                    {showHeader && (
                        <Group gap="xl" visibleFrom="md">
                            {pages.map(({ page, label }) => (
                                <Button
                                    key={label}
                                    variant="subtle"
                                    onClick={() => navigate(`/${page}`)}
                                    sx={{
                                        color: label === 'Home' ? '#1e40af' : '#6b7280',
                                        fontWeight: label === 'Home' ? 500 : 400,
                                        '&:hover': {
                                            color: '#1e40af',
                                            backgroundColor: 'transparent'
                                        }
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
                                    onClick={() => navigate('/settings')}
                                    style={{ cursor: 'pointer', color: '#6b7280' }}
                                />
                                {!isLoggedIn && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate('/signIn')}
                                            sx={{
                                                borderColor: '#d1d5db',
                                                color: '#6b7280',
                                                '&:hover': {
                                                    borderColor: '#1e40af',
                                                    color: '#1e40af'
                                                }
                                            }}
                                        >
                                            Sign In
                                        </Button>
                                        <Button
                                            variant="filled"
                                            color="blue"
                                            onClick={() => navigate('/join')}
                                            sx={{
                                                backgroundColor: '#1e40af',
                                                '&:hover': {
                                                    backgroundColor: '#1e3a8a'
                                                }
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
