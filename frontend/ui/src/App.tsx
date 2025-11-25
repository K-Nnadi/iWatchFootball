import React, { useEffect } from 'react';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import './styles/modern.css';
import {MantineProvider} from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import {Router} from "./router";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { configureApiClient } from './shared/api-client.config';


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false
        }
    }
});

function App() {
    // Configure API client on app initialization
    useEffect(() => {
        configureApiClient();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <MantineProvider defaultColorScheme={'dark'}>
                <Notifications />
                <Router/>
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;
