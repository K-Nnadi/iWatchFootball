import {AppShell, NavLink} from "@mantine/core";
import {useNavigate} from "react-router-dom";

export function Navbar() {
    const navigate = useNavigate()
    return (
        <AppShell.Navbar p="md" style={{gap: '1px'}}>
            <NavLink
                label={"Home"}
                onClick={() => navigate('/')}
                style={{margin: "5px"}}
            />

            <NavLink
                label={"Logs"}
                onClick={() => navigate('/logs')}
                style={{margin: "5px"}}
            />

            <NavLink
                label={"Matches"}
                onClick={() => navigate('/matches')}
                style={{margin: "5px"}}
            />

            <NavLink
                label={"Competitions"}
                onClick={() => navigate('/competitions')}
                style={{margin: "5px"}}
            />

            <NavLink
                label={"Settings"}
                onClick={() => navigate('/settings')}
                style={{margin: "5px"}}
            />

        </AppShell.Navbar>

    )
}

