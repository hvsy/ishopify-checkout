import React, {FC,} from "react";
import {Input} from "../../../components/Input.tsx";

import {EmailRegex} from "@lib/regex.ts";
import {FormItem} from "@components/fragments/FormItem.tsx";

export type ContactInformationFormProps = {};
import {StepBlock} from "@components/frames/StepBlock.tsx";
import {useFormError} from "../../../../container/FormContext.ts";
import Validators from "validator";

export const ContactInformationForm: FC<ContactInformationFormProps> = (props) => {
    const error = useFormError();
    return <StepBlock label={"Contact Information"} name={'contact-information'}>
        <FormItem name={['email']} rules={[{
            async validator(rule, value) {
                if(!value || !Validators.isEmail(value)){
                    throw new Error("Please enter a valid email");
                }
                // if (!EmailRegex.test(value)) {
                //     throw new Error("Please enter a valid email");
                // }
            }
        }]} {...error('email')}>
            <Input placeholder={'Email (For order confirmation)'}
                   autoFocus
                   autoComplete={'shipping email'}
            />
        </FormItem>
    </StepBlock>
};
