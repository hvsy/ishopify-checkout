import {FC, ReactNode, useCallback, useEffect, useRef, useState} from "react";
import Form, {FormInstance} from "@rc-component/form";
import {FormContext,} from "../../container/FormContext.ts";
import {merge as _merge, get as _get, has as _has, isArray as _isArray, filter, isEmpty} from "lodash-es";
import {CheckoutInput, map2, useMutationCheckout} from "../../shopify/context/ShopifyCheckoutContext.tsx";
import {useDeliveryGroupMutation,} from "../../shopify/checkouts/hooks/useSummary.tsx";
import {buildAddress} from "@lib/buildAddress.ts";
import {useAsyncQueuer,} from "@tanstack/react-pacer";



export type FormContainerProps = {
    children : ReactNode;
    initialValues ?: any;
    page_style ?: 'standard' | 'single';
    form : FormInstance;
};

export function scrollToError(e : any){
    const first = _get(e,'errorFields.0.name',[]) as any[];
    if(first){
        const path = first.join('][')
        if(path){
            const full = `[${path}]`
            let ele = null;
            if(full === '[email]'){
                ele= document.querySelector(`[data-name="contact-information"]`);
            }else{
                if(( ( window.innerWidth <= 800 ))){
                    ele= document.querySelector(`[name="${full}"]`);
                    // console.log('scroll ele:',ele)
                }else{
                    ele= document.querySelector(`[data-name="shipping-address"]`);
                }
            }
            ele?.scrollIntoView({
                behavior : "smooth",
            })
        }
    }
}

function fillEmptyFields(form : FormInstance, values : any, prefix : (string|number)[] = []){
    if (!values || typeof values !== 'object' || Array.isArray(values)) return;
    Object.entries(values).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return;
        if (['region_code', 'state_code', 'region', 'state'].includes(key)) return;
        const name = [...prefix, key];
        const currentValue = form.getFieldValue(name);
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (currentValue === null || currentValue === undefined || currentValue === '' ||
                (typeof currentValue === 'object' && !Array.isArray(currentValue))) {
                fillEmptyFields(form, value, name);
            }
            return;
        }
        if (currentValue === null || currentValue === undefined || currentValue === '') {
            form.setFieldValue(name, value);
        }
    });
}

