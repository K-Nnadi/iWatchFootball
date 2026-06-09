import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {NotFound} from "./pages/notFound.page";
import {LogsPage} from "./pages/logs.page";
import {HomePage} from "./pages/home.page";
import {MatchesPage} from "./pages/matches.page";
import {SettingsPage} from "./pages/settings.page";
import {SignUpPage} from "./pages/signUp.page";
import {LoginPage} from "./pages/login.page";
import {ForgotPasswordPage} from "./pages/forgotPassword.page";
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
import {TicketsPage} from "./pages/tickets.page";
import { MarketplacePage } from "./pages/marketplace/marketplace.page";
import { CreateListingPage } from "./pages/marketplace/createListing.page";
import { MarketplaceCheckoutPage } from "./pages/marketplace/marketplaceCheckout.page";
import { MyListingsPage } from "./pages/marketplace/myListings.page";
import { WalletPage } from "./pages/wallet.page";
import { DiscountCodesAdminPage } from "./pages/admin/discountCodes.page";
import { RequireAuth } from "./components/auth/RequireAuth";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { RootEntry } from "./components/auth/RootEntry";
import { MarketplaceFeatureRoute } from "./components/auth/MarketplaceFeatureRoute";
import { FriendsPage } from "./pages/friends.page";
import { CompareFriendPage } from "./pages/friendsCompare.page";

export type ElementMap = {
    [x: string]: React.ReactElement;
}

const IWatchFootballElements: ElementMap = {
    logs: <LogsPage/>,
    friends: <FriendsPage/>,
    matches: <MatchesPage/>,
    settings: <SettingsPage/>,
    competitions: <CompetitionsPage />,
    checkout: <CheckoutPage/>,
    thankYou: <ThankYouPage/>,
    news: <NewsPage/>,
    tickets: <TicketsPage/>,
    marketplace: (
        <MarketplaceFeatureRoute>
            <MarketplacePage/>
        </MarketplaceFeatureRoute>
    ),
    'marketplace/my-listings': (
        <MarketplaceFeatureRoute>
            <MyListingsPage/>
        </MarketplaceFeatureRoute>
    ),
    'marketplace/sell': (
        <MarketplaceFeatureRoute>
            <CreateListingPage/>
        </MarketplaceFeatureRoute>
    ),
    'admin/discount-codes': <DiscountCodesAdminPage/>,
}

/** Relative `wallet` under `/` reliably matches `/wallet` for auth layout children. */
const childrenRoutes = [
    { path: 'wallet', element: <WalletPage /> },
    ...Object.entries(IWatchFootballElements).map(([path, element]) => ({
        path: `/${path}`,
        element: element,
    })),
];

const additionalRoutes = [
    {
        path: '/friends/compare/:userId',
        element: <CompareFriendPage />
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
        path: '/marketplace/buy/:id',
        element: (
            <MarketplaceFeatureRoute>
                <MarketplaceCheckoutPage />
            </MarketplaceFeatureRoute>
        ),
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
        children: [
            {
                path: 'signIn',
                element: (
                    <PublicOnlyRoute>
                        <LoginPage />
                    </PublicOnlyRoute>
                ),
            },
            {
                path: 'join',
                element: (
                    <PublicOnlyRoute>
                        <SignUpPage />
                    </PublicOnlyRoute>
                ),
            },
            {
                path: 'forgot-password',
                element: (
                    <PublicOnlyRoute>
                        <ForgotPasswordPage />
                    </PublicOnlyRoute>
                ),
            },
            {
                index: true,
                element: <RootEntry />,
            },
            {
                element: <RequireAuth />,
                children: [{ path: 'home', element: <HomePage /> }, ...childrenRoutes, ...additionalRoutes],
            },
        ],
    },
])

export function Router() {
    return (
        <RouterProvider router={router}/>
    )
}