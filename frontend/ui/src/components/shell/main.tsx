import {AppShell, Box} from "@mantine/core";
import {Outlet} from "react-router-dom";
import React from "react";
import { Footer } from "./footer";

export function Main(){
    return(
        <AppShell.Main>
            <Box className="main-content-wrapper" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 'calc(100vh - 70px)'
            }}>
                <Box style={{ flex: 1 }}>
                    <Outlet/>
                </Box>
                <Footer />
            </Box>
        </AppShell.Main>
    )
}