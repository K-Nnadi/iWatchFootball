import React from 'react';
import { AppShell, Box, Burger, Button, Container, Divider, Flex, Group, Text } from '@mantine/core';
import { DarkModeButton } from '../buttons/darkMode.button';
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
        { page: 'home', label: 'Home' },
        { page: 'competitions', label: 'Competitions' },
        { page: 'matches', label: 'Matches' },
        { page: 'logs', label: 'Logs' }
    ];

    return (
        <AppShell.Header>
            <Container px="md" h={'100%'}>
                <Flex justify={'space-between'} align="center" h="100%">
                    <Burger opened={navbarOpen} onClick={toggleNavbar} hiddenFrom="sm" size="md" />
                    {
                        showHeader && (
                            <Flex justify="center" align="center" style={{ flexGrow: 1 }}>
                                <Group gap="xl">
                                    {pages.map(({ page, label }) => (
                                        <Button key={page} variant="subtle" onClick={() => navigate(`/${page}`)}>
                                            <Text>{label}</Text>
                                        </Button>
                                    ))}
                                </Group>
                            </Flex>
                        )
                    }
                    {
                        showHeader && (
                            <Group visibleFrom="sm" gap='lg'>
                                <Divider orientation={'vertical'} />
                                <IoSettingsOutline size={28} onClick={() => navigate('/settings')} />
                                {/*<DarkModeButton />*/}
                                {!isLoggedIn && (
                                    <>
                                        <Button variant="outline" onClick={() => navigate('/signIn')}>Sign In</Button>
                                        <Button variant="light" onClick={() => navigate('/join')}>Join</Button>
                                    </>
                                )}
                            </Group>
                        )
                    }
                </Flex>
            </Container>
        </AppShell.Header>
    );
}
