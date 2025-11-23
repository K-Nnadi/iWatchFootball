import {AppShell, Box} from "@mantine/core";
import {Outlet} from "react-router-dom";
import React from "react";
import { Footer } from "./footer";
import { AdBanner } from "./adBanner";

export function Main(){
    return(
        <AppShell.Main>
            <AdBanner height={{ base: 90, md: 100 }} />
            <Box className="main-content-wrapper" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 'calc(100vh - 70px - 90px)' // Account for header (70px) + ad banner (90px) on mobile
            }}>
                <Box style={{ flex: 1 }}>
                    <Outlet/>
                </Box>
                <Footer />
            </Box>
        </AppShell.Main>
    )
}