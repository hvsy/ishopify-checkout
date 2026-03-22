import {FC, } from "react";

import { SWRConfig } from 'swr';
import { swr_api} from "@lib/api.ts";
import {App} from "./App.tsx";
import {ApolloProvider} from "@apollo/client";
import {ApolloStoreFrontClient} from "@lib/checkout.ts";
import {Analytics} from "./page/components/Analytics.tsx";
export type GlobalProps = {};

export const Global: FC<GlobalProps> = (props) => {
    const {} = props;

    return <SWRConfig value={{
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
    </SWRConfig>;
};
