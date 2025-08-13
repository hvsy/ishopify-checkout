import {api} from "./api.ts";
import {CheckoutSummary} from "../container/SummaryContext.tsx";
import Big from "big.js";
import { PaymentError } from "../exceptions/PaymentError.ts";
import {omit as _omit,get as _get,startsWith as _startsWith} from "lodash-es";
import {GetCartGid, storefront, transform_address} from "./checkout.ts";
import updateAddressCheckout from "@query/checkouts/mutateShippingAddress.gql?raw";
import cartFields from "@query/checkouts/fragments/cart_fields.gql?raw";

export async function getOrder(token : string,thankYou : boolean = false){
    return await api({
        method : 'get',
        url : thankYou ? `/a/s/api/orders/${token}/thank-you` :
            `/a/s/api/orders/${token}`,
    });
}
export async function update(url : string,values : any,checkout : DB.Checkout){
    const shipping = (values?.shipping_address || checkout.shipping_address) ;
    let prefix = _get(shipping,'region.data.phoneNumberPrefix');
    if(prefix && !_startsWith(prefix,'+')){
        prefix =  `+${prefix}`;
    }
    const phone = _get(shipping,'phone');
    const json = {
        cartId : GetCartGid(),
        id : checkout.shipping_address_id || "gid://shopify/CartSelectableAddress/0",
        create : !checkout.shipping_address_id,
        delivery  : {
            address1 : _get(shipping,'line1'),
            address2 : _get(shipping,'line2'),
            city : _get(shipping,'city'),
            countryCode: _get(shipping,'region_code'),
            firstName: _get(shipping,'first_name'),
            lastName: _get(shipping,'last_name'),
            phone: phone ? (_startsWith(phone,prefix) ? phone: `${prefix}${phone}`) : null,
            provinceCode: _get(shipping,'state_code',null),
            zip : _get(shipping,'zip',null),
        }
    };
    console.log('update original:',checkout,values,json);
    return await storefront(`
        ${updateAddressCheckout}
        ${cartFields}
    `,json).then((response) => {
        const after =transform_address(response,
            checkout.shipping_address_id ? 'data.cartDeliveryAddressesUpdate.cart' : 'data.cartDeliveryAddressesAdd.cart'
        );
        console.log('update checkout:',response,after);
        return after;
    });
    // const data = _omit(values,
    //     'shipping_line',
    //     'shipping_address.state',
    //     'shipping_address.region',
    //     'shipping_address.longitude',
    //     'shipping_address.latitude',
    // );
    // console.log('update:',data);
    // return await api({
    //     method : "put",
    //     url,
    //     data,
    // })
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

