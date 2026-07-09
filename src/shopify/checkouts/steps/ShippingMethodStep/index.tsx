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
import {PlainField} from "../../fragments/SingleCheckoutForm.tsx";
import {Features} from "@lib/flags.ts";
import {DeliveryTip} from "../../../fragments/DeliveryTip.tsx";


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
                        return {
                            id: method.handle,
                            name: method.title,
                            // price : method.etimatedCost,
                            cost: method.estimatedCost,
                        };
                    })} renderPrice={(line: any) => {
                    return format(line.cost, 'Free');
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
