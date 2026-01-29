import {useCurrentForm} from "../../container/FormContext.ts";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {
    CheckoutInput,
    map2,
    useMutationCheckout,
    useShopifyCheckoutLoading
} from "../context/ShopifyCheckoutContext.tsx";
import {useRef} from "react";
import {scrollToError} from "@components/frames/FormContainer.tsx";
import {get as _get, isArray, isEmpty, isEqual, isObjectLike, uniq} from "lodash-es";
import {produce} from "@lib/api.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {FormInstance} from "rc-field-form";
import {buildAddress} from "@lib/buildAddress.ts";
import {useSummary} from "../checkouts/hooks/useSummary.tsx";
import {Features} from "@lib/flags.ts";

function formatFormValues(values : any,validate_phone : boolean = true){
    const address = buildAddress(values?.shipping_address || {},validate_phone);
    const input : CheckoutInput =  map2(values,{
        email : 'email',
        deliveryHandle : 'shipping_line_id',
        deliveryGroupId : 'shipping_group_id',
    });
    input.shipping_address = address;
    return input;
}
async function submit(form : FormInstance,validate_phone : boolean = true){
    if(form.isFieldsValidating(['email'])){
        throw ({
            "errorFields" : [
                {
                    name : ["email"]
                }
            ]
        });
    }
    try{
        const values =  await form.validateFields();
        import.meta.env.DEV && console.log('form validate values:',values);
        return formatFormValues(values,validate_phone);
    }catch(e){
        import.meta.env.DEV &&  console.log('after validate:',e);
        throw e;
    }
}
const isPhone2 = Features.includes('phone2');
export function useFormValidate() {
    const form = useCurrentForm();
    const sync = useCheckoutSync();
    const mutation = useMutationCheckout();
    const cart = useCartStorage();
    const last = useRef<any>(null);
    const {loading,groups,refetchDeliveryGroup} = useSummary();
    const checkoutLoading = useShopifyCheckoutLoading();
    return async (keepBuyerCountryCode  : boolean = false) => {
        try {

            const values = await submit(form);
            values.validationStrategy = 'STRICT';
            let needMutate = !last.current || !isEqual(last.current, values);
            import.meta.env.DEV && console.log('need update remote checkout');
            if (needMutate) {
                const response = await mutation(values, false,false,keepBuyerCountryCode);
                import.meta.env.DEV && console.log('mutate response', response);
                const errors = _get(response, 'userErrors', []) || [];
                const fields = (errors).map((error: any) => {
                    let {field, code, message} = error || {};
                    if (!isEmpty(field) && isArray(field)) {
                        const path = field.join('.');
                        const maps: any = {
                            'buyerIdentity.email': {
                                path: ['email'],
                                callback(msg: string, res: any, vs: any) {
                                    let ms = msg === 'Email is invalid' ? 'is invalid' : msg;
                                    return {
                                        errors: [vs.email + ' ' + ms],
                                        value: _get(res, 'cart.buyerIdentity.email')
                                    }
                                },
                            },
                            'addresses.0.address.deliveryAddress.phone': {
                                path: ['shipping_address', isPhone2 ? 'phone2' : 'phone'],
                            },
                            'addresses.0.address.deliveryAddress.zip': {
                                path: ['shipping_address', 'zip'],
                            }
                        };
                        const hit = maps[path] || false;
                        if (hit) {
                            const after = hit.callback ? hit.callback(message, response, values) : {};
                            return {
                                name: hit.path,
                                validated: true,
                                validating: false,
                                errors: [message],
                                ...after,
                            }
                        }
                    }
                    return null;
                }).filter(Boolean);

                if (fields.length > 0) {
                    form.setFields(fields);
                }
                if (errors.length > 0 || fields.length > 0) {
                    produce(cart.token,"shopify_validate",{
                        errors,fields,values,
                        context : form.getFieldValue('context'),
                        summary_loading : loading.summary,
                        shipping_methods_loading : loading?.shipping_methods,
                        checkout_loading : checkoutLoading,
                        shipping_methods : _get(groups,'0.deliveryOptions',null),
                    }).catch();
                    try {
                        scrollToError({
                            errorFields: fields,
                        });
                    } catch (e) {
                    }
                    return false;
                }
                last.current = {
                    ...values,
                };
            }
            const {request: data} = (await sync()) || {};
            return {
                values: {
                    ...values,
                    billing_address : data?.billing_address || null,
                }, data
            };
        } catch (e : any) {
            if(isObjectLike(e) && e.hasOwnProperty('errorFields')){
                let forceUpdateShippingLine = false;
                let options = _get(groups,'0.deliveryOptions',null);
                let needForce = !loading.summary && !loading?.shipping_methods && !checkoutLoading &&
                    isEmpty(options);
                const errorLength = e.errorFields.length;
                const errorName = (e.errorFields?.[0]?.name||[]).join('.');
                if(errorLength === 1 &&  errorName ==='shipping_line_id'
                    &&needForce
                ){
                    forceUpdateShippingLine = true;
                    refetchDeliveryGroup?.()
                }
                produce(cart.token,"form_validate",{
                    values : {
                        ...formatFormValues(e.values,false),
                        context : e.values?.context || null,
                        summary_loading : loading.summary,
                        shipping_methods_loading : loading?.shipping_methods,
                        checkout_loading : checkoutLoading,
                        shipping_methods : _get(groups,'0.deliveryOptions',null),
                        errorLength,
                        errorName,
                        need_force : needForce,
                        force_fetch_delivery_group : forceUpdateShippingLine,
                        options,
                    },
                    errors : e.errorFields,
                }).catch()
            }else{
                produce(cart.token,'form_validate',e).catch();
            }
            scrollToError(e);
            return null;
        }

    };
}
