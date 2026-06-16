import React from 'react';
import { AppShell, Avatar, Badge, Box, Burger, Container, Flex, Group, Menu } from '@mantine/core';
import { IoSettingsOutline, IoPersonOutline, IoCartOutline } from 'react-icons/io5';
import { NotificationBell } from './NotificationBell';
import { useLocation } from 'react-router-dom';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useHeaderNavbarStore } from '../../shared/stores/headerNavbar.store';
import { useCartStore } from '../../shared/stores/cart.store';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';
import { UiButton } from '../ui';
import { useTranslation } from '../../i18n';
import classes from './styles/header.module.css';

/** Navbar cart + Sign In / Join are redundant on public auth screens (already on login / register / recover). */
const AUTH_LANDING_SEGMENTS = new Set(['signin', 'join', 'forgot-password', 'welcome']);

function isAuthLandingPath(pathname: string): boolean {
    const normalized = pathname.toLowerCase().replace(/\/+$/, '');
    const last = normalized.split('/').filter(Boolean).pop() ?? '';
    return AUTH_LANDING_SEGMENTS.has(last);
}

function Logo({ onClick, className }: { onClick: () => void; className?: string }) {
    return (
        <span className={`${classes.logoText} ${className ?? ''}`} onClick={onClick} role="button" tabIndex={0}>
            I Watch <span className={classes.logoAccent}>Football</span>
        </span>
    );
}

function CartBadge({ count, onClick }: { count: number; onClick: () => void }) {
    return (
        <Box onClick={onClick} className={classes.cartIcon} style={{ position: 'relative' }}>
            <IoCartOutline size={22} />
            <Badge size="xs" circle variant="filled" className={classes.cartBadge}>
                {count}
            </Badge>
        </Box>
    );
}

interface HeaderProps {
    showHeader: boolean;
    isLoggedIn: boolean;
}

export function Header({ showHeader, isLoggedIn }: HeaderProps) {
    const location = useLocation();
    const hideCartAndNavbarAuth = isAuthLandingPath(location.pathname);
    const { navigateWithTransition } = usePageTransition();
    const { navbarOpen, toggleNavbar } = useHeaderNavbarStore();
    const { items } = useCartStore();
    const { marketplaceEnabled } = usePlatformFeaturesStore();
    const { t } = useTranslation();
    const hasCartItems = items.length > 0;
    const goHome = () => navigateWithTransition(isLoggedIn ? '/home' : '/');

    const pages = [
        { page: 'competitions', label: t('nav.competitions') },
        { page: 'matches', label: t('nav.matches') },
        ...(marketplaceEnabled ? [{ page: 'marketplace', label: t('nav.marketplace') }] : []),
        { page: 'logs', label: t('nav.logs') },
    ];

    return (
        <AppShell.Header className={classes.header}>
            <Container px="md" h="100%">
                <Flex justify="space-between" align="center" h="100%" className={classes.inner}>
                    <Group gap="xs" visibleFrom="md" className={classes.logoSection}>
                        <Logo onClick={goHome} />
                    </Group>

                    <Burger
                        opened={navbarOpen}
                        onClick={toggleNavbar}
                        hiddenFrom="md"
                        size="sm"
                        color="var(--ui-text-primary)"
                        className={classes.burgerMenu}
                    />

                    <Group gap="sm" hiddenFrom="md" className={classes.mobileRightSection}>
                        {isLoggedIn && <NotificationBell />}
                        {hasCartItems && !hideCartAndNavbarAuth && (
                            <CartBadge count={items.length} onClick={() => navigateWithTransition('/checkout')} />
                        )}
                        <Box>
                            {isLoggedIn ? (
                                <Avatar size="sm" radius="xl" onClick={() => navigateWithTransition('/settings')} className={classes.avatar}>
                                    <IoPersonOutline size={16} />
                                </Avatar>
                            ) : !hideCartAndNavbarAuth ? (
                                <Menu shadow="md" width={180} position="bottom-end">
                                    <Menu.Target>
                                        <Avatar size="sm" radius="xl" className={classes.avatar}>
                                            <IoPersonOutline size={16} />
                                        </Avatar>
                                    </Menu.Target>
                                    <Menu.Dropdown className={classes.menuDropdown}>
                                        <Menu.Item onClick={() => navigateWithTransition('/signIn')} className={classes.menuItem}>
                                            Sign In
                                        </Menu.Item>
                                        <Menu.Item onClick={() => navigateWithTransition('/welcome')} className={classes.menuItemLime}>
                                            Join
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            ) : null}
                        </Box>
                    </Group>

                    <Box hiddenFrom="md" className={classes.mobileTitle}>
                        <Logo onClick={goHome} className={classes.mobileTitleText} />
                    </Box>

                    {showHeader && (
                        <Group gap="xs" visibleFrom="md">
                            {pages.map(({ page, label }) => (
                                <UiButton
                                    key={label}
                                    variant="subtle"
                                    size="sm"
                                    onClick={() => navigateWithTransition(`/${page}`)}
                                    className={classes.navButton}
                                >
                                    {label}
                                </UiButton>
                            ))}
                        </Group>
                    )}

                    <Group gap="sm">
                        {showHeader && (
                            <>
                                {isLoggedIn && <NotificationBell />}
                                {hasCartItems && !hideCartAndNavbarAuth && (
                                    <Box visibleFrom="md">
                                        <CartBadge count={items.length} onClick={() => navigateWithTransition('/checkout')} />
                                    </Box>
                                )}
                                <IoSettingsOutline size={20} onClick={() => navigateWithTransition('/settings')} className={classes.settingsIcon} />
                                {!isLoggedIn && !hideCartAndNavbarAuth && (
                                    <>
                                        <UiButton variant="outline" size="sm" onClick={() => navigateWithTransition('/signIn')}>
                                            {t('nav.signIn')}
                                        </UiButton>
                                        <UiButton variant="primary" size="sm" onClick={() => navigateWithTransition('/welcome')}>
                                            {t('nav.join')}
                                        </UiButton>
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
