import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import App from "./App";
import { configureApiClient } from './shared/api-client.config';

/** Must run before first paint so axios.defaults.baseURL is set; otherwise relative URLs hit the Vite origin (5173). */
configureApiClient();



const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
})

const rootElement = document.getElementById('root')


createRoot(rootElement!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App/>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    </StrictMode>,
)
