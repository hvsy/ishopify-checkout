import {FC, useEffect} from "react";
import {ContactInformationForm} from "../../forms/ContactInformationForm.tsx";
import {AddressForm} from "../../forms/AddressForm.tsx";
import {useCurrentForm} from "../../../../../container/FormContext.ts";
import {useWatch} from "rc-field-form";

export type ContactInformationStepProps = {
};

export const ContactInformationStep:FC<ContactInformationStepProps>
    = (props) => {

    return <>
        <ContactInformationForm/>
        <AddressForm title={'Shipping'}
                     prefix={['shipping_address']}
        />
    </>
};
