import {FC, } from "react";
import {GlobalContextProvider,} from "../checkouts/hooks/useSummary.tsx";
import {Outlet,} from "react-router-dom";
import {useRemoveAppLoader} from "@hooks/useRemoveAppLoader.tsx";

export type ShopifyCheckoutFrameProps = {};


export const ShopifyCheckoutFrame: FC<ShopifyCheckoutFrameProps> = (props) => {
    useRemoveAppLoader();
    return <GlobalContextProvider>
        <Outlet/>
    </GlobalContextProvider>
};
