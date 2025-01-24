import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {NotFound} from "./pages/notFound.page";
import {LogsPage} from "./pages/logs.page";
import {HomePage} from "./pages/home.page";
import {MatchesPage} from "./pages/matches.page";
import {SettingsPage} from "./pages/settings.page";
import {SignUpPage} from "./pages/signUp.page";
import {LoginPage} from "./pages/login.page";
import {CompetitionsPage} from "./pages/competitions.page";
import {AppWrapper} from "./components/shell/appWrapper";
import React from "react";
import {CompetitionPage} from "./pages/competition.page";
import {CheckoutPage} from "./pages/checkout.page";
import {ThankYouPage} from "./pages/thankYou.page";
import {SeatSelectionPage} from "./pages/seatSelection.page";
import {MatchPage} from "./pages/match/match.page";
import {LandingPage} from "./pages/landing.page";

export type ElementMap = {
    [x: any]: Element;
}

const IWatchFootballElements: ElementMap = {
    home: <HomePage/>,
    logs: <LogsPage/>,
    matches: <MatchesPage/>,
    settings: <SettingsPage/>,
    join: <SignUpPage />,
    signIn: <LoginPage />,
    competitions: <CompetitionsPage />,
    checkout: <CheckoutPage/>,
    thankYou: <ThankYouPage/>
}

const childrenRoutes = Object.entries(IWatchFootballElements).map(([path, element]) => ({
    path: `/${path}`,
    element: element as JSX.Element
}));

const additionalRoutes = [
    {
        path: '/',
        element: <LandingPage />
    },
    {
        path: '/competition/:id',
        element: <CompetitionPage />
    },
    {
        path: '/match/:id',
        element: <MatchPage />
    },
    {
        path: '/seat-selection/:id',
        element: <SeatSelectionPage />
    },
    {
        path: '/*',
        element: <NotFound />
    }
];



const router = createBrowserRouter([
    {
        path: '/',
        element: <AppWrapper />,
        children: [...childrenRoutes, ...additionalRoutes]
    }
])

export function Router() {
    return (
        <RouterProvider router={router}/>
    )
}