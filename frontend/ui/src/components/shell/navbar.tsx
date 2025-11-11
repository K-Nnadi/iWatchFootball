import {AppShell, NavLink, Stack} from "@mantine/core";
import {usePageTransition} from "../../hooks/usePageTransition";
import {useLocation} from "react-router-dom";
import {useHeaderNavbarStore} from "../../shared/stores/headerNavbar.store";
import {useEffect, useState} from "react";

export function Navbar() {
    const { navigateWithTransition } = usePageTransition();
    const location = useLocation();
    const { toggleNavbar, navbarOpen } = useHeaderNavbarStore();
    const [isClosing, setIsClosing] = useState(false);
    const [prevNavbarOpen, setPrevNavbarOpen] = useState(navbarOpen);
    
    useEffect(() => {
        if (prevNavbarOpen && !navbarOpen) {
            // Navbar is closing
            setIsClosing(true);
            // Reset closing state after animation completes
            setTimeout(() => setIsClosing(false), 600);
        } else if (!prevNavbarOpen && navbarOpen) {
            // Navbar is opening
            setIsClosing(false);
        }
        setPrevNavbarOpen(navbarOpen);
    }, [navbarOpen, prevNavbarOpen]);
    
    const navItems = [
        { label: "Home", path: "/" },
        { label: "Logs", path: "/logs" },
        { label: "Matches", path: "/matches" },
        { label: "Competitions", path: "/competitions" },
        { label: "Settings", path: "/settings" }
    ];
    
    const isCurrentPage = (path: string) => {
        if (path === "/") {
            return location.pathname === "/";
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
        <AppShell.Navbar p="md" className={navbarClass}>
            <Stack gap="lg" style={{ 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                padding: '3rem 1.5rem'
            }}>
                {navItems.map(({ label, path }, index) => {
                    const isActive = isCurrentPage(path);
                    return (
                        <NavLink
                            key={path}
                            label={label}
                            onClick={() => handleNavClick(path)}
                            disabled={isActive}
                            className={`nav-link-item nav-link-item-${index}`}
                            style={{
                                width: '100%',
                                cursor: isActive ? 'default' : 'pointer',
                                opacity: isActive ? 0.6 : 1,
                                pointerEvents: isActive ? 'none' : 'auto',
                                fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                                fontWeight: 700,
                                padding: '1.5rem 2rem',
                                minHeight: 'auto'
                            }}
                        />
                    );
                })}
            </Stack>
        </AppShell.Navbar>
    )
}

