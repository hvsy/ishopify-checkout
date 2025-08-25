import {FC, ReactNode, useCallback, useRef, useState} from "react";
import Form, {FormInstance} from "rc-field-form";
import {FormContext,} from "../../container/FormContext.ts";
import {isArray as _isArray, get as _get, has as _has, add,startsWith,isEmpty} from "lodash-es";
import {useDebounceCallback} from "usehooks-ts";
import {CheckoutInput, map2, useMutationCheckout} from "../../shopify/context/ShopifyCheckoutContext.tsx";
import {useDeliveryGroupMutation, useSummary} from "../../shopify/checkouts/hooks/useSummary.tsx";
import {EmailRegex} from "@lib/regex.ts";
import {api} from "@lib/api.ts";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {FeatherIcon} from "lucide-react";


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
                    console.log('scroll ele:',ele)
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
    return map2(address,{
        id : 'id',
        city : 'city',
        firstName: 'first_name',
        lastName : 'last_name',
        address1: 'line1',
        address2: 'line2',
        phone: (address : any,key : string) => {
            let phone = address['phone'];
            if(!!phone){
                if(!startsWith(phone,'+')){
                    let prefix =  _get(address,'region.data.phoneNumberPrefix');
                    if(!!prefix){
                        prefix = '+' + prefix;
                    }
                    phone = prefix +phone;
                }
            }
            return phone;
        },
        countryCode: 'region_code',
        provinceCode: 'state_code',
        zip : 'zip',
    },true)
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
        const shippingMethodChanged = _has(changedValues,'shipping_line_id');

        const emailChanged = _has(changedValues,'email');
        if(emailChanged && !!changedValues.email){
            form.setFields([{
                name : ['email'],
                validated :false,
                validating : true,
            }])
        }

        if(!countryChanged && !shippingMethodChanged && !emailChanged){
            return;
        }
        if(countryChanged){
            mutationDeliveryGroups(null);
        }
        const address = buildAddress(values?.shipping_address || {});
        const input : CheckoutInput =  map2(values,{
            email : 'email',
            deliveryHandle : 'shipping_line_id',
            deliveryGroupId : 'shipping_group_id',
        });
        if(countryChanged){
            input.deliveryGroupId = undefined;
            input.deliveryHandle = undefined;
        }
        input.shipping_address = address;
        mutation(input).then((response) => {
            (_get(response,'userErrors',[]) || []).forEach((error : any) => {
                let {field,code,message} = error || {};
                if(!isEmpty(field) && _isArray(field) && field.join('.') === 'buyerIdentity.email'){
                    message = message === 'Email is invalid' ? 'is invalid':message;
                    form.setFields([{
                        name : ['email'],
                        errors : [input.email +' ' + message],
                        validated : true,
                        validating : false,
                        value : _get(response,'cart.buyerIdentity.email'),
                    }]);
                }
            })
            if(emailChanged){
                const email = form.getFieldValue('email');
                if(EmailRegex.test(email)){
                    return checkoutSync()
                }
            }
        }).finally(() => {
            form.setFields([{
                name : ['email'],
                validated : true,
                validating : false,
            }]);
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
                <Form.Field name={'email'} preserve={true}><div className={'hidden'}/></Form.Field>
                <Form.Field name={'shipping_line_id'} preserve={true}><div className={'hidden'}/></Form.Field>
                <Form.Field name={['shipping_address','id']} preserve={true}><div className={'hidden'}/></Form.Field>
                {/*<Form.Field name={['shipping_address','state_code']} preserve={true}><div className={'hidden'}/></Form.Field>*/}
                {/*<Form.Field name={'shipping_line'} preserve={true}><div className={'hidden'}/></Form.Field>*/}
                <Form.Field name={'shipping_insurance'} preserve={true}><div className={'hidden'}/></Form.Field>
                {children}
            </Form>
        </FormContext.Provider>;
};
