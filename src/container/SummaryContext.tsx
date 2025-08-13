import {createContext, FC, ReactNode, useMemo} from "react";
import {CheckoutContainer} from "./CheckoutContext.ts";
import {getSubtotal} from "@lib/calc.ts";
import Big from "big.js";
import Form from "rc-field-form";
import {useCurrentForm} from "./FormContext.ts";

export type CheckoutSummary = {
    subtotal : number|Big;
    shipping_price ?: number;
    discount_price ?: number;
    insurance ?: number|Big;
    discount ?: DB.Discount;
    total : number|Big;
}
export const SummaryContext = createContext<CheckoutSummary>({
    subtotal : 0,
    total : 0,
})

export const SummaryProvider : FC<{children : ReactNode}> = (props) => {
    const {children} = props;
    const checkout = CheckoutContainer.use();
    const form = useCurrentForm();
    const {shipping_insurance,shipping_line} = Form.useWatch((values : DB.Checkout) => {
        return {
            shipping_insurance : values.shipping_insurance,
            shipping_line : values.shipping_line,
        }
    },{form}) || {};
    const insurance = checkout?.shop?.preference?.checkout?.insurance?.enabled !== undefined ?
        checkout?.shop?.preference?.checkout?.insurance?.enabled: false;
    const rate = checkout?.shop?.preference?.checkout?.insurance?.rate;
    const insurance_rate = ((shipping_insurance === undefined ) ? insurance : shipping_insurance) ? rate : null;
    const data = useMemo(() => {
        if(!checkout) return null;
        let total_line_items_price = getSubtotal(checkout.line_items);
        let original_shipping: undefined | string | number = undefined;
        if (shipping_line?.id) {
            original_shipping = shipping_line?.price || 0;
        }
        let final_shipping : undefined|string|number = original_shipping;
        let discount_price : any = 0;
        if (checkout.discount) {
            if(checkout.discount.free_shipping){
                final_shipping = 0;
            }
            discount_price = checkout.line_items?.reduce((current,line) => {
                return current.add(line.discount || '0');
            },Big(0)).neg();
        }

        let insurance_total = insurance_rate !== undefined &&
        insurance_rate !== null ? (total_line_items_price.mul((insurance_rate||'0') + '').div(100)) : undefined;
        const afterDiscount = Math.max([total_line_items_price,discount_price || '0'].reduce((prev,curr) => {
            return prev?.add(curr||'0');
        },Big(0)),0);
        const total = [Big(afterDiscount), Big(final_shipping || '0'),Big(insurance_total||'0')].reduce((prev, curr) => {
            return prev?.add(curr || '0');
        }, Big(0));
        return {
            subtotal : total_line_items_price,
            total,
            shipping : original_shipping,
            insurance : insurance_total,
            discount : checkout.discount,
            discount_price : Big(afterDiscount).sub(total_line_items_price).toNumber(),
        };
    },[checkout,shipping_line?.price,insurance_rate]);
    if(!data){
        return null;
    }
    return <SummaryContext value={data}>
        {children}
    </SummaryContext>
};
