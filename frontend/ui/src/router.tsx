import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {NotFound} from "./pages/notFound.page";
import {LogsPage} from "./pages/logs.page";
import {HomePage} from "./pages/home.page";
import {MatchesPage} from "./pages/matches.page";
import {SettingsPage} from "./pages/settings.page";
import {SignUpPage} from "./pages/signUp.page";
import {LoginPage} from "./pages/login.page";
import {CompetitionsPage} from "./pages/competitions.page";
// import {TransitionDemoPage} from "./pages/transition-demo.page"; // File not found
import {AppWrapper} from "./components/shell/appWrapper";
import React from "react";
import {CompetitionPage} from "./pages/competition.page";
import {CheckoutPage} from "./pages/checkout.page";
import {ThankYouPage} from "./pages/thankYou.page";
import {SeatSelectionPage} from "./pages/seatSelection.page";
import {MatchPage} from "./pages/match/match.page";
import {TeamPage} from "./pages/team/team.page";
import {PlayerPage} from "./pages/player/player.page";
import {NewsPage} from "./pages/news.page";
import {NewsDetailPage} from "./pages/news/newsDetail.page";
import {LicensesPage} from "./pages/licenses.page";
import {ContactPage} from "./pages/contact.page";
import {HelpPage} from "./pages/help.page";

export type ElementMap = {
    [x: string]: React.ReactElement;
}

const IWatchFootballElements: ElementMap = {
    logs: <LogsPage/>,
    matches: <MatchesPage/>,
    settings: <SettingsPage/>,
    join: <SignUpPage />,
    signIn: <LoginPage />,
    competitions: <CompetitionsPage />,
    checkout: <CheckoutPage/>,
    thankYou: <ThankYouPage/>,
    news: <NewsPage/>
}

const childrenRoutes = Object.entries(IWatchFootballElements).map(([path, element]) => ({
    path: `/${path}`,
    element: element
}));

const additionalRoutes = [
    {
        path: '/',
        element: <HomePage />
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
        path: '/team/:id',
        element: <TeamPage />
    },
    {
        path: '/player/:id',
        element: <PlayerPage />
    },
    {
        path: '/news/:id',
        element: <NewsDetailPage />
    },
    {
        path: '/seat-selection/:id',
        element: <SeatSelectionPage />
    },
    {
        path: '/licenses',
        element: <LicensesPage />
    },
    {
        path: '/contact',
        element: <ContactPage />
    },
    {
        path: '/help',
        element: <HelpPage />
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