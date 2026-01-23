import {FC, } from "react";
import {ContactInformationForm} from "../../forms/ContactInformationForm.tsx";
import {AddressForm} from "../../forms/AddressForm.tsx";
import Form from "rc-field-form";
import {useShippingZones} from "../../../../../container/PaymentContext.tsx";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {api} from "@lib/api.ts";
import {useDebounceCallback} from "usehooks-ts";
import {useCurrentForm} from "../../../../../container/FormContext.ts";
import {omit} from "lodash-es";

export type ContactInformationStepProps = {
};

export const ContactInformationStep:FC<ContactInformationStepProps>
    = (props) => {
    const {zones,loading} = useShippingZones();
    const storage = useCartStorage();
    const form = useCurrentForm();
    const onPhoneChanged = useDebounceCallback((phone : string,pass : boolean) => {
        const values = form.getFieldsValue();

        api({
            method : "put",
            url : storage.api + '/phone',
            data : {
                phone,
                pass,
                values : omit(values,"shipping_address.region",'shipping_address.state'),
            }
        })
    },1500);
    return <>
        <ContactInformationForm/>
        <Form.Field name={['shipping_group_id']} preserve={true}>
            <div className={'hidden'}/>
        </Form.Field>
        <AddressForm title={'Shipping'}
                     loading={loading}
                     zones={zones}
                     preserve={true}
                     prefix={['shipping_address']}
                     onPhoneChange={onPhoneChanged}
        />
    </>
};
