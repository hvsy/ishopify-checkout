import React, {lazy} from 'react'
// import './index.css?inline';
import './index.css';
import { createRoot } from "react-dom/client";
import { SWRConfig } from 'swr';
import {api} from "@lib/api.ts";
import {App} from "./App.tsx";
import {loadDevMessages, loadErrorMessages} from "@apollo/client/dev";
import {ApolloProvider} from "@apollo/client";
import {ApolloStoreFrontClient} from "@lib/checkout.ts";
import {Analytics} from "./page/components/Analytics.tsx";

// const Analytics = lazy(async () => {
//     const m = await import("./page/components/Analytics.tsx");
//     return {
//         default : m.Analytics,
//     }
// });

async function setup(){
    let rootElement = document.getElementById('root');
    if(!rootElement){
        rootElement = document.createElement('div');
        document.body.appendChild(rootElement);
    }
    const root = createRoot(rootElement);
    // const {App} = await import('./App.tsx');
    root.render(
        <React.StrictMode>
            <SWRConfig value={{
                fetcher: api,
                revalidateIfStale: true,
                refreshWhenHidden: false,
                revalidateOnFocus: false,
                shouldRetryOnError: false,
                refreshWhenOffline: false,
                revalidateOnReconnect: false,
                revalidateOnMount: true,
            }}>
                <ApolloProvider client={ApolloStoreFrontClient}>
                    <App/>
                    <Analytics />
                </ApolloProvider>
            </SWRConfig>
        </React.StrictMode>
    );
}

setup();

if (import.meta.env.DEV) {
    // Adds messages only in a dev environment
    console.log('development...');
    loadDevMessages();
    loadErrorMessages();
}
