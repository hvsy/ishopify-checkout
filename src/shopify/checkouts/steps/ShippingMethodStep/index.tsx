import React, {FC, useEffect} from "react";
import {get as _get, isEmpty as _isEmpty} from "lodash-es";
import Form from "@rc-component/form";

export type ShippingMethodStepProps = {};

import {StepFrame} from "@components/frames/StepFrame.tsx";
import {ShippingListFrame} from "@components/frames/ShippingListFrame.tsx";
import {useMoneyFormat} from "../../../context/ShopifyContext.ts";
import {useSummary} from "../../hooks/useSummary.tsx";
import {NoShippingMethod} from "../../../../page/fragments/Checkout/Steps/ShippingMethodStep/NoShippingMethod.tsx";
import {useCurrentForm} from "../../../../container/FormContext.ts";
import {useShopifyCheckoutLoading} from "../../../context/ShopifyCheckoutContext.tsx";
import {FormItem} from "@components/fragments/FormItem.tsx";
import {Features} from "@lib/flags.ts";
import {DeliveryTip} from "../../../fragments/DeliveryTip.tsx";
import Big from "big.js";
import {getShippingDiscountAmount, getShippingDiscountRate} from "@lib/shippingDiscounts.ts";

export const PlainField = (props: any) => {
    const {errors,value} = props;
    if(!!value) return null;
    return <div className={'flex flex-row space-y-2 text-red-500'}>
        {(errors||[]).map((error : string,i : number) => {
            return <div key={i}>{error}</div>
        })}
    </div>
}

const Title = "Shipping Method";
const ShowSpin = Features.includes('shipping:spin');
const ShowDeliveryTip = Features.includes('shipping:delivery:tip');
export const ShippingMethodStep: FC<ShippingMethodStepProps> = (props) => {
    const {} = props;
    const {json, groups, loading} = useSummary();
    const checkoutLoading = useShopifyCheckoutLoading();

    const group = groups?.[0] || null;
    const methods = _get(group, 'deliveryOptions', null);
    const shipping_line_id = _get(group, 'selectedDeliveryOption.handle', null);
    const shipping_group_id = _get(group, 'id', null);
    const form = useCurrentForm();
    const state_code = form.getFieldValue(['shipping_address', 'state_code']);
    useEffect(() => {
        const current = form.getFieldsValue(['shipping_line_id', 'shipping_group_id']);
        const changed: any = {};
        if (current.shipping_line_id !== shipping_line_id) {
            changed['shipping_line_id'] = shipping_line_id;

        }
        if (current.shipping_group_id !== shipping_group_id) {
            changed['shipping_group_id'] = shipping_group_id;
        }
        if (!_isEmpty(changed)) {
            form.setFieldsValue(changed);
        }
    }, [shipping_group_id, shipping_line_id]);
    const format = useMoneyFormat();
    const shippingDiscount = getShippingDiscountAmount(groups, json);
    const shippingDiscountRate = getShippingDiscountRate(groups, json);
    // 有配置比例时优先按比例折算每个快递方式；没有比例（固定金额折扣）再按
    // discountedAmount 回退扣除。
    const hasShippingDiscount = shippingDiscountRate > 0 || shippingDiscount.gt(0);
    if (loading.shipping_methods || (checkoutLoading && !methods?.length)) {
        return <StepFrame title={Title}>
            <div
                className={'animate-pulse border rounded-md border-neutral-300 flex flex-row items-center  space-x-3 p-4'}>
                {ShowSpin ? <svg className="size-5 animate-spin text-slate-500" xmlns="http://www.w3.org/2000/svg"
                     fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                            stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> : <div className={'size-4 bg-slate-300 rounded-full'}></div>}
                <div className={'flex-1 bg-slate-300 h-3 rounded-xl'}></div>
            </div>
        </StepFrame>
    }
    if ((!methods?.length) && !state_code) {
        return <StepFrame title={Title}>
            <div className={'rounded-lg bg-gray-100 p-5 text-gray-500'}>
                Enter your shipping address to view available shipping methods.
            </div>
        </StepFrame>
    }

    return <>
        <StepFrame title={Title}>
            {!!methods?.length ? <Form.Field name={['shipping_line_id']}>
                <ShippingListFrame
                    onSelectedChange={(handle, item) => {
                        // console.log('handle:', handle, item);
                        // mutationCheckout({
                        //     deliveryHandle : handle,
                        //     deliveryGroupId : group.id,
                        // })
                        // fn({
                        //     variables: {
                        //         options: [{
                        //             deliveryGroupId: group.id,
                        //             deliveryOptionHandle: handle,
                        //         }]
                        //     }
                        // })
                    }}
                    // value={shipping_line_id}
                    lines={methods.map((method: any) => {
                        const cost = method.estimatedCost || {};
                        const originalAmount = Big(cost.amount || 0);
                        // 按 sourceDiscountApplication.value.PricingPercentageValue.percentage
                        // 折算每个快递方式；没有百分比配置时回退到 discountedAmount 固定扣除。
                        const discounted = shippingDiscountRate > 0
                            ? originalAmount.mul(1 - shippingDiscountRate)
                            : (shippingDiscount.gt(0) ? originalAmount.minus(shippingDiscount) : originalAmount);
                        const discountedCost = hasShippingDiscount && discounted.lte(0)
                            ? {amount: '0', currencyCode: cost.currencyCode}
                            : {amount: discounted.gt(0) ? discounted.toString() : cost.amount, currencyCode: cost.currencyCode};
                        return {
                            id: method.handle,
                            name: method.title,
                            // price : method.etimatedCost,
                            cost: discountedCost,
                            // 有运费折扣时保留原始运费，用于在快递方式列表里划掉原价。
                            originalCost: hasShippingDiscount ? cost : null,
                        };
                    })} renderPrice={(line: any) => {
                        const cost = line.cost || {};
                        const originalCost = line.originalCost;
                        const originalAmount = Big(_get(originalCost, 'amount', 0) || 0);
                        const discountedAmount = Big(_get(cost, 'amount', 0) || 0);
                        const hasDiscount = hasShippingDiscount
                            && originalAmount.gt(0)
                            && discountedAmount.lt(originalAmount);
                        if (hasDiscount) {
                            return <div className={'flex flex-row items-center space-x-2'}>
                                <span className={'line-through text-gray-600 text-sm'}>{format(originalCost)}</span>
                                <span className={discountedAmount.lte(0) ? 'font-bold' : ''}>{format(cost, 'Free')}</span>
                            </div>;
                        }
                        return format(cost, 'Free');
                    }}/>
            </Form.Field> : <NoShippingMethod/>}
            {ShowDeliveryTip && <DeliveryTip className={'flex sm:hidden'}/>}
        </StepFrame>
        <FormItem name={['shipping_line_id']} preserve={true} rules={[{
            required: true,
            'message': 'You must select a shipping method.'
        }]}>
            <PlainField/>
        </FormItem>
    </>;
};
