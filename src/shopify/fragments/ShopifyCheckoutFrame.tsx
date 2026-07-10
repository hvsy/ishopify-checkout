import {FC, } from "react";
import {GlobalContextProvider,} from "../checkouts/hooks/useSummary.tsx";
import {Outlet,} from "react-router-dom";

export type ShopifyCheckoutFrameProps = {};


export const ShopifyCheckoutFrame: FC<ShopifyCheckoutFrameProps> = (props) => {
    return <GlobalContextProvider>
        <Outlet/>
    </GlobalContextProvider>
};
