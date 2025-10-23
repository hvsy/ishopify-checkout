import {FC, useEffect} from "react";
import {ContactInformationForm} from "../../forms/ContactInformationForm.tsx";
import {AddressForm} from "../../forms/AddressForm.tsx";
import {useCurrentForm} from "../../../../../container/FormContext.ts";
import {useWatch} from "rc-field-form";
import Form from "rc-field-form";

export type ContactInformationStepProps = {
};

export const ContactInformationStep:FC<ContactInformationStepProps>
    = (props) => {
    return <>
        <ContactInformationForm/>
        <Form.Field name={['shipping_group_id']} preserve={true}>
            <div className={'hidden'}/>
        </Form.Field>
        <AddressForm title={'Shipping'}
                     preserve={true}
                     prefix={['shipping_address']}
        />
    </>
};
