import React from 'react';
import { AppShell, Avatar, Box, Burger, Button, Container, Flex, Group, Menu, Title } from '@mantine/core';
import { IoSettingsOutline, IoPersonOutline } from 'react-icons/io5';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useHeaderNavbarStore } from '../../shared/stores/headerNavbar.store';
import classes from './styles/header.module.css';

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
        <AppShell.Header className={classes.header}>
            <Container px="md" h={'100%'}>
                <Flex justify={'space-between'} align="center" h="100%" className={classes.inner}>
                    {/* Logo Section - Desktop: Left, Mobile: Hidden (title is centered) */}
                    <Group gap="xs" visibleFrom="md" className={classes.logoSection}>
                        <Title 
                            order={2} 
                            size="2rem"
                            fw={700} 
                            c="var(--modern-text-primary)" 
                            onClick={() => navigateWithTransition('/')}
                            style={{ cursor: 'pointer', fontSize: 'clamp(1.5rem, 2vw, 2rem)' }}
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
                        className={classes.burgerMenu}
                    />

                    {/* Mobile Avatar - Right side */}
                    <Box hiddenFrom="md" className={classes.mobileAvatar}>
                        {isLoggedIn ? (
                            // Logged in: Click to go to settings
                            <Avatar
                                size="md"
                                radius="xl"
                                onClick={() => navigateWithTransition('/settings')}
                                className={classes.avatar}
                            >
                                <IoPersonOutline size={20} />
                            </Avatar>
                        ) : (
                            // Not logged in: Menu with Sign In/Sign Up
                            <Menu
                                shadow="md"
                                width={200}
                                position="bottom-end"
                                withArrow
                            >
                                <Menu.Target>
                                    <Avatar
                                        size="md"
                                        radius="xl"
                                        className={classes.avatar}
                                    >
                                        <IoPersonOutline size={20} />
                                    </Avatar>
                                </Menu.Target>
                                <Menu.Dropdown className={classes.menuDropdown}>
                                    <Menu.Item
                                        onClick={() => navigateWithTransition('/signIn')}
                                        className={classes.menuItem}
                                    >
                                        Sign In
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={() => navigateWithTransition('/join')}
                                        className={classes.menuItemLime}
                                    >
                                        Join
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    </Box>

                    {/* Title - Mobile: Centered */}
                    <Box hiddenFrom="md" className={classes.mobileTitle}>
                        <Title 
                            order={2} 
                            size="1.75rem"
                            fw={700} 
                            c="var(--modern-text-primary)" 
                            onClick={() => navigateWithTransition('/')}
                            className={classes.mobileTitleText}
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
                                    className={classes.navButton}
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
                                    className={classes.settingsIcon}
                                />
                                {!isLoggedIn && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigateWithTransition('/signIn')}
                                            className={classes.signInButton}
                                        >
                                            Sign In
                                        </Button>
                                        <Button
                                            variant="filled"
                                            onClick={() => navigateWithTransition('/join')}
                                            className={classes.joinButton}
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
