import { AppShell } from '@mantine/core';
import { Header } from './header';
import { Navbar } from './navbar';
import { Main } from "./main";
import { PageTransition } from '../transitions/PageTransition';
import React, { useEffect, useState } from "react";
import { useHeaderNavbarStore } from "../../shared/stores/headerNavbar.store";
// Assume we have an auth store or context that provides isLoggedIn
import { useAuthStore } from '../../shared/stores/auth.store'; // Example import

export function AppWrapper() {
    const { navbarOpen } = useHeaderNavbarStore();
    const [showHeader, setShowHeader] = useState(false);

    const width = 768;

    // Retrieve login state from a store or context
    const { isLoggedIn } = useAuthStore(); // Adjust this based on your actual auth store logic

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
            header={{
                height: {
                    base: 70,
                    md: 80
                }
            }}
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
