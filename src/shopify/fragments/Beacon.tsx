import {FC, useRef,} from "react";
import {useEventCallback, useEventListener} from "usehooks-ts";
import {useCurrentForm} from "../../container/FormContext.ts";
import {useCart} from "@hooks/useCart.ts";
import {getBeacon} from "../lib/getBeacon.ts";
import {usePaymentContext} from "../../container/PaymentContext.tsx";
import {useSummary} from "../checkouts/hooks/useSummary.tsx";
import {useShopifyCheckoutLoading} from "../context/ShopifyCheckoutContext.tsx";
import {Features} from "@lib/flags.ts";

export type BeaconProps = {
    context : string;
};

const DisableUnload = Features.includes("beacon:disable:unload")
export const Beacon: FC<BeaconProps> = (props) => {
    const {context} = props;
    const form = useCurrentForm();
    const cart = useCart();
    const ctx = usePaymentContext();
    import.meta.env.DEV && console.log('payment progress:',ctx?.progress);

    const {loading} = useSummary();
    const checkoutLoading = useShopifyCheckoutLoading();
    const documentRef = useRef<Document>(document);
    const callback = useEventCallback(() => {
        if(DisableUnload){
            if(document.visibilityState !== 'hidden') return;
        }
        try{
            const data = getBeacon(form,context);
            if(!!data){
                const blob = new Blob([JSON.stringify({
                    ...data,
                    summary_loading : loading?.summary,
                    shipping_methods_loading : loading?.shipping_methods,
                    checkout_loading : checkoutLoading,
                    step : ctx?.progress,
                })], {type: 'application/json'});
                navigator.sendBeacon(cart.beacon, blob);
            }
        }catch(e){
            console.error(e);
        }

    });
    if(DisableUnload){
        useEventListener('visibilitychange', callback,documentRef);
    }else{
        useEventListener('unload', callback);
    }
    return null;
};
