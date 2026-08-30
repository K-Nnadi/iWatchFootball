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
import {ManagerPage} from "./pages/manager/manager.page";
import {StadiumPage} from "./pages/stadium/stadium.page";
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
import { TicketLinksAdminPage } from "./pages/admin/ticketLinks.page";
import { AffiliatePartnersAdminPage } from "./pages/admin/affiliatePartners.page";
import { TicketLinkAnalyticsPage } from "./pages/admin/ticketLinkAnalytics.page";
import { AdminDashboardPage } from "./pages/admin/dashboard.page";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireAdmin } from "./components/auth/RequireAdmin";
import { OnboardingGate } from "./components/auth/OnboardingGate";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { RootEntry } from "./components/auth/RootEntry";
import { MarketplaceFeatureRoute } from "./components/auth/MarketplaceFeatureRoute";
import { AttendanceAdvancedStatsRoute } from "./components/auth/AttendanceAdvancedStatsRoute";
import { AttendanceTrackingFeatureRoute } from "./components/auth/AttendanceTrackingFeatureRoute";
import { TicketDemandFeatureRoute } from "./components/auth/TicketDemandFeatureRoute";
import { AttendanceHistoryPage } from "./pages/attendance/attendance.page";
import { MyInterestsPage } from "./pages/ticketInterests/myInterests.page";
import { MyPurchasesPage } from "./pages/marketplace/myPurchases.page";
import { FriendsPage } from "./pages/friends.page";
import { CompareFriendPage } from "./pages/friendsCompare.page";
import { MultiCompareFriendsPage } from "./pages/friendsMultiCompare.page";
import { AuthWelcomePage } from "./pages/auth/authWelcome.page";
import { OnboardingPage } from "./pages/onboarding/onboarding.page";
import { LegalDocumentPage } from "./pages/legal/legalDocument.page";
import { PremiumPage } from "./pages/premium.page";

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
    premium: <PremiumPage/>,
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
    'marketplace/my-purchases': (
        <MarketplaceFeatureRoute>
            <MyPurchasesPage/>
        </MarketplaceFeatureRoute>
    ),
    'marketplace/sell': (
        <MarketplaceFeatureRoute>
            <CreateListingPage/>
        </MarketplaceFeatureRoute>
    ),
    attendance: (
        <AttendanceTrackingFeatureRoute>
            <AttendanceHistoryPage />
        </AttendanceTrackingFeatureRoute>
    ),
    'ticket-interests': (
        <TicketDemandFeatureRoute>
            <MyInterestsPage />
        </TicketDemandFeatureRoute>
    ),
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
        element: (
            <AttendanceAdvancedStatsRoute>
                <CompareFriendPage />
            </AttendanceAdvancedStatsRoute>
        ),
    },
    {
        path: '/friends/compare-multi',
        element: (
            <AttendanceAdvancedStatsRoute>
                <MultiCompareFriendsPage />
            </AttendanceAdvancedStatsRoute>
        ),
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
        path: '/manager/:id',
        element: <ManagerPage />
    },
    {
        path: '/stadium/:id',
        element: <StadiumPage />
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
                path: 'welcome',
                element: (
                    <PublicOnlyRoute>
                        <AuthWelcomePage />
                    </PublicOnlyRoute>
                ),
            },
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
            { path: 'contact', element: <ContactPage /> },
            { path: 'help', element: <HelpPage /> },
            { path: 'licenses', element: <LicensesPage /> },
            { path: 'privacy', element: <LegalDocumentPage doc="privacy" /> },
            { path: 'terms', element: <LegalDocumentPage doc="terms" /> },
            { path: 'cookies', element: <LegalDocumentPage doc="cookies" /> },
            {
                element: <RequireAuth />,
                children: [
                    { path: 'onboarding', element: <OnboardingPage /> },
                    {
                        element: <OnboardingGate />,
                        children: [
                            { path: 'home', element: <HomePage /> },
                            ...childrenRoutes,
                            ...additionalRoutes,
                            {
                                element: <RequireAdmin />,
                                children: [
                                    { path: '/admin', element: <AdminDashboardPage /> },
                                    { path: '/admin/discount-codes', element: <DiscountCodesAdminPage /> },
                                    { path: '/admin/ticket-links', element: <TicketLinksAdminPage /> },
                                    { path: '/admin/affiliate-partners', element: <AffiliatePartnersAdminPage /> },
                                    { path: '/admin/ticket-link-analytics', element: <TicketLinkAnalyticsPage /> },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
])

export function Router() {
    return (
        <RouterProvider router={router}/>
    )
}