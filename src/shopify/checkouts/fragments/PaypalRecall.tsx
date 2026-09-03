import {FC} from "react";
import {useCart} from "@hooks/useCart.ts";
import {PaypalButton} from "../../fragments/PaypalButton.tsx";
import {api,} from "@lib/api.ts";
import {Bus} from "../../../bus.tsx";

export type PaypalRecallProps = {
    onErrorCallback ?: (message : string)=>void;
};

export const PaypalRecall: FC<PaypalRecallProps> = (props) => {
    const {onErrorCallback} = props;
    const {api: cartApi} = useCart();
    return <PaypalButton
        title={null}
        onClick={async () => {
        const res = await api({
            method : "post",
            'url' : cartApi + '/recall'
        });
        if(!res){
            onErrorCallback?.("");
        }
        if(!!res?.code){
            try {
                await Bus.emitAsync("discount:apply",res.code);
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                onErrorCallback?.(message || 'Apply Discount code error');
                return;
            }
            await Bus.emitAsync("payment:redirect:paypal");
        }
        if(!!res?.error){
            onErrorCallback?.(res.message);
        }
    }} />
};
