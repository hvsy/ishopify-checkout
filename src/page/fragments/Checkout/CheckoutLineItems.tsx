import React, {FC} from "react";
import {LineItems} from "../LineItems.tsx";
import {CouponForm} from "./CouponForm.tsx";
import {CheckoutContainer} from "../../../container/CheckoutContext.ts";

export type CheckoutLineItemsProps = {};

export const CheckoutLineItems: FC<CheckoutLineItemsProps> = (props) => {
    const {} = props;
    const checkout = CheckoutContainer.use();
    return <>
        <LineItems line_items={checkout?.line_items}/>
        <CouponForm />
    </>;
};
