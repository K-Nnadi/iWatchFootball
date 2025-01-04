import React from 'react';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import {MantineProvider} from '@mantine/core';
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
            <MantineProvider defaultColorScheme={'light'}>
                <Router/>
            </MantineProvider>
        </QueryClientProvider>
    );
}

export default App;
