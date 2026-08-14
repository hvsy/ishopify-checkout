import {FC, useEffect, useEffectEvent, useMemo, useRef, useState} from "react";
import {usePaypalCardFields} from "./hooks/usePaypalCardFields.tsx";
import {PaypalField} from "./fragments/PaypalField.tsx";
import {capitalize} from "lodash-es";
import {useEventCallback} from "usehooks-ts";
import {Bus} from "../bus.tsx";
import {Loading} from "@components/fragments/Loading.tsx";
import {Features} from "@lib/flags.ts";

export type PaypalCardProps = {
    method : any;
};


export function error_tip(value : any,field : string,validated : boolean){
    if(value === true) return null;
    if(value === null) {
        if(validated){
            return field + ' is empty';
        }
        return null;
    }
    if(value === false){
        return 'Invalid ' + field;
    }
    return null;
}
const PaypalCardForm : FC<any> = (props : any) => {
    const {fields} = props;
    const [errors,setErrors] = useState<any>({
        number : null,
        expiry : null,
        cvv : null,
    });
    const [validated,setValidated] = useState(false);
    const validate = useEventCallback(async () => {
        setValidated(true);
        const keys = Object.keys(errors);
        for(let i =0; i < keys.length; ++ i){
            const error = errors[keys[i]];
            if(error !== true){
                const message = error === null ? ' is empty' : 'is invalid';
                throw `Paypal Card ${keys[i]} ${message}`;
            }
        }
        return true;
    });

    useEffect(() => {
        return Bus.listen('payment:validate',validate);
    }, []);
    const onInputChange = useEffectEvent((data : any) => {
        const which = data.emittedBy;
        const key = `card${capitalize(which)}Field`;
        const isValid = !!data.fields?.[key]?.isValid;
        setErrors((e : any) => {
            return {
                ...e,
                [which]: isValid
            }
        })
    });

    return <div className={'min-h-32 py-2'} id={'paypal-card-container'} >
        {Features.includes('paypal_card_name') && <PaypalField fields={fields} id={'Name'}
                     onInputChange={onInputChange}
                     placeholder={'Cardholder Name (optional)'} field={'Name'}
                     error={error_tip(errors['name'],'Name',validated)}
                     config={{
                         maskInput: false,
                     }}
        />}
        <PaypalField fields={fields} id={'number'}
                     onInputChange={onInputChange}
                     placeholder={'Card Number'} field={'Number'}
                     error={error_tip(errors['number'],'Card Number',validated)}
                     config={{
                         maskInput: false,
                     }}
        />
        <div className={'flex flex-col sm:space-x-3 sm:flex-row'}>
            <PaypalField id="expired" className={'flex-1'}
                         onInputChange={onInputChange}
                         error={error_tip(errors['expiry'],'Expired Date',validated)}
                         placeholder={'MM/YY'}
                         fields={fields}
                         field={'Expiry'}

            />
            <PaypalField id="cvv" className={'flex-1'}
                         error={error_tip(errors['cvv'],'CVV',validated)}
                         onInputChange={onInputChange}
                         placeholder={'CVV'}
                         fields={fields}
                         field={'CVV'}

            />
        </div>
    </div>;
}

export const PaypalCard: FC<PaypalCardProps> = (props) => {
    const {method} = props;
    const {fields: cardFields, status} = usePaypalCardFields(method.id,method.sdk);
    // SDK 加载失败，或 SDK ready 但 CardFields 初始化失败：给出明确错误，避免无限转圈。
    if (status === 'error' || (status === 'ready' && !cardFields)) {
        return <div className={'min-h-32 py-2 flex-col justify-center items-center flex text-sm text-red-500'} id={'paypal-card-container'}>
            PayPal Card is currently unavailable. Please try again or choose another payment method.
        </div>;
    }
    if (status === 'ready') {
        // SDK 已就绪但当前设备/环境不符合 CardFields 条件：显示不可用而不是一直 loading。
        if (!cardFields?.isEligible()) {
            return <div className={'min-h-32 py-2 flex-col justify-center items-center flex text-sm text-gray-500'} id={'paypal-card-container'}>
                PayPal Card is not available for this device or browser.
            </div>;
        }
        return <PaypalCardForm fields={cardFields}/>;
    }
    return <div className={'min-h-32 py-2 flex-col justify-center items-center flex'} id={'paypal-card-container'} >
        <Loading />
    </div>;
};
