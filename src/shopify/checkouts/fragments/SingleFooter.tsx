import {FC} from "react";
import {FooterFrame} from "@components/frames/FooterFrame.tsx";
import {useCurrentForm} from "../../../container/FormContext.ts";
import {submit} from "@components/frames/FormContainer.tsx";
import {useSummary} from "../hooks/useSummary.tsx";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {shopify_payment} from "../../lib/payment.ts";
import {usePaymentMethod} from "../../../container/PaymentContext.tsx";
import {useMutationCheckout} from "../../context/ShopifyCheckoutContext.tsx";
import {get as _get, isArray as _isArray, isEmpty} from "lodash-es";

export type SingleFooterProps = {};

export const SingleFooter: FC<SingleFooterProps> = (props) => {
    const {} = props;
    const form = useCurrentForm();
    const {ing} = useSummary();
    const sync = useCheckoutSync();
    const method = usePaymentMethod();
    const mutation = useMutationCheckout();
    return <FooterFrame
        back={{
            to : '/cart',
            reload : true,
            label : 'Cart',
        }}

        next={{
            label : 'Payment',
            pulsing : ing,
            async onClick() {
                const values =await submit(form);
                if(!values){
                    return;
                }
                values.validationStrategy = 'STRICT';
                const response = await mutation(values);
                const errors = _get(response,'userErrors',[]) || [];
                const fields = (errors).map((error : any) => {
                    let {field,code,message} = error || {};
                    if(!isEmpty(field) && _isArray(field)){
                        const path = field.join('.');
                        switch(path){
                            case 'buyerIdentity.email':{
                                message = message === 'Email is invalid' ? 'is invalid':message;
                                return ({
                                    name : ['email'],
                                    errors : [values.email +' ' + message],
                                    validated : true,
                                    validating : false,
                                    value : _get(response,'cart.buyerIdentity.email'),
                                });
                            }
                            break;
                            case 'addresses.0.address.deliveryAddress.phone':{
                                return ({
                                    name : ['shipping_address','phone'],
                                    errors : [message],
                                    validated : true,
                                    validating : false,
                                });
                            }
                        }
                    }
                    return null;
                }).filter(Boolean);
                if(fields.length > 0){
                    form.setFields(fields);
                }
                if(errors.length > 0){
                    return;
                }
                const  {request : data} = (await sync()) || {};
                const result = await shopify_payment({
                    summary : data,
                    values,
                    method : method!,
                })
                console.log(result,values);
            }
        }}
    />;
};
