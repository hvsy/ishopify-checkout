import React, {FC,} from "react";
import {Input} from "../../../components/Input.tsx";

import {FormItem} from "@components/fragments/FormItem.tsx";

export type ContactInformationFormProps = {};
import {StepBlock} from "@components/frames/StepBlock.tsx";
import Validators from "validator";

export const ContactInformationForm: FC<ContactInformationFormProps> = (props) => {
    return <StepBlock label={"Contact Information"} name={'contact-information'}>
        <FormItem name={['email']} rules={[{
            async validator(rule, value) {
                if(!value || !Validators.isEmail(value,{
                    allow_utf8_local_part : false,
                })){
                    throw new Error("Please enter a valid email");
                }
                // if (!EmailRegex.test(value)) {
                //     throw new Error("Please enter a valid email");
                // }
            }
        }]}>
            <Input placeholder={'Email (For order confirmation)'}
                   tabIndex={0}
                   autoFocus={true}
                   autoComplete={'shipping email'}
            />
        </FormItem>
    </StepBlock>
};
