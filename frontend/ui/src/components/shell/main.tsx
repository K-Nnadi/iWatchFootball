import {AppShell} from "@mantine/core";
import {Outlet} from "react-router-dom";
import React from "react";

export function Main(){
    return(
        <AppShell.Main>
            <div>
                <Outlet/>
            </div>
        </AppShell.Main>
    )
}