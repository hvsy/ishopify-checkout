import {FC, ReactNode, useCallback, useRef, useState} from "react";
import Form, {FormInstance} from "rc-field-form";
import {FormContext,} from "../../container/FormContext.ts";
import {merge as _merge, get as _get, has as _has, isArray as _isArray, filter, isEmpty} from "lodash-es";
import {CheckoutInput, map2, useMutationCheckout} from "../../shopify/context/ShopifyCheckoutContext.tsx";
import {useDeliveryGroupMutation, useSummary} from "../../shopify/checkouts/hooks/useSummary.tsx";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import Validators from "validator";
import {buildAddress} from "@lib/buildAddress.ts";
import {useAsyncQueuer,} from "@tanstack/react-pacer";
import {useDebounceCallback} from "usehooks-ts";



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





export const FormContainer: FC<FormContainerProps> = (props) => {
    const {form,children,initialValues,page_style = 'standard'} = props;
    // const [form] = Form.useForm();
    // const checkout = CheckoutContainer.use()!;
    const [formErrors,setFormErrors] = useState<any>({});
    const formErrorRef = useRef(null);
    formErrorRef.current = formErrors;
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
    const mutationDeliveryGroups = useDeliveryGroupMutation();
    const sync = useAsyncQueuer(async (changedValues,) => {
        const values = form.getFieldsValue();
        const countryChanged = _has(changedValues,'shipping_address.region_code');
        const provinceChanged = _has(changedValues,'shipping_address.state_code');
        const shippingMethodChanged = _has(changedValues,'shipping_line_id');

        if(!countryChanged && !provinceChanged  && !shippingMethodChanged){
            return;
        }
        // if(countryChanged){
        if(countryChanged || provinceChanged){
            mutationDeliveryGroups(null);
        }
        const address = buildAddress(values?.shipping_address || {});
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
        sync.addItem(final);
    })
    const mutation = useMutationCheckout();
    const onValuesChanged = useCallback((changedValues : any) => {
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
