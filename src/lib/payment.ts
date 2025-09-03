import {api} from "./api.ts";
import {CheckoutSummary} from "../container/SummaryContext.tsx";
import Big from "big.js";
import { PaymentError } from "../exceptions/PaymentError.ts";

export async function getOrder(token : string,thankYou : boolean = false){
    return await api({
        method : 'get',
        url : thankYou ? `/a/s/api/orders/${token}/thank-you` :
            `/a/s/api/orders/${token}`,
    });
}

export async function free(url : string){
    return await api({
        method : 'post',
        url : `${url}/free`
    });
}
export async function payment(checkout : DB.Checkout,
                              values: any,url: string,
                              method : DB.PaymentMethod,
                              summary : CheckoutSummary,
                              currency : DB.Currency){
    if(Big(summary.total).cmp(0) === 0){
        window.report?.("add_payment_info",{
            price : '0',
            currency : currency.code,
        },checkout.token +'_add_payment_info');
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
        price : summary.total + '',
        currency : currency.code,
    },checkout.token +  '_add_payment_info');
    if(mode === 'redirect'){
        const target = `${url}/gateway/${method.id}`;
        const res = await api({
            method : "put",
            url: target,
        });
        const href= `/api/transactions/${res}/redirect`;
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

