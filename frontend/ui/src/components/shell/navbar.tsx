import {AppShell, NavLink, Stack} from "@mantine/core";
import {usePageTransition} from "../../hooks/usePageTransition";
import {useLocation} from "react-router-dom";
import {useHeaderNavbarStore} from "../../shared/stores/headerNavbar.store";
import {useAuthStore} from "../../shared/stores/auth.store";
import {usePlatformFeaturesStore} from "../../shared/stores/platformFeatures.store";
import {useTranslation} from "../../i18n";
import {useEffect, useState, useRef} from "react";

export function Navbar() {
    const { navigateWithTransition } = usePageTransition();
    const { isLoggedIn } = useAuthStore();
    const { marketplaceEnabled } = usePlatformFeaturesStore();
    const { t } = useTranslation();
    const location = useLocation();
    const homePath = isLoggedIn ? "/home" : "/";
    const { toggleNavbar, navbarOpen } = useHeaderNavbarStore();
    const [isClosing, setIsClosing] = useState(false);
    const prevNavbarOpenRef = useRef(navbarOpen);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    useEffect(() => {
        // Cleanup previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (prevNavbarOpenRef.current && !navbarOpen) {
            // Navbar is closing
            setIsClosing(true);
            // Reset closing state after animation completes
            timeoutRef.current = setTimeout(() => {
                setIsClosing(false);
            }, 600);
        } else if (!prevNavbarOpenRef.current && navbarOpen) {
            // Navbar is opening
            setIsClosing(false);
        }
        prevNavbarOpenRef.current = navbarOpen;

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [navbarOpen]);
    
    const navItems = [
        { label: t('nav.home'), path: homePath },
        { label: t('nav.logs'), path: "/logs" },
        { label: t('nav.friends'), path: "/friends" },
        { label: t('nav.matches'), path: "/matches" },
        { label: t('nav.competitions'), path: "/competitions" },
        ...(marketplaceEnabled ? [{ label: t('nav.marketplace'), path: "/marketplace" }] : []),
        { label: t('nav.settings'), path: "/settings" }
    ];
    
    const isCurrentPage = (path: string) => {
        if (path === homePath) {
            return location.pathname === "/" || location.pathname === "/home";
        }
        return location.pathname.startsWith(path);
    };
    
    const handleNavClick = (path: string) => {
        if (!isCurrentPage(path)) {
            navigateWithTransition(path);
            // Close navbar after navigation on mobile
            if (navbarOpen) {
                setTimeout(() => toggleNavbar(), 300);
            }
        }
    };
    
    // Apply closing animation if closing, otherwise opening animation if open
    const navbarClass = isClosing 
        ? "navbar-slide-up" 
        : (navbarOpen ? "navbar-slide-down" : "");
    
    return (
        <>
            {/* Backdrop overlay for mobile */}
            {navbarOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 199,
                        opacity: navbarOpen ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: navbarOpen ? 'auto' : 'none',
                    }}
                    onClick={() => toggleNavbar()}
                    className="navbar-backdrop"
                />
            )}
            <AppShell.Navbar 
                p="md" 
                className={navbarClass}
                style={{
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 'auto',
                    zIndex: 200,
                    pointerEvents: 'auto',
                }}
            >
            <Stack gap="lg" style={{ 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                minHeight: '100%',
                padding: '3rem 1.5rem'
            }}>
                {navItems.map(({ label, path }, index) => {
                    const isActive = isCurrentPage(path);
                    return (
                        <NavLink
                            key={path}
                            label={label}
                            active={isActive}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleNavClick(path);
                            }}
                            className={`nav-link-item nav-link-item-${index} ${isActive ? 'nav-link-active' : ''}`}
                            style={{
                                width: '100%',
                                cursor: isActive ? 'default' : 'pointer',
                                opacity: isActive ? 0.4 : 1,
                                pointerEvents: 'auto',
                                fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                                fontWeight: 700,
                                padding: '1.5rem 2rem',
                                minHeight: 'auto',
                                position: 'relative',
                                zIndex: 201,
                                color: isActive ? 'rgba(255, 255, 255, 0.4)' : 'var(--modern-white)',
                            }}
                        />
                    );
                })}
            </Stack>
        </AppShell.Navbar>
        </>
    )
}

