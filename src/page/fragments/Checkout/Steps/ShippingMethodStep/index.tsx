import {FC, useEffect} from "react";
import Form from "rc-field-form";
import {CheckoutContainer} from "../../../../../container/CheckoutContext.ts";
import useSWR from "swr";
import {Price} from "@components/fragments/Price.tsx";
import {useShop} from "../../../../../container/ShopContext.ts";
import {getSubtotal} from "@lib/calc.ts";
import {useCurrentForm, useFormField} from "../../../../../container/FormContext.ts";
import {ShippingLines} from "../../forms/ShippingLines.tsx";

import {AutoSetShippingMethod} from "./AutoSetShippingMethod.tsx";
import {ApolloStoreFrontClient, GetCartGid, getShippingRateUrl, storefront, storefront_stream} from "@lib/checkout.ts";

export type ShippingMethodStepProps = {};

import {InsuranceFrame} from "@components/frames/InsuranceFrame.tsx";
export const ShippingMethodStep: FC<ShippingMethodStepProps> = (props) => {
    const shop = useShop();
    const checkout = CheckoutContainer.use();
    const subtotal = (checkout?.line_items || []).reduce((acc, item) => {
        return acc + (parseFloat(item.variant.price || '0') * item.quantity);
    }, 0);
    const form = useCurrentForm();
    const shipping_address = Form.useWatch(['shipping_address']) || {};
    // const {region_id, state_id} = shipping_address || {};
    // const empty = !region_id && !state_id;
    // const method_url = empty ? null : (state_id ? `shipping_lines/${region_id!}/${state_id}` : `shipping_lines/${region_id}`);
    const method_url = getShippingRateUrl(shipping_address);
    const {
        data,
        isLoading
    } = useSWR<DB.ShippingLine[]>(method_url, (url : string) => {
        // console.log('post:',url,ShippingLineQuery);
        return [];
        // ApolloStoreFrontClient.query({
        //     'query' : gql(ShippingLineQuery),
        //     'variables' : {
        //         cartId : GetCartGid(),
        //     }
        // }).then((response) => {
        //     console.log('apollo stream query:',response);
        // })
        // return storefront_stream(`${ShippingLineQuery}`,{
        //     'cartId' : GetCartGid(),
        // }).then((response) => {
        //     const node = _get(response,'data.cart.deliveryGroups.edges.0.node',{});
        //     const lines = _get(node,'deliveryOptions',[]);
        //     return lines.map((line : any) => {
        //         return {
        //             name : line.title,
        //             id : line.handle,
        //             price : line.estimatedCost.amount,
        //         }
        //     });
        // })
        // return api({
        //     method : "get",
        //     url : '/cart/shipping_rates.json',
        // })
        // return api({
        //     method : "post",
        //     url,
        // }).then(() => {
        //     return api({
        //         method : 'get',
        //         url : '/cart/async_shipping_rates.json',
        //     }).then((response) => {
        //         const rates = _get(response,'shipping_rates',[]);
        //         return rates.map((rate : any) => {
        //             return {
        //                 id : rate.code,
        //                 name : rate.presentment_name,
        //                 price : rate.price,
        //                 compare_price : rate.compare_price,
        //             };
        //         });
        //     })
        // })
    });
    //TODO 通过条件过滤配送方式
    const {enabled, rate, default: insuranceDefault} = shop?.preference?.checkout?.insurance || {};
    const insurance = enabled ? (getSubtotal(checkout?.line_items).mul(rate!).div(100)) : null;
    useEffect(() => {
        if (!insuranceDefault) return;
        if (!form.getFieldValue(['shipping_insurance'])) {
            form.setFieldValue('shipping_insurance', true);
        }
    }, [insuranceDefault]);
    const filtered = (data || []).filter((line) => {
        let {min = 0, max} = line;
        max = (max === undefined || max === null) ? Number.MAX_VALUE + '' : max;
        min = (min === undefined || min === null) ? '0' : min;
        // console.log('line:',line.name,max,min,subtotal,line);
        if (subtotal >= parseFloat(min + '') && subtotal <= parseFloat(max + '')) {
            return true;
        }
        return false;
    });
    return <div className={'space-y-3'}>
        <div>
            Shipping Method
        </div>
        {(isLoading || !method_url) ?
            <div className={'animate-pulse border rounded-md border-neutral-300 h-6 flex flex-col items-stretch p-4'}>
                <div className={'flex-1 bg-slate-200'}></div>
            </div> :
            <>
                <ShippingLines lines={filtered}/>
                <Form.Field name={'shipping_line'}>
                    <AutoSetShippingMethod methods={filtered}/>
                </Form.Field>
            </>
        }
        {enabled && rate !== null && <InsuranceFrame>
            <Price price={insurance!.toString()}/>
        </InsuranceFrame>}
    </div>
};
