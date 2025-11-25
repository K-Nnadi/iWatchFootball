import {AppShell, Box} from "@mantine/core";
import {Outlet} from "react-router-dom";
import React from "react";
import { Footer } from "./footer";
import { AdBanner } from "./adBanner";
import classes from './styles/main.module.css';

export function Main(){
    return(
        <AppShell.Main>
            {/*<AdBanner height={{ base: 90, md: 100 }} />*/}
            <Box className={`main-content-wrapper ${classes.contentWrapper}`}>
                <Box className={classes.content}>
                    <Outlet/>
                </Box>
                <Footer />
            </Box>
        </AppShell.Main>
    )
}