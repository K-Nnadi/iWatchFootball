import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import App from "./App";
import { configureApiClient } from './shared/api-client.config';
import { ensureApiSession } from './shared/api-session';

configureApiClient();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 2 * 60 * 1000,
        },
    },
})

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App/>
            {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false}/> : null}
        </QueryClientProvider>
    </StrictMode>,
);

void ensureApiSession();
