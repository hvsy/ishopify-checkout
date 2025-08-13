import Big from "big.js";
import {PaymentError} from "../../exceptions/PaymentError.ts";
import {api} from "@lib/api.ts";
import {free} from "@lib/payment.ts";
import {get as _get} from "lodash-es";

export function getUrlFrom(token : string){
    const cart_token = token.split('?')[0] ?? '';
    return `/a/s/api/checkouts/${cart_token}`;
}
export async function shopify_payment(options : {
                                          summary : any,
                                          // url : string,
                                          method : DB.PaymentMethod,
                                          values : any,
                                      }){
    const {summary,method,values} = options;
    const token = _get(summary,'id').replace("gid://shopify/Cart/","");
    const url = getUrlFrom(token);
    const totalAmount = _get(summary,'cost.totalAmount');
    const {amount,currencyCode} = totalAmount;
    if(Big(amount).cmp(0) === 0){
        window.report?.("add_payment_info",{
            price : '0',
            currency : currencyCode,
        },token +'_add_payment_info');
        try {
            const res = await free(url);
            if (res.error) {
                throw res.error;
            }
            window.location.href = res.url;
            return true;
        } catch (e) {
            console.log(e);
            throw new PaymentError()
        }
    }
    if(!method) return;
    const mode = method.mode || 'redirect'

    window.report?.("add_payment_info",{
        price : amount + '',
        currency : currencyCode,
    },token +  '_add_payment_info');
    if(mode === 'redirect'){
        const target = `${url}/gateway/${method.id}`;
        const res = await api({
            method : "put",
            url: target,
        });
        const href= `/a/s/api/transactions/${res}/redirect`;
        window.location.href = href;
        return false;
    }else{
        const frame = document.getElementById(method.channel) as HTMLIFrameElement;
        const window = frame?.contentWindow
        if(!window){
            console.log(values,url,method);
            return;
        }
        window.postMessage({
            event : 'submit',
            checkout : values,
        },'*')
        throw "!!!";
    }
}
