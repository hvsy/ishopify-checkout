import React, {FC,} from "react";
import {Input} from "../../../components/Input.tsx";

import {FormItem} from "@components/fragments/FormItem.tsx";
import {Skeleton} from "@components/ui/Skeleton.tsx";

export type ContactInformationFormProps = {
    loading ?: boolean;
};
import {StepBlock} from "@components/frames/StepBlock.tsx";
import Validators from "validator";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useCurrentForm} from "../../../../container/FormContext.ts";

export const ContactInformationForm: FC<ContactInformationFormProps> = (props) => {
    const {loading = false} = props;
    const form =  useCurrentForm();
    const checkoutSync = useCheckoutSync(form);
    return <StepBlock label={"Contact Information"} name={'contact-information'}>
        {loading ? <Skeleton className={'h-[49px] w-full rounded-lg'}/> : <FormItem name={['email']} rules={[{
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
            <Input id={'email'} placeholder={'Email (For order confirmation)'}
                   type={'email'}
                   className={'overflow-hidden'}
                   onBlur={(event) => {
                       const email = form.getFieldValue('email');
                       if(email && Validators.isEmail(email,{
                           allow_utf8_local_part : false,
                       })){
                           return checkoutSync(true,false);
                       }
                   }}
                   tabIndex={0}
                   autoFocus={true}
                   autoComplete={'shipping email'}
            />
        </FormItem>}
    </StepBlock>
};
