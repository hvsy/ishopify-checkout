import React, {lazy} from 'react'
// import './index.css?inline';
import './index.css';
import { createRoot } from "react-dom/client";
import { SWRConfig } from 'swr';
import { swr_api} from "@lib/api.ts";
import {App} from "./App.tsx";
import {loadDevMessages, loadErrorMessages} from "@apollo/client/dev";
import {ApolloProvider} from "@apollo/client";
import {ApolloStoreFrontClient} from "@lib/checkout.ts";
import {Analytics} from "./page/components/Analytics.tsx";
import * as Sentry from "@sentry/react";
import {getArrayFromMeta, getMetaContent} from "@lib/metaHelper.ts";
import {globalHandlersIntegration} from "@sentry/react";




async function setup(){
    const dsn = getMetaContent("sentry");
    if(!!dsn){
        Sentry.init({
            dsn,
            // Setting this option to true will send default PII data to Sentry.
            // For example, automatic IP address collection on events
            sendDefaultPii: getArrayFromMeta('sentry_features').includes('ppi'),
            integrations: function(integrations){
                // const index = integrations.findIndex(function (integration) {
                //     return integration.name === "GlobalHandlers";
                // });
                // if(index !==-1){
                //     integrations[index] = globalHandlersIntegration({
                //         onerror : false,
                //         onunhandledrejection : false,
                //     });
                // }
                return integrations.filter((integration) => {
                    return integration.name !== 'BrowserApiErrors';
                });
            },

        });
    }

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
                fetcher: swr_api,
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
