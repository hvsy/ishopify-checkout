import React, {FC, useEffect, useMemo} from "react";
import {LineItems} from "../fragments/LineItems.tsx";
import {Right} from "../fragments/Right.tsx";
import Big from "big.js";

export type OrderRightProps = {
    line_items: (DB.CartItem | DB.OrderLineItem)[];
    className ?: string;
    currency : DB.Currency;
    shipping_line?: DB.ShippingLine;
    insurance : string|number|null;
    subtotal : Big;
    discount_price ?: Big;
    discount ?: DB.Discount|null;
    token ?: string;
    total : Shopify.Money;
};

export const OrderRight: FC<OrderRightProps> = (props) => {
    //TODO 删除
    return null;
    // const {subtotal,line_items,className,currency,
    //     shipping_line,insurance,
    //     discount_price,
    //     discount,
    //     token,
    //     total,
    // } = props;
    // // const total = useMemo(() => {
    // //     const final = discount?.free_shipping ? 0 : shipping_line?.price;
    // //     return Big(subtotal).add(insurance || 0).add(final || 0).add(discount_price || 0);
    // // },[subtotal?.toString(),insurance,discount,shipping_line?.price,discount_price?.toString()]);
    // useEffect(() => {
    //     if(!token) return;
    //     window?.report?.("purchase",{
    //         token : token,
    //         price :Big(total.amount).toString(),
    //         currency : total.currencyCode,
    //         contents : (line_items||[]).map((line) => {
    //             return {
    //                 id : line.product.id + '',
    //                 quantity : line.quantity
    //             };
    //         })
    //     },token + "_purchase");
    // }, [total,token]);
    //
    // return <Right
    //     className={className}
    //     currency={currency}
    //     summary={{
    //         total,
    //         subtotal,
    //         shipping : shipping_line?.price,
    //         insurance : insurance,
    //         discount : discount || undefined,
    //         discount_price : discount_price,
    //     }}
    // >
    //     <LineItems line_items={line_items}/>
    // </Right>;
};
