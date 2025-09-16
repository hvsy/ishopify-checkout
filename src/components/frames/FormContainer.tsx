import {FC, ReactNode, useCallback, useRef, useState} from "react";
import Form, {FormInstance} from "rc-field-form";
import {FormContext,} from "../../container/FormContext.ts";
import {isArray as _isArray, get as _get, has as _has, add,startsWith,isEmpty} from "lodash-es";
import {useDebounceCallback} from "usehooks-ts";
import {CheckoutInput, map2, useMutationCheckout} from "../../shopify/context/ShopifyCheckoutContext.tsx";
import {useDeliveryGroupMutation, useSummary} from "../../shopify/checkouts/hooks/useSummary.tsx";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import Validators from "validator";


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

export async function submit(form : FormInstance){
    try {
        if(form.isFieldsValidating(['email'])){
            return null;
        }
        const values =  await form.validateFields();
        const address = buildAddress(values?.shipping_address || {});
        const input : CheckoutInput =  map2(values,{
            email : 'email',
            deliveryHandle : 'shipping_line_id',
            deliveryGroupId : 'shipping_group_id',
        });
        input.shipping_address = address;
        return input;
    } catch (e) {
        scrollToError(e);
        return null;
    }
}


function buildAddress(address : any){
    const after = map2(address,{
        id : 'id',
        city : 'city',
        firstName: 'first_name',
        lastName : 'last_name',
        address1: 'line1',
        address2: 'line2',
        phone : 'phone',
        countryCode: 'region_code',
        provinceCode: 'state_code',
        zip : 'zip',
    },true)
    if(!Validators.isMobilePhone(after.phone || '',"any",{
        strictMode : true,
    })){
        after.phone = "";
    }
    return after;
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
    const {setSelectedDeliveryStatus} = useSummary();
    const mutationDeliveryGroups = useDeliveryGroupMutation();
    const checkoutSync = useCheckoutSync(form);
    const sync = useDebounceCallback(async (changedValues,) => {
        const values = form.getFieldsValue();
        const countryChanged = _has(changedValues,'shipping_address.region_code');
        const provinceChanged = _has(changedValues,'shipping_address.state_code');
        const shippingMethodChanged = _has(changedValues,'shipping_line_id');
        // console.log('cv:',changedValues);

        const emailChanged = _has(changedValues,'email');
        if(emailChanged && !!changedValues.email){
                const email = form.getFieldValue('email');
                if(Validators.isEmail(email)){
                    return checkoutSync()
                }
            // form.setFields([{
            //     name : ['email'],
            //     validated :false,
            //     validating : true,
            // }])
        }

        // if(!countryChanged && !provinceChanged  && !shippingMethodChanged && !emailChanged){
        if(!countryChanged && !provinceChanged  && !shippingMethodChanged && !emailChanged){
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
        mutation(input).then((response) => {

        }).finally(() => {
            if(!!form.getFieldValue(['shipping_address','phone'])){
                form.validateFields([
                    ['shipping_address','phone']
                ]);
            }
            setSelectedDeliveryStatus?.(false);
        });
        //TODO 单页模式同步数据
        // console.log('sync:',values);
    },500,{
        trailing: true,
    });
    const mutation = useMutationCheckout();
    return <FormContext.Provider value={{
            onValuesChanged : (changed)=>{
                if(_has(changed,'shipping_line_id')){
                    // console.log('set shipping line updating');
                    setSelectedDeliveryStatus?.(true);
                }
                sync(changed, );
            },
            form,
            error,
            setErrors : setFormErrors,
        }}>
            <Form form={form} initialValues={initialValues}
                  method={'POST'}
                  noValidate
                  // component={false}
                component={'form'}
                  onValuesChange={(changedValues) => {
                      if(_has(changedValues,'shipping_line_id')){
                          // console.log('set shipping line updating');
                          setSelectedDeliveryStatus?.(true);
                      }
                      sync(changedValues);
                  }} >
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
