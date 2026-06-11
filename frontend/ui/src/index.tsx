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
        },
    },
})

const rootElement = document.getElementById('root');

async function bootstrap() {
    await ensureApiSession();

    createRoot(rootElement!).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <App/>
                <ReactQueryDevtools initialIsOpen={false}/>
            </QueryClientProvider>
        </StrictMode>,
    );
}

void bootstrap();
