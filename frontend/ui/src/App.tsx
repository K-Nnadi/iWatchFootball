import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import './styles/modern.css';
import {createTheme, MantineProvider, Modal} from '@mantine/core';

/** Mantine Modal default ~200 sits under the app shell sticky header (z-index: 1000), which clipped modal titles */
const mantineTheme = createTheme({
    components: {
        Modal: Modal.extend({
            defaultProps: {
                zIndex: 1200,
            },
        }),
    },
});
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
            <MantineProvider theme={mantineTheme} defaultColorScheme={'dark'}>
                <Notifications />
                <Router/>
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;
