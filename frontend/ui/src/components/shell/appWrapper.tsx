import { AppShell } from '@mantine/core';
import { Header } from './header';
import { Navbar } from './navbar';
import { Main } from "./main";
import { PageTransition } from '../transitions/PageTransition';
import React, { useEffect, useState } from "react";
import { useHeaderNavbarStore } from "../../shared/stores/headerNavbar.store";
// Assume we have an auth store or context that provides isLoggedIn
import { useAuthStore } from '../../shared/stores/auth.store'; // Example import
import { useCartStore } from '../../shared/stores/cart.store';
import { usePlatformFeaturesStore } from '../../shared/stores/platformFeatures.store';

export function AppWrapper() {
    const { navbarOpen } = useHeaderNavbarStore();
    const [showHeader, setShowHeader] = useState(false);

    const width = 768;

    // Retrieve login state from a store or context
    const { isLoggedIn, initializeAuth } = useAuthStore();
    const { initializeCart } = useCartStore();
    const { initializeFeatures } = usePlatformFeaturesStore();

    // Initialize auth, cart, and platform features on mount
    useEffect(() => {
        initializeAuth();
        initializeCart();
        void initializeFeatures();
    }, [initializeAuth, initializeCart, initializeFeatures]);

    const collapsed = {
        desktop: true,
        mobile: !navbarOpen
    };

    useEffect(() => {
        console.log("Navbar", navbarOpen)
    }, [navbarOpen]);

    useEffect(() => {
        const handleResize = () => {
            setShowHeader(window.innerWidth > width);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <AppShell
            navbar={{ 
                width: { base: 300, sm: 350, md: 400, lg: 450, xl: 500 }, 
                breakpoint: 'sm', 
                collapsed 
            }}
            padding={0}
        >
            {/* Pass isLoggedIn to Header */}
            <Header showHeader={showHeader} isLoggedIn={isLoggedIn} />
            <Navbar />
            <PageTransition>
                <Main />
            </PageTransition>
        </AppShell>
    );
}
