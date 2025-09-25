import Big from "big.js";
import {PaymentError} from "../../exceptions/PaymentError.ts";
import {api} from "@lib/api.ts";
import {free} from "@lib/payment.ts";
import {get as _get,} from "lodash-es";

export function getUrlFrom(token : string){
    const cart_token = token.split('?')[0] ?? '';
    return `/a/s/api/checkouts/${cart_token}`;
}
export function PromiseLocation(location : string){
    return new Promise((resolve, reject) => {
        setTimeout(reject,15000);
        window.location.href = location;
    });
}
function summary2Cart(summary : any){
    const lines = _get(summary,'lines.edges').map((edge:any) => {
        const node = edge.node;
        const merchandise = node.merchandise;
        const product = merchandise.product;
        return {
            id : merchandise.id.replace(/gid:\/\/shopify\/[^/]+\//ig,''),
            title : [product.title,merchandise.title].filter(Boolean).join(' '),
            sku : merchandise.sku,
            barcode : merchandise.sku,
            price : merchandise.price,
            cost : node.cost,
            quantity : node.quantity,
        }
    });
    return lines;
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
            cart : summary2Cart(summary),
            email:values.email,
            shipping_address : values.shipping_address,
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
    // console.log('payment:',values,summary2Cart(summary));//lines.edges[0].node);
    window.report?.("add_payment_info",{
        price : amount + '',
        currency : currencyCode,
        cart : summary2Cart(summary),
        email:values.email,
        shipping_address : values.shipping_address,
    },token +  '_add_payment_info');
    if(mode === 'redirect'){
        const target = `${url}/gateway/${method.id}`;
        const res = await api({
            method : "put",
            url: target,
        });
        const href= `/a/s/api/transactions/${res}/redirect`;
        return PromiseLocation(href);
        // window.location.href = href;
        // return false;
    }else{
        const frame = document.getElementById(method.channel) as HTMLIFrameElement;
        const window = frame?.contentWindow
        if(!window){
            console.log(values,url,method);
            return;
        }
        console.log('payment method submit:',values);
        window.postMessage({
            event : 'submit',
            checkout : values,
        },'*')
        throw "!!!";
    }
}
