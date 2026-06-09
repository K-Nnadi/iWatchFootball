import {AppShell, Box} from "@mantine/core";
import {Outlet} from "react-router-dom";
import { Footer } from "./footer";
import { AdLayout } from "../ads";
import classes from './styles/main.module.css';

export function Main(){
    return(
        <AppShell.Main>
            <AdLayout>
                <Box className={`main-content-wrapper ${classes.contentWrapper}`}>
                    <Box className={classes.content}>
                        <Outlet/>
                    </Box>
                    <Footer />
                </Box>
            </AdLayout>
        </AppShell.Main>
    )
}
