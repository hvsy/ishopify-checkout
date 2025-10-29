import {FC, } from "react";
import {ContactInformationForm} from "../../forms/ContactInformationForm.tsx";
import {AddressForm} from "../../forms/AddressForm.tsx";
import Form from "rc-field-form";
import {useShippingZones} from "../../../../../container/PaymentContext.tsx";

export type ContactInformationStepProps = {
};

export const ContactInformationStep:FC<ContactInformationStepProps>
    = (props) => {
    const {zones,loading} = useShippingZones();
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
        />
    </>
};
