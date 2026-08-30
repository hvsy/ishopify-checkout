import React, {FC, Fragment} from "react";
import {get as _get, groupBy as _groupBy} from "lodash-es";
import {useMoneyFormat} from "../../context/ShopifyContext.ts";

export type SummaryProps = {
};

import Big from "big.js";
import {useSummary} from "../hooks/useSummary.tsx";
import {LoadingContainer} from "@components/fragments/LoadingContainer.tsx";
import {SummaryFrame} from "../../fragments/SummaryFrame.tsx";
import {DeliveryTip} from "../../fragments/DeliveryTip.tsx";
import {getShippingAllocations, getShippingDiscountAmount} from "@lib/shippingDiscounts.ts";

export const Summary: FC<SummaryProps> = (props) => {
    const {json, groups, loading} = useSummary();
    const format = useMoneyFormat();
    // cart.discountAllocations 已弃用：行项目折扣取自
    // cart.lines[].discountAllocations(lineLevelOnly: false)，
    // 运费折扣取自 cart.deliveryGroups[].discountAllocations。
    const lineAllocations = _get(json, 'cart.lines.edges', []).flatMap((edge: any) => {
        return _get(edge, 'node.discountAllocations', []);
    });
    const shippingAllocations = getShippingAllocations(groups, json);
    const shippingDiscount = getShippingDiscountAmount(groups, json);
    const allocations = [...lineAllocations, ...shippingAllocations];
    const allocateShippingLine = allocations.filter((line: any) => {
        return line?.targetType === 'SHIPPING_LINE';
    });
    const shippingCodes: string[] = [];
    const totalSaved = Big(_get(json, 'cart.cost.checkoutChargeAmount.amount', 0))
    .minus(_get(json, 'cart.cost.subtotalAmount.amount', 0)).add(allocations.reduce((pv: Big, cv: any) => {
        if (cv.targetType === 'SHIPPING_LINE') {
            shippingCodes.push(cv.code);
        }
        const amount = cv?.discountedAmount?.amount;
        return amount ? pv.add(amount) : pv;
    }, Big(0)));
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
    const shippingAmount = Big(_get(shipping_cost, 'amount', 0) || 0);
    const effectiveShippingAmount = shippingDiscount.gt(0) && shippingAmount.gt(0)
        ? shippingAmount.minus(shippingDiscount)
        : shippingAmount;
    const freeShipping = shippingDiscount.gt(0) && effectiveShippingAmount.lte(0);
    const effectiveShipping = {
        amount: effectiveShippingAmount.gt(0) ? effectiveShippingAmount.toString() : _get(shipping_cost, 'amount'),
        currencyCode: _get(shipping_cost, 'currencyCode'),
    };
    const total = _get(json, 'cart.cost.totalAmount');
    return <div className={'flex flex-col items-stretch pt-2 space-y-2'}>
        <DeliveryTip />
        <SummaryFrame subtotal={_get(json, 'cart.cost.subtotalAmount')}
                           total={total}
                           total_quantity={_get(json, 'cart.totalQuantity')}
                           discount_codes={codes}
                           shipping_discounts={allocateShippingLine}
                           loading={loading.summary}
            // loading={true}
                           total_saved={!!totalSaved?.toNumber() ? {
                               amount: totalSaved.toFixed(2),
                               currencyCode: total?.currencyCode || '',
                           } : undefined}
                           renderShipping={() => {
                               return <LoadingContainer
                                   loading={loading.shipping_methods}
                                   loadingClassName={'w-10 h-5 rounded-xl'}
                                   loadingContainerClassName={'justify-end'}
                               >
                                   {ing  => {
                                       if(!selectedDelivery?.handle) {
                                           return <span>Calculated at next step</span>
                                       }
                                       if(freeShipping) {
                                           return <div className={'flex flex-row items-center space-x-2'}>
                                               {shipping_cost?.amount && <div className={'line-through'}>
                                                   <span>{format(shipping_cost)}</span>
                                               </div>}
                                               <span className={'font-bold'}>FREE</span>
                                           </div>
                                       }
                                       return <div className={''}>
                                           <span>{format(effectiveShipping, 'Free')}</span>
                                       </div>
                                   }}
                               </LoadingContainer>;
                           }}/>
    </div>;
}
