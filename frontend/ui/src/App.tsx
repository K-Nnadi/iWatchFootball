import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './theme/tokens.css';
import './styles/modern.css';
import { MantineProvider } from '@mantine/core';
import { appTheme } from './theme/mantine-theme';
import { I18nProvider } from './i18n';
import { Notifications } from '@mantine/notifications';

import {Router} from "./router";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false
        }
    }
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider theme={appTheme} defaultColorScheme={'dark'}>
                <I18nProvider>
                    <Notifications />
                    <Router/>
                </I18nProvider>
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;