export const FormContainer: FC<FormContainerProps> = (props) => {
    const {form,children,initialValues,page_style = 'standard'} = props;
    // const [form] = Form.useForm();
    // const checkout = CheckoutContainer.use()!;
    const [formErrors,setFormErrors] = useState<any>({});
    const formErrorRef = useRef(null);
    formErrorRef.current = formErrors;
    const hydratedRef = useRef(false);
    useEffect(() => {
        if (!initialValues || hydratedRef.current) return;
        hydratedRef.current = true;
        fillEmptyFields(form, initialValues);
    }, [initialValues, form]);
    const error = useCallback((name: string|((string|number)[])) => {
        const path = _isArray(name) ? name.join('.') : name;
        const errors = _get(formErrorRef.current,path);
        if(errors){
            return {
                validateStatus: 'error' as ("" | "error" | "success" | "warning" | "validating" | undefined),
                help: _isArray(errors) ? (errors as []).join("\n") : errors,
            };
        }
        return {};
    },[])
    import.meta.env.DEV && useEffect(() => {
        console.log('listen window message');
        const output = (e : any) => {
            if(e.data === 'form_values'){
                console.log(form.getFieldsValue());
            }
        };
        window.addEventListener('message', output);
        return () => {
            window.removeEventListener('message',output);
        }
    },[]);
    const mutationDeliveryGroups = useDeliveryGroupMutation();
    const sync = useAsyncQueuer(async (changedValues,) => {
        // getFieldsValue(true) 返回 store 里的全部值（含未挂载字段）。
        // 国家/省份是 effect 在表单字段挂载前通过 setFields 写入的，
        // 默认 getFieldsValue() 只返回已注册字段，会读成空导致首次同步失败。
        const values = form.getFieldsValue(true);
        const countryChanged = _has(changedValues,'shipping_address.region_code');
        const provinceChanged = _has(changedValues,'shipping_address.state_code');
        const shippingMethodChanged = _has(changedValues,'shipping_line_id');

        if(!countryChanged && !provinceChanged  && !shippingMethodChanged){
            return;
        }
        if(countryChanged || provinceChanged){
            mutationDeliveryGroups(null);
        }
        // 表单可能在 summary 加载完成前挂载，initialValues 不会自动写入表单；
        // 这里用 initialValues 兜底，保证国家/省份 effect 触发同步时能拿到完整的地址值（含 id）
        const address = buildAddress({
            ...(initialValues?.shipping_address || {}),
            ...(values?.shipping_address || {}),
        });
        const input : CheckoutInput =  map2(values,{
            email : 'email',
            deliveryHandle : 'shipping_line_id',
            deliveryGroupId : 'shipping_group_id',
        });
        if(countryChanged || provinceChanged){
        // if(countryChanged){
            input.deliveryGroupId = undefined;
            input.deliveryHandle = undefined;
        }
        input.shipping_address = address;
        return mutation(input,true,true,values?.context === 'approve');
    },{
        wait : 1000,
        concurrency : 1,
        onSettled : (item, queuer) => {
            // console.log('job settled :',item,queuer);
        }
    });
    const push = ((changedValues : any) => {
        const items =  sync.peekPendingItems();
        const oldItem = items.reverse().reduce((pv : any,cv : any) => {
           return _merge({},pv,cv);
        },{});
        sync.clear();
        const final = _merge(oldItem,changedValues);
        // console.log('push changed values:',changedValues,oldItem,final,items,items.length);
        console.log('push:',final,changedValues);
        sync.addItem(final);
    })
    const mutation = useMutationCheckout();
    const onValuesChanged = useCallback((changedValues : any) => {
        console.log('value changed:',changedValues);
        const path = ['shipping_address.region_code',
            'shipping_address.state_code',
            'shipping_line_id',
        ].filter(function(path){
            return _has(changedValues,path) && !isEmpty(_get(changedValues,path));
        });
        if(path.length > 0){
            push(changedValues);
        }
    },[push]);
    return <FormContext.Provider value={{
            onValuesChanged,
            form,
            error,
            setErrors : setFormErrors,
        }}>
            <Form form={form} initialValues={initialValues}
                  method={'POST'}
                  noValidate
                  validateTrigger={['onBlur','onChange']}
                  // component={false}
                component={'form'}
                  onFieldsChange={(changedFields, allFields) => {
                      // const changed = changedFields.filter((field) => {
                      //     const query = '['+field.name.join('][') + ']';
                      //     return !field.validating && document.activeElement?.getAttribute('name') !== query;
                      // }).map((f) => {
                      //     return {name : f.name,value : f.value};
                      // });
                      // console.log('changed:',changed);
                  }}
                  onValuesChange={onValuesChanged} >
                {!import.meta.env.VITE_SKELETON && <Form.Field name={'email'} preserve={true}><div className={'hidden'}/></Form.Field>}
                {!import.meta.env.VITE_SKELETON && <Form.Field name={'countryCode'} preserve={true}><div className={'hidden'} /></Form.Field>}
                {!import.meta.env.VITE_SKELETON && <Form.Field name={'shipping_line_id'} preserve={true}><div className={'hidden'}/></Form.Field>}
                {!import.meta.env.VITE_SKELETON && <Form.Field name={['shipping_address','id']} preserve={true}><div className={'hidden'}/></Form.Field>}
                {/*<Form.Field name={['shipping_address','state_code']} preserve={true}><div className={'hidden'}/></Form.Field>*/}
                {/*<Form.Field name={'shipping_line'} preserve={true}><div className={'hidden'}/></Form.Field>*/}
                {!import.meta.env.VITE_SKELETON && <Form.Field name={'shipping_insurance'} preserve={true}><div className={'hidden'}/></Form.Field>}
                {children}
            </Form>
        </FormContext.Provider>;
};
