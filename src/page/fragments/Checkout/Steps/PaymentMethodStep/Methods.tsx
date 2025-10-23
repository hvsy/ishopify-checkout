import {FC, memo, useEffect, Activity, ActivityProps} from "react";
import {useSearchParams} from "react-router-dom";
import {useCurrentForm} from "../../../../../container/FormContext.ts";
import Form from "rc-field-form";
import {usePaymentContext} from "../../../../../container/PaymentContext.tsx";
import {find as _find} from "lodash-es";
import {RadioGroup} from "../../../../components/RadioGroup.tsx";
import {Payment} from "./Payment.tsx";
import {NoActivePaymentMethod} from "./NoActivePaymentMethod.tsx";
import PaypalCountries from "../../../../../assets/paypal_countries.json";

function show(method : DB.PaymentMethod,region_code ?: string|null){
    if(!method) return false;
    if(method.type !== 'paypal') return true;
    return !(!!region_code && !PaypalCountries.includes(region_code));

}
export const Methods: FC<{ token: string }> = memo((props) => {
    const {token} = props;
    const [search, setSearchParams] = useSearchParams();

    // const {data: methods,isLoading} = useSWR<DB.PaymentMethod[]>(('/a/s/api/payments'));
    let {methods,loading : isLoading} = usePaymentContext() || {};

    const form = useCurrentForm();
    const method_id = Form.useWatch(['payment_method_id'], {
        form,
    });
    const region_code = Form.useWatch(['shipping_address','region_code'],{
        form,
    })

    const ctx = usePaymentContext();
    //默认选中第一个


    useEffect(() => {
        const after = (methods||[]).filter((method) => {
            return show(method,region_code);
        });
        if (!method_id) {
            const first = after?.[0]?.id;
            if (!!first) {
                form.setFieldValue('payment_method_id', first);
            }
        }else{
            const method = _find(after, m => m.id === method_id);
            ctx?.setMethod(method || (methods?.[0] || null));
            if(!method){
                form.setFieldValue('payment_method_id',null);
            }else{
                ctx?.setMethod(method);
            }
        }
    }, [method_id,methods,region_code]);

    if(isLoading){
        return <div className={'animate-pulse border rounded-md border-neutral-300 flex flex-row items-center  space-x-3 p-4'}>
            <div className={'size-4 rounded-full bg-slate-200'}></div>
            <div className={'flex-1 bg-slate-200 h-3 rounded-xl'}></div>
        </div>;
    }
    return <Form.Field name={['payment_method_id']}>
        <RadioGroup
            items={methods}
            valueAttr={'id'}
            onSelectedChange={() => {
                if (search.get('error')) {
                    const newSearch = new URLSearchParams(search);
                    newSearch.delete('error')
                    setSearchParams(newSearch);
                }
            }}
            renderEmpty={() => {
                return <NoActivePaymentMethod />
            }}
            renderItem={(method, checked, radio) => {
                // console.log('render method item',method,checked,radio);
                let mode : ActivityProps['mode'] =  show(method,region_code) ? 'visible' : 'hidden';
                return <Activity mode={mode}>
                    <Payment
                        token={token}
                        method={method} checked={checked}>
                        {radio}
                    </Payment>
                </Activity>
            }}
        />
    </Form.Field>
});
