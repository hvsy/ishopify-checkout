import {getFinalPath} from "@lib/api.ts";
import {get as _get,} from "lodash-es";
import {Dispatch, SetStateAction} from "react";
import {Bus} from "../../bus.tsx";
import {summary2Cart} from "./helper.ts";
import Big from "big.js";
import {reportPaymentProgress} from "../../container/PaymentContext.tsx";

export function getUrlFrom(token : string){
    const cart_token = token.split('?')[0] ?? '';
    return getFinalPath(`/api/checkouts/${cart_token}`);
}
export async function shopify_payment(options : {
                                          summary : any,
                                          // url : string,
                                          method : DB.PaymentMethod,
                                          values : any,
                                      }){
    const {summary,method,values} = options;
    const token = _get(summary,'id').replace("gid://shopify/Cart/","");
    const totalAmount = _get(summary,'cost.totalAmount');
    const handle=  _get(summary,'deliveryGroups.edges.0.node.selectedDeliveryOption.handle');
    import.meta.env.DEV && console.log('shipping handle:',handle);
    if(!handle){
        reportPaymentProgress(() => {
            return ('Please select the delivery method.');
        });
        alert('Please select the delivery method.');
        throw "please choice delivery shipping line";
    }
    const {amount,currencyCode} = totalAmount;
    if(Big(amount).cmp(0) === 0){
        return;
    }
    if(!method){
        reportPaymentProgress(() => {
            return "not payment method";
        });
        return;
    }
    window.report?.("add_payment_info",{
        price : amount + '',
        currency : currencyCode,
        cart : summary2Cart(summary),
        email:values.email,
        shipping_address : values.shipping_address,
        billing_address : values.billing_address || values.shipping_address,
    },token +  '_add_payment_info');
    await Bus.emitAsync(`payment:${method.id}`,{values,});
}
