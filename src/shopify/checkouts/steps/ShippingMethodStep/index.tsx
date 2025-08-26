import {FC, useEffect} from "react";
import {get as _get,isEmpty as _isEmpty} from "lodash-es";
import Form from "rc-field-form";

export type ShippingMethodStepProps = {};

import {StepFrame} from "@components/frames/StepFrame.tsx";
import {ShippingListFrame} from "@components/frames/ShippingListFrame.tsx";
import {useMoneyFormat} from "../../../context/ShopifyContext.ts";
import {useSummary} from "../../hooks/useSummary.tsx";
import {NoShippingMethod} from "../../../../page/fragments/Checkout/Steps/ShippingMethodStep/NoShippingMethod.tsx";
import {useCurrentForm} from "../../../../container/FormContext.ts";


const Title = "Shipping Method";
export const ShippingMethodStep: FC<ShippingMethodStepProps> = (props) => {
    const {} = props;
    const {json,groups,loading}= useSummary();

    const group = groups?.[0] || null;
    const methods = _get(group,'deliveryOptions',[]);
    const allocations= _get(json,'data.cart.discountAllocations',[]);
    const shipping_line_id = _get(group,'selectedDeliveryOption.handle',null);
    const shipping_group_id = _get(group,'id',null);
    const form = useCurrentForm();
    useEffect(() => {
        const current=form.getFieldsValue(['shipping_line_id','shipping_group_id']);
        const changed : any = {};
        if(current.shipping_line_id !== shipping_line_id){
            changed['shipping_line_id'] = shipping_line_id;

        }
        if(current.shipping_group_id !== shipping_group_id){
            changed['shipping_group_id'] = shipping_group_id;
        }
        if(!_isEmpty(changed)){
            form.setFieldsValue(changed);
        }
    }, [shipping_group_id,shipping_line_id]);
    if(loading.shipping_methods){
        return <StepFrame title={Title}>
            <div className={'animate-pulse border rounded-md border-neutral-300 flex flex-row items-center  space-x-3 p-4'}>
                    <div className={'size-4 rounded-full bg-slate-200'}></div>
                    <div className={'flex-1 bg-slate-200 h-3 rounded-xl'}></div>
            </div>
        </StepFrame>
    }

    const format = useMoneyFormat();
    return <StepFrame title={Title}>
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
                return format(line.cost,'Free');
            }}/>
        </Form.Field>:  <NoShippingMethod /> }
    </StepFrame>;
};
