import {FC, useEffect} from "react";
import {PageFrame} from "@components/frames/PageFrame.tsx";
import {useLoaderData, useParams} from "react-router-dom";
import {ShopifyContext} from "../context/ShopifyContext.ts";
import {OrderMain} from "./fragments/OrderMain.tsx";
import {OrderRight} from "./fragments/OrderRight.tsx";
import {useCleanCartCookie} from "../hooks/useCleanCartCookie.ts";

export type OrderProps = {};

export const Order: FC<OrderProps> = (props) => {
    const {} = props;
    const data = useLoaderData() as Shopify.Order;
    useCleanCartCookie(data?.cart_id);
    return <ShopifyContext value={{
        shop: data.shop
    }}>
        <PageFrame
            renderRight={() => {
            return <OrderRight />
        }}
        renderLeft={() => {
            return <OrderMain/>
        }}>
        </PageFrame>
    </ShopifyContext>;
};
