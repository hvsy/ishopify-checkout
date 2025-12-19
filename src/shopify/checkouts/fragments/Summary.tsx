import React, {FC, Fragment} from "react";
import {get as _get, groupBy as _groupBy} from "lodash-es";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";

export type SummaryProps = {
    lines : any[]
};

import Big from "big.js";
import {useSummary} from "../hooks/useSummary.tsx";
import {LoadingContainer} from "@components/fragments/LoadingContainer.tsx";
import {SummaryFrame} from "../../fragments/SummaryFrame.tsx";
import {CheckoutPixelReport} from "./CheckoutPixelReport.tsx";

export const Summary: FC<SummaryProps> = (props) => {
    const {lines} = props;
    const {checkout: getCheckout, json, groups, loading} = useSummary();
    const checkout = getCheckout();
    const format = useMoneyFormat();
    const allocations = _get(json, 'cart.discountAllocations', []);
    const allocateShippingLine = allocations.filter((line: any) => {
        return line?.targetType === 'SHIPPING_LINE';
    });
    const shippingCodes: string[] = [];
    const totalSaved = Big(_get(json, 'cart.cost.checkoutChargeAmount.amount', 0))
    .minus(_get(json, 'cart.cost.subtotalAmount.amount', 0)).add(allocations.reduce((pv: number, cv: any) => {
        if (cv.targetType === 'SHIPPING_LINE') {
            shippingCodes.push(cv.code);
        }
        return pv + parseFloat(cv.discountedAmount.amount);
    }, 0));
    const selectedDelivery = _get(groups,'0.selectedDeliveryOption',{});
    const shipping_cost = _get(selectedDelivery , 'estimatedCost')
    const codes = _get(json, 'cart.discountCodes', []).filter((discount: any) => {
        return !!discount.applicable && !shippingCodes.includes(discount.code);
    }).map((discount: any) => {
        const code = discount.code;
        const amount = allocations.filter((item: any) => {
            return item.code === code;
        }).reduce((a: number, c: any) => {
            return Big(a).add(c?.discountedAmount?.amount || 0);
        }, Big(0));
        return {code, amount: amount.toNumber()};
    }).filter((item: any) => {
        return item.amount > 0;
    });
    const freeShipping = checkout.shipping_discount?.discountedAmount?.amount === shipping_cost?.amount;
    const total = _get(json, 'cart.cost.totalAmount');
    return <><SummaryFrame subtotal={_get(json, 'cart.cost.subtotalAmount')}
                           total={total}
                           total_quantity={_get(json, 'cart.totalQuantity')}
                           discount_codes={codes}
                           shipping_discounts={allocateShippingLine}
                           total_saved={!!totalSaved?.toNumber() ? {
                               amount: totalSaved.toFixed(2),
                               currencyCode: total.currencyCode,
                           } : undefined}
                           renderShipping={() => {
                               return <LoadingContainer
                                   loading={loading.shipping_methods}
                                   loadingClassName={'w-20 h-5 rounded-xl'}
                                   loadingContainerClassName={'justify-end'}
                               >
                                   {ing  => {
                                       if(!selectedDelivery?.handle) {
                                           return <span>Calculated at next step</span>
                                       }
                                       if(freeShipping) {
                                           return <div className={'flex flex-row items-center space-x-2'}>
                                               {checkout.shipping_discount && <div className={'line-through'}>
                                                   <span></span>
                                                   <span>{format(checkout.shipping_discount.discountedAmount)}</span>
                                               </div>}
                                               <span className={'font-bold'}>FREE</span>
                                           </div>
                                       }
                                       return <div className={''}>
                                           <span>{format(shipping_cost, 'Free')}</span>
                                       </div>
                                   }}
                               </LoadingContainer>;
                           }}/>
        <CheckoutPixelReport lines={lines} json={json} />
    </>;
}
