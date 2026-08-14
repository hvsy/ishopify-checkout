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
            {/* Analytics 必须先于 App 挂载：它负责初始化 window.report / window.listen，
                否则 App 子树（尤其内联 setup 时首屏就渲染的 Pixels）会在 effect 里
                读到 undefined，导致像素事件监听永远注册不上。 */}
            <Analytics />
            <App/>
        </ApolloProvider>
    </SWRConfig>;
};
