import React, {FC} from "react";
import {Report} from "../../../page/components/Report.tsx";
import {md5} from "js-md5";
import Big from "big.js";
import {get as _get} from "lodash-es";
import {useParams} from "react-router-dom";
import {usePaymentContext} from "../../../container/PaymentContext.tsx";

export type CheckoutPixelReportProps = {
    lines : any[];
    json : any;
};

export const CheckoutPixelReport: FC<CheckoutPixelReportProps> = (props) => {
    const {lines,json} = props;
    const {token} = useParams();
    if(!token || !lines.length) return null;

    return <Report name={'checkout_started'} data={{
        eventId : md5(token),
        quantity : lines.reduce((pv : number,cv : any) => {
            return pv + cv.quantity;
        },0),
        content_ids : lines.map(((line) => {
            return line.id.replace('gid://shopify/ProductVariant/','');
        })),
        contents : lines.map((line : any) => {
            const cost = line.cost.totalAmount;
            return {
                id : line.id.replace('gid://shopify/ProductVariant/',''),
                quantity : line.quantity,
                price : Big(cost.amount).div(line.quantity).toString(),
            }
        }),
        price : _get(json, 'cart.cost.totalAmount.amount'),
        currency : _get(json, 'cart.cost.totalAmount.currencyCode'),
    }} token={token} />
};
