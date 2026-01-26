import {FC} from "react";
import {useCurrentForm} from "../../../../container/FormContext.ts";
import Form from "rc-field-form";
import {FormItem} from "@components/fragments/FormItem.tsx";
import {Input} from "../../../../page/components/Input.tsx";
import {StepFrame} from "@components/frames/StepFrame.tsx";
import { cpf } from 'cpf-cnpj-validator';

const names : any = {
    BR : {
        key : 'SHIPPING_CREDENTIAL_BR',
        label : 'CPF/CNPJ',
        async validate(value : string){
            if(!cpf.isValid(value)){
                throw new Error("Enter a valid CPF/CNPJ");
            }
        }
    },
    KR : {
        key : 'SHIPPING_CREDENTIAL_KR',
        label : "Personal Customs Code",
    },
}
export const LocalizedFieldsStep  :FC<any> = () => {
    const form = useCurrentForm();
    const region_code = Form.useWatch(['shipping_address',"region_code"],form) as string;
    if(!['BR','KR'].includes(region_code?.toUpperCase())){
        return null;
    }
    const field = names[region_code];
    return <StepFrame title={'Additional information'}>
        <FormItem name={['localization',field.key]} rules={[{
            required : true,
            message :`Enter a valid ${field.label}`,
            async validator(rules,v){
                const value = v?.toString() || '';
                if(!value){
                    throw new Error(`Enter a valid ${field.label}`);
                }
                const vr = field.validate;
                if(vr){
                    await vr(v);
                }
            }
        }]}>
            <Input placeholder={field.label}/>
        </FormItem>
    </StepFrame>
}
