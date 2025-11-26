import {FC, useEffect} from "react";
import {PageFrame} from "@components/frames/PageFrame.tsx";
import {useLoaderData, useParams} from "react-router-dom";
import {ShopifyContext} from "../context/ShopifyContext.ts";
import {OrderMain} from "./fragments/OrderMain.tsx";
import {OrderRight} from "./fragments/OrderRight.tsx";
import {useCleanCartCookie} from "../hooks/useCleanCartCookie.ts";
import {Pixels} from "../fragments/Pixels.tsx";
import {Report} from "../../page/components/Report.tsx";
import Big from "big.js";

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
        {data.shop.tracking && <Pixels tracking={data.shop.tracking} />}
        {data.token && <Report name={'purchase'} data={{
            // eventId : md5(data.token),
            email : data.email,
            address: data.shipping_address,
            currency : data.total_amount.currencyCode,
            price : data.total_amount.amount + '',
            token : data.token,
            quantity : data.line_items.reduce((pv,cv) => {
                return pv + cv.quantity;
            },0),
            contents : data.line_items.map((line) => {
                return {
                    id : (line.variant.id).replace(/gid:\/\/shopify\/[^/]+\//ig,''),
                    quantity : line.quantity,
                    price : Big(line.total.amount).div(line.quantity).toString(),
                    currency : line.total.currencyCode,
                }
            })
            // quantity : datat.
        }} token={data.token}/>}
    </ShopifyContext>;
};
