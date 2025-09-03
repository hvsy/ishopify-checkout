import {FC, memo, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {useCurrentForm} from "../../../../../container/FormContext.ts";
import Form from "rc-field-form";
import {usePaymentContext} from "../../../../../container/PaymentContext.tsx";
import {find as _find} from "lodash-es";
import {RadioGroup} from "../../../../components/RadioGroup.tsx";
import {Payment} from "./Payment.tsx";
import {NoActivePaymentMethod} from "./NoActivePaymentMethod.tsx";

export const Methods: FC<{ token: string }> = memo((props) => {
    const {token} = props;
    const [search, setSearchParams] = useSearchParams();
    // const {data: methods,isLoading} = useSWR<DB.PaymentMethod[]>(('/a/s/api/payments'));
    const {methods,loading : isLoading} = usePaymentContext() || {};
    const form = useCurrentForm();
    const method_id = Form.useWatch(['payment_method_id'], {
        form,
    });
    const ctx = usePaymentContext();
    useEffect(() => {
        if (!method_id) {
            const first = methods?.[0]?.id;
            if (!!first) {
                form.setFieldValue('payment_method_id', first);
            }
        }
        const method = _find(methods, m => m.id === method_id);
        ctx?.setMethod(method || null);
    }, [method_id, methods]);
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
                return <Payment
                    token={token}
                    method={method} checked={checked}>
                    {radio}
                </Payment>
            }}
        />
    </Form.Field>
});
