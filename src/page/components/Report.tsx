import { CurrencyContext } from "@/container/CurrencyContext";
import {ReactNode, useEffect, useMemo} from "react";
import {CheckoutContainer} from "../../container/CheckoutContext.ts";
import {eventId} from "@lib/uuid.ts";

export type ReportProps<key extends ReportEvent> = {
    name: key;
    data: Omit<Analytics.Events[key]['data'],"currency"|"price">;
    price ?: string;
    token : string;
};

export function Report<key extends ReportEvent>(props : ReportProps<key>) : ReactNode{
    const {price,token,data,name} = props;
    // const id = useMemo(() => {
    //
    // },[]);
    if(price !== undefined){
        const cry= CurrencyContext.use()!;
        const checkout = CheckoutContainer.use();
        const shop_currency = checkout?.shop.currency!;
        (data as any).currency = cry.code;
        if(!price){
            (data as any).price = 0;
        }else{
            const floatPrice = parseFloat(price + '');
            (data as any).price = cry.code === shop_currency.code ? floatPrice : (floatPrice * (parseFloat(cry.rate) || 1)) / (parseFloat(shop_currency.rate) || 1);
        }
    }
    useEffect(() => {
            window?.report?.(name,data as unknown as Omit<Analytics.Events[key]["data"], "eventId">,
                token + '_' + name);
    }, [token,name]);
    return null;
};
