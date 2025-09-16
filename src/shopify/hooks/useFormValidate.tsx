import {useCurrentForm} from "../../container/FormContext.ts";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useMutationCheckout} from "../context/ShopifyCheckoutContext.tsx";
import {useRef} from "react";
import {submit} from "@components/frames/FormContainer.tsx";
import {get as _get, isArray, isEmpty, isEqual} from "lodash-es";

export function useFormValidate(){
    const form = useCurrentForm();
    const sync = useCheckoutSync();
    const mutation = useMutationCheckout();
    const last = useRef<any>(null);
    return async() => {
        const values =await submit(form);
        if(!values){
            return;
        }
        values.validationStrategy = 'STRICT';
        let needMutate = !last.current || !isEqual(last.current,values);
        import.meta.env.DEV  && console.log('need update remote checkout');
        if(needMutate){
            const response = await mutation(values,false);
            import.meta.env.DEV && console.log('mutate response',response);
            const errors = _get(response,'userErrors',[]) || [];
            const fields = (errors).map((error : any) => {
                let {field,code,message} = error || {};
                if(!isEmpty(field) && isArray(field)){
                    const path = field.join('.');
                    const maps  : any= {
                        'buyerIdentity.email'  : {
                            path : ['email'],
                            callback(msg : string,res : any,vs : any){
                                let ms = msg === 'Email is invalid' ? 'is invalid':msg;
                                return {
                                    errors : [vs.email +' ' + ms],
                                    value : _get(res ,'cart.buyerIdentity.email')
                                }
                            },
                        },
                        'addresses.0.address.deliveryAddress.phone' :{
                            path : ['shipping_address','phone'],
                        },
                        'addresses.0.address.deliveryAddress.zip' :{
                            path : ['shipping_address','zip'],
                        }
                    };
                    const hit = maps[path] || false;
                    if(hit){
                        const after = hit.callback ? hit.callback(message,response,values) : {};
                        return {
                            name : hit.path,
                            validated : true,
                            validating: false,
                            errors : [message],
                            ...after,
                        }
                    }
                }
                return null;
            }).filter(Boolean);

            if(fields.length > 0){
                form.setFields(fields);
            }
            if(errors.length > 0 || fields.length > 0){
                return false;
            }
            last.current = {
                ...values,
            };
        }
        const  {request : data} = (await sync()) || {};
        return {values,data};
    };
}
