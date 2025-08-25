import {useCurrentForm} from "../../../container/FormContext.ts";
import {useWatch} from "rc-field-form";
import {useEffect} from "react";
import {useUpdateContactInformation} from "./useUpdateContactInformation.ts";
import {useDebounceCallback} from "usehooks-ts";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useSummary} from "./useSummary.tsx";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";

export function useSyncDeliveryGroups(){
    const {json} = useSummary();
    const checkout  = getCheckoutFromSummary(json,'cart');
    const form = useCurrentForm();
    const region = useWatch(['shipping_address','region',],form);
    const fn = useUpdateContactInformation();
    const sync = useCheckoutSync();
    const callback = useDebounceCallback(async(code) => {
        await fn({
            variables : {
                id : checkout.shipping_address_id || "gid://shopify/CartSelectableAddress/0",
                create : !checkout.shipping_address_id,
                updateBuyer : false,
                buyerIdentity : {},
                delivery : {
                    countryCode : region.code,
                }
            }
        });
        await sync();
    });
    useEffect(() => {
        console.log('region changed:',region?.code);
        callback(region?.code);
    }, [region?.code,callback]);
}
