import {useScript} from "usehooks-ts";
import {useEffect, useMemo, useRef, useState} from "react";
import {Bus, useBusListener} from "../../bus.tsx";
import {PromiseLocation} from "../../shopify/lib/payment.ts";
import {api, getFinalPath} from "@lib/api.ts";
import {get,isEmpty} from "lodash-es";

const map : any = {
    'addressLine1' : 'address1',
    'addressLine2' : 'address2',
    'postalCode' : 'zip',
    'adminArea1': 'provinceCode',
    'adminArea2' : 'city',
    'countryCode' : 'countryCode',
};
export function usePaypalCardScript(id:string){
    const [status,setStatus] = useState('idle');
    useEffect(() => {
        const setStateFromEvent = (event: Event) => {
            const newStatus = event.type === 'load' ? 'ready' : 'error'
            setStatus(newStatus)
        }
        const script = document.getElementById(id)
        if(script){
            script.addEventListener('load', setStateFromEvent);
            script.addEventListener('error',setStateFromEvent)
        }
        return ()=>{
            if(script){
                script.removeEventListener('load',setStateFromEvent);
                script.removeEventListener('error',setStateFromEvent);
            }
        }
    }, [id]);
    return status;
}
export function usePaypalCardFields(method_id : string|number,sdk : string){
    const status =  useScript(sdk,{
        id : 'paypal-card-sdk',
    })
    const valuesRef = useRef<any>(null);
    const fields = useMemo(() => {
        if(!window.paypal || !['ready',].includes(status)) return null;
        import.meta.env.DEV && console.log('card fields :',window.paypal.CardFields);
        return window.paypal.CardFields?.({
            style: {
                input: {
                    padding:'0.6rem',
                },
            },
            createOrder: (data : any,...args : any[]) => {
                return api({
                    method : "POST",
                    url : getFinalPath(`/api/gateways/${method_id}/create`),
                    data : {
                        token : valuesRef.current.token,
                        billing_address: valuesRef.current.billing_address,
                    }
                }).then((json) => json.order_id); // Return the order ID
            },
            onError: function(err : any,...args : any[]) {
                Bus.emit('payment:error',true);
                const url = err?.data?.url as string;
                if(url){
                    const matches = url.match(/orders\/([^\/]+)\//im)
                    if(matches?.[1]){
                        return api({
                            url: getFinalPath(`/api/gateways/${method_id}/fail`),
                            method: 'POST',
                            data: {
                                order_id : matches[1],
                                error : err?.data || {},
                            },
                        });
                    }
                }
                console.error('PayPal CardFields Error:', err,...args);
            },
            onApprove: (data : any,...args : any[]) => {
                import.meta.env.DEV &&  console.log('paypal card approve',data,...args);
                return api({
                    method : 'POST',
                    url : getFinalPath(`/api/gateways/${method_id}/approve/${data.orderID}`),
                }).then((json) => {
                    import.meta.env.DEV && console.log('paypal card approve json:',json);
                    if(json.redirect){
                        return PromiseLocation(json.redirect);
                    }
                    if(json.error){
                        Bus.emit('payment:error',json.message || true);
                    }
                });
            },
        });
    }, [status]);
    useBusListener('payment:submit', async (values :any) => {
        if(!fields){
            console.log('paypal card field not setup');
            return;
        }
        if(!!valuesRef.current) return;
        Bus.emit('payment:error',false);
        const state = await fields.getState();
        if (!state.isFormValid) {
            throw ('Invalid card data');
        }
        try{
            valuesRef.current = values;
            const params  : any= {};
            if(!isEmpty(values?.billing_address)){
                const vba : any = {};
                Object.keys(map).forEach((key) => {
                    const path = map[key];
                    const value = get(values,`billing_address.${path}`,null);
                    if(!!value){
                        vba[key] = value;
                    }
                });
                if(!isEmpty(vba)){
                    params['billingAddress'] = vba;
                }
            }
            import.meta.env.DEV && console.log('submit paypal card params:',params);
            const result = await fields.submit(params);
            import.meta.env.DEV && console.log('paypal card result:',result);
        }catch(e){
            console.error('paypal card error:',e);
            Bus.emit('payment:error',true);
            throw e;
        }finally {
            valuesRef.current = null;
        }
    });
    return fields;
}
