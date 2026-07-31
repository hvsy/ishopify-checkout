import {FC, } from "react";
import {ContactInformationForm} from "../../forms/ContactInformationForm.tsx";
import {AddressForm} from "../../forms/AddressForm.tsx";
import Form from "@rc-component/form";
import {useShippingZones} from "../../../../../container/PaymentContext.tsx";
import {useCart} from "@hooks/useCart.ts";
import {api} from "@lib/api.ts";
import {useDebounceCallback} from "usehooks-ts";
import {useCurrentForm} from "../../../../../container/FormContext.ts";
import {omit} from "lodash-es";
import {PhoneOnlyRequired} from "../../../../../shopify/lib/globalSettings.ts";
import {useSummary} from "../../../../../shopify/checkouts/hooks/useSummary.tsx";

export type ContactInformationStepProps = {
};

export const ContactInformationStep:FC<ContactInformationStepProps>
    = (props) => {
    const {zones,loading} = useShippingZones();
    const {loading: summaryLoadingState} = useSummary();
    const {api: cartApi} = useCart();
    const form = useCurrentForm();
    const onPhoneChanged = useDebounceCallback((phone : string,pass : boolean) => {
        if(!import.meta.env.DEV){
            const values = form.getFieldsValue();
            api({
                method : "put",
                url : cartApi + '/phone',
                data : {
                    phone,
                    pass,
                    phone_only_required : PhoneOnlyRequired(),
                    values : omit(values,"shipping_address.region",'shipping_address.state',
                        "billing_address.region",'billing_address.state',
                    ),
                }
            })
        }
    },1500);
    return <>
        <ContactInformationForm loading={summaryLoadingState.summary}/>
        <Form.Field name={['shipping_group_id']} preserve={true}>
            <div className={'hidden'}/>
        </Form.Field>
        <AddressForm title={'Shipping'}
                     loading={summaryLoadingState.summary || loading}
                     zones={zones}
                     preserve={true}
                     prefix={['shipping_address']}
                     onPhoneChange={onPhoneChanged}
        />
    </>
};
