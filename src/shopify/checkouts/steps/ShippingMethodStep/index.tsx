import {FC} from "react";
import {useLoaderData} from "react-router-dom";
import {gql, useMutation, useQuery, useReadQuery} from "@apollo/client";
import {GetCartGid} from "@lib/checkout.ts";
import {get as _get} from "lodash-es";
import Form from "rc-field-form";

export type ShippingMethodStepProps = {};

import {StepFrame} from "@components/frames/StepFrame.tsx";
import {ShippingListFrame} from "@components/frames/ShippingListFrame.tsx";
import {useMoneyFormat} from "../../../context/ShopifyContext.ts";
import {useDeliveryGroups} from "../../../context/DeliveryGroupContext.tsx";
import {useSummary} from "../../hooks/useSummary.ts";
import {NoShippingMethod} from "../../../../page/fragments/Checkout/Steps/ShippingMethodStep/NoShippingMethod.tsx";
import {MutateSelectedDeliveryOption} from "@query/checkouts/mutations.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";


const Title = "Shipping Method";
export const ShippingMethodStep: FC<ShippingMethodStepProps> = (props) => {
    const {} = props;
    const {loading,groups} = useDeliveryGroups();
    const storage = useCartStorage();
    const [fn,] = useMutation(gql([
        MutateSelectedDeliveryOption,
    ].join("\n")),{
        refetchQueries : ['Summary','ShippingMethods','CartLineItems'],
        variables : {
            cartId : storage.gid,
        }
    });
    const {json}= useSummary();

    // console.log('shipping methods data:',groups,loading);
    if(loading){
        return <StepFrame title={Title}>
            <div className={'animate-pulse border rounded-md border-neutral-300 flex flex-row items-center  space-x-3 p-4'}>
                    <div className={'size-4 rounded-full bg-slate-200'}></div>
                    <div className={'flex-1 bg-slate-200 h-3 rounded-xl'}></div>
            </div>
        </StepFrame>
    }
    const group = groups?.[0] || null;
    const methods = _get(group,'deliveryOptions',[]);
    const allocations= _get(json,'data.cart.discountAllocations',[]);
    // .filter((allocation : any) => {
    // });
    const shipping_line_id = _get(group,'selectedDeliveryOption.handle',null);
    const format = useMoneyFormat();
    return <StepFrame title={Title}>
        {!!methods?.length ? <Form.Field name={['shipping_line_id']}>
            <ShippingListFrame
                onSelectedChange={(handle, item) => {
                    console.log('handle:', handle, item);
                    fn({
                        variables: {
                            options: [{
                                deliveryGroupId: group.id,
                                deliveryOptionHandle: handle,
                            }]
                        }
                    })
                }}
                value={shipping_line_id}
                lines={methods.map((method: any) => {

                    return {
                        id: method.handle,
                        name: method.title,
                        // price : method.etimatedCost,
                        cost: method.estimatedCost,
                    };
                })} renderPrice={(line: any) => {
                return format(line.cost);
            }}/>
        </Form.Field>:  <NoShippingMethod /> }
    </StepFrame>;
};
