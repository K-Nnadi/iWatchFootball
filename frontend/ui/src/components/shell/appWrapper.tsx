import { AppShell } from '@mantine/core';
import { Header } from './header';
import { Footer } from './footer';
import { Navbar } from './navbar';
import { Main } from "./main";
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
                    base: 60,
                    md: 70
                }
            }}
            navbar={{ 
                width: { base: 300, sm: 350, md: 400, lg: 450, xl: 500 }, 
                breakpoint: 'sm', 
                collapsed 
            }}
            footer={{
                height: { base: 60, md: 80 }
            }}
            padding="md"
            // styles={(theme) => ({
            //     main: {
            //         backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
            //     },
            //     root: {
            //         minHeight: '100vh'
            //     }
            // })}
        >
            {/* Pass isLoggedIn to Header */}
            <Header showHeader={showHeader} isLoggedIn={isLoggedIn} />
            <Navbar />
            <Main />
        </AppShell>
    );
}
