import {useScript} from "usehooks-ts";
import {useMemo, useRef} from "react";
import {Bus, useBusListener} from "../../bus.tsx";
import {PromiseLocation} from "../../shopify/lib/payment.ts";
import {api} from "@lib/api.ts";

export function usePaypalCardFields(method_id : string|number,sdk : string){
    const status =  useScript(sdk,{
        id : 'paypal-card',
    })
    const valuesRef = useRef<any>(null);
    const fields = useMemo(() => {
        if(!window.paypal || status !== 'ready') return null;
        return window.paypal.CardFields?.({
            style: {
                input: {
                    padding:'0.6rem',
                },
            },
            createOrder: (data : any,...args : any[]) => {
                return api({
                    method : "POST",
                    url : `/a/s/api/gateways/${method_id}/create`,
                    data : {
                        token : valuesRef.current.token,
                        billing_address: valuesRef.current.billing_address,
                    }
                }).then((json) => json.order_id); // Return the order ID
            },
            onError: function(err : any,...args : any[]) {
                const url = err?.data?.url as string;
                if(url){
                    const matches = url.match(/orders\/([^\/]+)\//im)
                    if(matches?.[1]){
                        return api({
                            url: `/a/s/api/gateways/${method_id}/fail`,
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
                console.log('paypal card approve',data,...args);
                return api({
                    method : 'POST',
                    url : `/a/s/api/gateways/${method_id}/approve/${data.orderID}`,
                }).then((json) => {
                    console.log('paypal card approve json:',json);
                    if(json.redirect){
                        return PromiseLocation(json.redirect);
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
            const result = await fields.submit();
            console.log('paypal card result:',result);
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
