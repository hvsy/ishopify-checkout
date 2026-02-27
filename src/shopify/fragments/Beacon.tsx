import {FC,} from "react";
import {useEventCallback, useEventListener} from "usehooks-ts";
import {useCurrentForm} from "../../container/FormContext.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {getBeacon} from "../lib/getBeacon.ts";
import {usePaymentContext} from "../../container/PaymentContext.tsx";
import {get as _get} from "lodash-es";
import {useSummary} from "../checkouts/hooks/useSummary.tsx";
import {useShopifyCheckoutLoading} from "../context/ShopifyCheckoutContext.tsx";

export type BeaconProps = {
    context : string;
};

export const Beacon: FC<BeaconProps> = (props) => {
    const {context} = props;
    const form = useCurrentForm();
    const cart = useCartStorage();
    const ctx = usePaymentContext();
    import.meta.env.DEV && console.log('payment progress:',ctx?.progress);

    const {loading} = useSummary();
    const checkoutLoading = useShopifyCheckoutLoading();
    const callback = useEventCallback(() => {
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
    useEventListener('unload', callback);
    return null;
};
